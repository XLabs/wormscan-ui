import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ChainId,
  chainIdToChain,
  chainToChainId,
  deserialize,
  encoding,
  Network,
  UniversalAddress,
} from "@wormhole-foundation/sdk";
import { BaseLayout } from "src/layouts/BaseLayout";
import { useLocalStorage, useNavigateCustom } from "src/utils/hooks";
import analytics from "src/analytics";
import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import {
  JsonText,
  Loader,
  NavLink,
  Tooltip,
  CopyContent,
  BlockchainIcon,
  Select,
} from "src/components/atoms";
import {
  AlertTriangle,
  CheckIcon,
  CopyIcon,
  InfoCircleIcon,
  LinkIcon,
  SearchIcon,
  TriangleDownIcon,
} from "src/icons/generic";
import { InputEncodedVaa, CopyToClipboard } from "src/components/molecules";
import { getChainIcon, getChainName } from "src/utils/wormhole";
import { getGuardianSet, txType } from "src/consts";
import { formatDate } from "src/utils/date";
import { useParams } from "react-router-dom";
import { useEnvironment } from "src/context/EnvironmentContext";

import {
  allKeys,
  deepCloneWithBigInt,
  getNestedProperty,
  stringifyWithBigInt,
  stringifyWithStringBigInt,
} from "src/utils/object";
import { Submit } from "./Submit";
import { processInputValue, processInputType, waitForElement, isHex } from "src/utils/parser";
import { ChainFilterMainnet, ChainFilterTestnet } from "../Txs/Information/Filters";
import { Cross2Icon } from "@radix-ui/react-icons";
import { toast } from "react-toastify";
import "./styles.scss";
import { sendProtocolSubmission } from "src/utils/cryptoToolkit";

const SubmitYourProtocol = () => {
  // useEffect(() => {
  //   analytics.page({ title: "SUBMIT_PROTOCOL" });
  // }, []);

  const { environment } = useEnvironment();

  const params = useParams();
  const vaaParam = params?.["*"];
  const navigate = useNavigateCustom();

  const inputTxRef = useRef(null);

  const [inputs, setInputs] = useState<Array<string>>(null);
  const [inputsIndex, setInputsIndex] = useState(0);

  const [input, setInput] = useState(processInputValue(vaaParam));
  const [inputType, setInputType] = useState(processInputType(vaaParam));
  const [txSearch, setTxSearch] = useState("");

  const [parsedRaw, setParsedRaw] = useState(false);
  const [resultRaw, setResultRaw] = useState<any>(null);
  const [hideJson, setHideJson] = useState(false);

  const [step, setStep] = useState(1);

  const resetResult = () => {
    setInputs(null);
    setInputsIndex(0);
    setInput("");
    setTxSearch("");
    setResultRaw(null);

    resetSubmitFields();
    navigate("/developers/submit");
  };

  const collapseGuardianSignatures = () => {
    setTimeout(() => {
      document.querySelectorAll(".json-view-key").forEach(a => {
        if (a.innerHTML?.includes("guardianSignatures")) {
          const parentElement = a.parentElement;
          const collapse = parentElement.children?.[0] as HTMLElement;

          if (collapse) collapse.click();
        }
      });
    }, 50);
  };

  const renderExtras = useCallback(() => {
    waitForElement(".json-view-key")
      .then(() => {
        document.querySelectorAll(".added-stuff").forEach(a => a.remove());

        // Add collapse/expand behaviour
        document.querySelectorAll(".json-view-collapseIcon").forEach(a => {
          const renderAtCollapse = (ev: MouseEvent) => {
            ev.preventDefault();
            ev.stopPropagation();

            if (a.getAttribute("isCollapsed") !== "true") {
              a.setAttribute("isCollapsed", "true");

              a.parentElement.childNodes.forEach(block => {
                if ((block as HTMLElement).tagName === "DIV") {
                  (block as HTMLElement).style.display = "none";
                  (a as HTMLElement).style.transform = "rotate(-90deg)";
                }
              });
            } else {
              a.setAttribute("isCollapsed", "false");

              a.parentElement.childNodes.forEach(block => {
                if ((block as HTMLElement).tagName === "DIV") {
                  (block as HTMLElement).style.display = "block";
                  (a as HTMLElement).style.transform = "rotate(0deg)";
                }
              });
            }
          };

          (a as HTMLElement).removeEventListener("click", renderAtCollapse);
          (a as HTMLElement).addEventListener("click", renderAtCollapse);
        });

        // Add texts to enhace information
        document.querySelectorAll(".json-view-key").forEach(a => {
          const parentElement = a.parentElement;

          // Add chain names and icon to decoded VAA
          if (
            a.innerHTML?.includes("chain") ||
            a.innerHTML?.includes("emitterChain") ||
            a.innerHTML?.includes("fromChain") ||
            a.innerHTML?.includes("recipientChain") ||
            a.innerHTML?.includes("refundChainId") ||
            a.innerHTML?.includes("targetChainId") ||
            a.innerHTML?.includes("sourceChainId") ||
            a.innerHTML?.includes("destChainId") ||
            a.innerHTML?.includes("toChain") ||
            a.innerHTML?.includes("tokenChain") ||
            a.innerHTML?.includes("feeChain")
          ) {
            const chainId = +parentElement.children?.[1]?.innerHTML as ChainId;

            const chain = getChainName({
              chainId: chainId,
              network: environment.network,
            });

            if (chain) {
              const reactContainer = document.createElement("span");
              reactContainer.classList.add("added-stuff");
              const root = createRoot(reactContainer);

              parentElement?.appendChild(reactContainer);

              const chainIcon = getChainIcon({ chainId });
              root.render(
                <div className="chain-icon">
                  <img
                    src={chainIcon}
                    alt={`${chain} icon`}
                    loading="lazy"
                    width={16}
                    height={16}
                  />
                  <span>{` (${chain})`}</span>
                </div>,
              );
            }
          }

          // Add payload types to decoded VAA
          if (a.innerHTML?.includes("payloadType")) {
            const type = txType[+parentElement.children?.[1]?.innerHTML] ?? false;

            if (type) {
              const reactContainer = document.createElement("span");
              reactContainer.classList.add("added-stuff");
              const root = createRoot(reactContainer);

              parentElement?.appendChild(reactContainer);
              root.render(<span style={{ marginLeft: 4 }}>{` (${type})`}</span>);
            }
          }

          // Add timestamps as texts in decoded VAA
          if (a.innerHTML?.includes("timestamp")) {
            const timestamp = parentElement.children?.[1]?.innerHTML?.replaceAll('"', "");

            const time = new Date(isNaN(+timestamp) ? timestamp : +timestamp * 1000);
            const formatted = formatDate(time);

            if (formatted) {
              const TimestampTooltip = () => (
                <Tooltip
                  tooltip={
                    <div>
                      This is the timestamp of the block on the blockchain which emitted this VAA,
                      not the time the VAA was signed by the guardians.
                    </div>
                  }
                  type="info"
                >
                  <div className="copy-item">
                    <InfoCircleIcon width={24} />
                  </div>
                </Tooltip>
              );

              const reactContainer = document.createElement("span");
              reactContainer.classList.add("copy-item");
              reactContainer.classList.add("added-stuff");
              const root = createRoot(reactContainer);

              a.parentElement?.appendChild(reactContainer);
              root.render(
                <>
                  <span>{` // ${formatted}`}</span>
                  <TimestampTooltip />
                </>,
              );
            }
          }
        });

        // Add a copy to clipboard to strings and numbers (single values)
        document.querySelectorAll(".json-view-string, .json-view-number").forEach(text => {
          if (text.innerHTML?.length > 15) {
            const reactContainer = document.createElement("span");
            reactContainer.classList.add("copy-item");
            reactContainer.classList.add("added-stuff");

            const parentElement = text.parentElement;
            parentElement.appendChild(reactContainer);

            const root = createRoot(reactContainer);
            const toCopy =
              text.innerHTML.startsWith('"') && text.innerHTML.endsWith('"')
                ? text.innerHTML.slice(1, -1)
                : text.innerHTML;
            root.render(<CopyContent text={toCopy} />);
          }
        });

        // Add a copy to clipboard to objects and arrays (multiple values)
        document.querySelectorAll(".json-view-collapseIcon").forEach(item => {
          const parentElement = item.parentElement;

          if (parentElement?.parentElement?.parentElement?.className === "json-view") return;

          const reactContainer = document.createElement("span");
          reactContainer.classList.add("copy-item");
          reactContainer.classList.add("added-stuff");

          const whichChild = parentElement.children[1].className === "json-view-key" ? 3 : 2;
          const childElement = parentElement.children[whichChild];

          parentElement.insertBefore(reactContainer, childElement);

          const root = createRoot(reactContainer);

          let textToCopy = parentElement.innerText.replace(/"[^"]*":/, "");
          if (textToCopy.endsWith(",")) textToCopy = textToCopy.slice(0, -1);

          root.render(<CopyContent text={textToCopy} />);
        });

        collapseGuardianSignatures();
      })
      .catch(_err => {});
  }, [environment.network]);

  const CHAIN_LIST = (network: Network) =>
    orderedChains[network].map(chainId => ({
      icon: (
        <BlockchainIcon
          background="var(--color-white-10)"
          chainId={chainId}
          colorless
          lazy={false}
          network={environment.network}
          size={24}
        />
      ),
      label: getChainName({ network: environment.network, chainId }),
      value: String(chainId),
    }));

  const [selectedIdentifiers, setSelectedIdentifiers] = useLocalStorage<IIdentifier[]>(
    "selectedIdentifiers",
    [],
  );

  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [selectedChain, setSelectedChain] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");

  const [vaaSubmit, setVaaSubmit] = useState<any>(null);
  const [propertyName, setPropertyName] = useState("");
  const [finishedParsings, setFinishedParsing] = useState([]);
  const [parsedVAA, setParsedVAA] = useState<{
    parsedPayload: any;
    userLayout: any;
  }>(null);

  const resetSubmitFields = () => {
    setResultRaw({});
    setFinishedParsing([]);
    setParsedVAA(null);
    setVaaSubmit(null);
    setPropertyName(null);
  };

  useEffect(() => {
    if (!!parsedVAA) {
      if (!!finishedParsings.length) {
        setResultRaw({
          ...resultRaw,
          payload: {
            ...resultRaw.payload,
            [propertyName.replace("payload.", "")]: parsedVAA.parsedPayload,
          },
        });
      } else {
        setResultRaw({ ...resultRaw, payload: parsedVAA.parsedPayload });
      }

      setStdProperties({
        tokenChain: null,
        tokenAddress: null,
        amount: null,
        feeChain: null,
        feeAddress: null,
        fee: null,
        fromChain: null,
        fromAddress: null,
        toChain: null,
        toAddress: null,
      });
      setFinishedParsing([
        ...finishedParsings,
        {
          payload: vaaSubmit,
          userLayout: parsedVAA.userLayout,
          parsedPayload: parsedVAA.parsedPayload,
        },
      ]);
      setVaaSubmit(null);
      setParsedVAA(null);
      renderExtras();
    }
  }, [finishedParsings, parsedVAA, propertyName, renderExtras, resultRaw, vaaSubmit]);

  const getGuardianName = (guardianSet: number, index: number) => {
    const guardianSetList = getGuardianSet(guardianSet);
    return guardianSetList?.[index]?.name;
  };

  useEffect(() => {
    try {
      const vaaBuffer = Buffer.from(input, "base64");
      const parsedVaa = deserialize("Uint8Array", vaaBuffer);

      const guardianSignatures = parsedVaa.signatures.map(sig => ({
        index: sig.guardianIndex,
        signature: encoding.b64.encode(sig.signature.encode()),
      }));

      const { emitterAddress, hash, sequence, guardianSet, emitterChain } = parsedVaa || {};

      const parsedEmitterAddress = emitterAddress.toNative(emitterChain).toString();
      const parsedHash = Buffer.from(hash).toString("hex");
      const parsedSequence = Number(sequence);
      const parsedGuardianSignatures = guardianSignatures?.map(({ index, signature }) => ({
        index,
        signature: Buffer.from(signature).toString("hex"),
        name: getGuardianName(guardianSet, index),
      }));

      const parsedVaaAny = parsedVaa as any;
      delete parsedVaaAny.signatures;

      const payloadToShow =
        finishedParsings.length === 2
          ? {
              ...finishedParsings[0].parsedPayload,
              [propertyName.replace("payload.", "")]: finishedParsings[1].parsedPayload,
            }
          : finishedParsings.length === 1
          ? finishedParsings[0].parsedPayload
          : parsedVaa.payload
          ? Buffer.from(parsedVaa.payload).toString("hex")
          : null;

      setResultRaw({
        ...parsedVaaAny,
        payload: payloadToShow,
        emitterAddress: parsedEmitterAddress,
        emitterChain: chainToChainId(parsedVaa.emitterChain),
        guardianSignatures: parsedGuardianSignatures,
        hash: parsedHash,
        sequence: parsedSequence,
      });

      setParsedRaw(true);

      renderExtras();
    } catch (e) {
      setResultRaw(null);
    }
  }, [finishedParsings, input, propertyName, renderExtras]);

  const { isLoading: isLoadingTx, isFetching: isFetchingTx } = useQuery(
    ["getOperations", txSearch],
    async () => {
      const isVaaID = txSearch.split("/")?.length === 3;
      const send = isVaaID ? { vaaID: txSearch } : { txHash: txSearch };

      // check current network and return if it is
      let currentNetworkResponse;
      try {
        currentNetworkResponse = await getClient().guardianNetwork.getOperations(send);
      } catch {
        //
      }
      if (!!currentNetworkResponse?.length) return currentNetworkResponse;

      // if no result, check other network and make the switch
      const otherNetwork = environment.network === "Mainnet" ? "Testnet" : "Mainnet";
      const otherNetworkResponse = await getClient(otherNetwork).guardianNetwork.getOperations(
        send,
      );

      if (!!otherNetworkResponse?.length) {
        navigate(`/developers/submit?network=${otherNetwork}`);
      }

      return [];
    },
    {
      retry: 0,
      enabled: !!txSearch && !input,
      onSuccess: data => {
        if (data.length && data[0].vaa?.raw) {
          const rawVAA = data[0].vaa?.raw;

          setInput(rawVAA);

          const multiple = data.map(a => a.vaa?.raw).filter(a => !!a);

          if (multiple.length > 1) {
            setInputs(multiple);
            setInputsIndex(0);
          }

          inputTxRef.current?.blur();
          // navigate(`/developers/submit/operation/${txSearch}`, { replace: true });
        }
      },
    },
  );

  const VAA_ID =
    resultRaw?.sequence && resultRaw?.emitterChain && resultRaw?.emitterAddress
      ? `${resultRaw?.emitterChain}/${resultRaw?.emitterAddress}/${resultRaw?.sequence}`
      : "";

  const isLoading = isLoadingTx || isFetchingTx;

  const whatToParse = useCallback(() => {
    if (!resultRaw) return [];

    const parsingInternalPayload = typeof resultRaw?.payload === "object";

    const resultEntries = resultRaw
      ? parsingInternalPayload
        ? Object.entries(resultRaw?.payload)
        : Object.entries(resultRaw)
      : null;

    if (!!resultEntries?.length) {
      const parsables = resultEntries
        .map(([key, value]) => {
          if (value && typeof value === "string" && isHex(value.replaceAll('"', ""))) {
            if (key === "hash") return null;
            return [parsingInternalPayload ? "payload." + key : key, value];
          }
          return null;
        })
        .filter(a => a !== null);

      return parsables;
    }
    return [];
  }, [resultRaw]);

  const [selectedPropertyName, setSelectedPropertyName] = useState("");
  const [stdProperties, setStdProperties] = useState({
    tokenChain: null,
    tokenAddress: null,
    amount: null,
    feeChain: null,
    feeAddress: null,
    fee: null,
    fromChain: null,
    fromAddress: null,
    toChain: null,
    toAddress: null,
  });

  const [parsedStandardizedProperties, setParsedStandardizedProperties] = useState<any>({});

  useEffect(() => {
    const newParsedStandardizedProperties: any = {};

    // parsing fields that don't depend on other fields
    Object.entries(stdProperties).forEach(([key, valueName]) => {
      const parsedPayload = `${valueName}`.startsWith(propertyName)
        ? finishedParsings?.[1]?.parsedPayload
        : finishedParsings?.[0]?.parsedPayload;

      if (!parsedPayload) return;

      const object_access = valueName?.startsWith(propertyName)
        ? valueName.replace(propertyName + ".", "")
        : valueName;

      const value = getNestedProperty(parsedPayload, object_access);

      if (
        key === "tokenAddress" ||
        key === "toAddress" ||
        key === "feeAddress" ||
        key === "fromAddress"
      ) {
        return;
      }

      if (value) {
        newParsedStandardizedProperties[key] = value;
      }
    });

    // parsing fields that depend on other fields (parsed above)
    Object.entries(stdProperties).forEach(([key, valueName]) => {
      const parsedPayload = `${valueName}`.startsWith(propertyName)
        ? finishedParsings?.[1]?.parsedPayload
        : finishedParsings?.[0]?.parsedPayload;

      if (!parsedPayload) return;

      const object_access = valueName?.startsWith(propertyName)
        ? valueName.replace(propertyName + ".", "")
        : valueName;

      let value = getNestedProperty(parsedPayload, object_access);

      if (
        key !== "tokenAddress" &&
        key !== "toAddress" &&
        key !== "feeAddress" &&
        key !== "fromAddress"
      ) {
        return;
      }

      if (key === "toAddress" && valueName) {
        value = new UniversalAddress(value)
          ?.toNative(chainIdToChain(newParsedStandardizedProperties["toChain"]))
          ?.toString();
      }

      if (key === "tokenAddress" && valueName) {
        const chainToUse = newParsedStandardizedProperties["tokenChain"]
          ? newParsedStandardizedProperties["tokenChain"]
          : resultRaw?.emitterChain;

        if (!newParsedStandardizedProperties["tokenChain"]) {
          newParsedStandardizedProperties.tokenChain = resultRaw?.emitterChain;
        }
        value = new UniversalAddress(value)?.toNative(chainIdToChain(chainToUse))?.toString();
      }

      if (key === "feeAddress" && valueName) {
        const chainToUse = newParsedStandardizedProperties["feeChain"]
          ? newParsedStandardizedProperties["feeChain"]
          : resultRaw?.emitterChain;

        if (!newParsedStandardizedProperties["feeChain"]) {
          newParsedStandardizedProperties.feeChain = resultRaw?.emitterChain;
        }
        value = new UniversalAddress(value)?.toNative(chainIdToChain(chainToUse))?.toString();
      }

      if (key === "fromAddress" && valueName) {
        const chainToUse = newParsedStandardizedProperties["fromChain"]
          ? newParsedStandardizedProperties["fromChain"]
          : resultRaw?.emitterChain;

        if (!newParsedStandardizedProperties["fromChain"]) {
          newParsedStandardizedProperties.fromChain = resultRaw?.emitterChain;
        }
        value = new UniversalAddress(value)?.toNative(chainIdToChain(chainToUse))?.toString();
      }

      if (value) {
        newParsedStandardizedProperties[key] = value;
      }
    });

    // add appIds
    const appIds = [];
    if (finishedParsings?.[0]?.parsedPayload?.callerAppId)
      appIds.push(finishedParsings[0].parsedPayload.callerAppId);
    if (finishedParsings?.[1]?.parsedPayload?.callerAppId)
      appIds.push(finishedParsings[1].parsedPayload.callerAppId);
    newParsedStandardizedProperties.appIds = appIds;

    setParsedStandardizedProperties(newParsedStandardizedProperties);
    if (step === 3) renderExtras();
  }, [finishedParsings, propertyName, renderExtras, resultRaw?.emitterChain, stdProperties, step]);

  const [addedVAAs, setAddedVAAs] = useState([]);
  const [lastVaaInput, setLastVaaInput] = useState("");
  const [lastMoreInfo, setLastMoreInfo] = useState("");

  const isPortal =
    finishedParsings[0] &&
    JSON.stringify(finishedParsings[0].userLayout).startsWith(
      `[{"inputName":"payloadId","selected":"payloadId","id":"3"},{"inputName":"amount","selected":"amount"},{"inputName":"tokenAddress","selected":"address"},{"inputName":"tokenChain","selected":"chain"},{"inputName":"toAddress","selected":"address"},{"inputName":"toChain","selected":"chain"},{"inputName":"fromAddress","selected":"address"},`,
    );

  let payloadOptionsStd = finishedParsings[0] ? finishedParsings[0].parsedPayload : null;
  if (isPortal) {
    payloadOptionsStd = deepCloneWithBigInt(finishedParsings[0].parsedPayload);
    delete payloadOptionsStd.payloadId;
    delete payloadOptionsStd.amount;
    delete payloadOptionsStd.tokenAddress;
    delete payloadOptionsStd.tokenChain;
    delete payloadOptionsStd.toAddress;
    delete payloadOptionsStd.toChain;
    delete payloadOptionsStd.fromAddress;
  }

  const sendProtocol = async () => {
    const submitResponse = await sendProtocolSubmission({
      input,
      resultRaw: stringifyWithStringBigInt(resultRaw),
      finishedParsings: stringifyWithStringBigInt(finishedParsings),
      parsedStandardizedProperties: stringifyWithStringBigInt(parsedStandardizedProperties),
      lastMoreInfo,
      addedVAAs: stringifyWithStringBigInt(addedVAAs),
      selectedIdentifiers: stringifyWithStringBigInt(selectedIdentifiers),
      stdProperties: JSON.stringify(stdProperties),
      propertyName,
    });

    if (submitResponse === "OK") {
      setStep(5);
    } else {
      toast("Something went wrong submitting your protocol");
    }
  };

  return (
    <BaseLayout secondaryHeader>
      <div className="devtools-page">
        <div className="devtools-page-container">
          <h1 className="devtools-page-title">Submit Your Protocol</h1>
          <h2 className="devtools-page-description">
            The Submit your Protocol tool allows Wormhole Integrators to parse a VAA payload of
            their own so WormholeScan can later parse that kind of VAAs and show better information
            regarding those transactions or messages.
          </h2>

          <div className="devtools-page-body">
            <div className="parse">
              {step > 1 && step < 5 && (
                <div
                  className="parse-submit-btn"
                  style={{ marginBottom: 16 }}
                  onClick={() => {
                    setStep(step - 1);
                    window.scrollTo(0, 0);
                  }}
                >
                  Prev Step
                </div>
              )}

              {step === 1 && (
                <>
                  <h1 className="devtools-page-title">(1/4) How can we identify your VAAs?</h1>
                  <div className="parse-submit">
                    <div className="parse-submit-description">
                      Give us your emitter addresses or contract addresses that we can use to
                      identify your VAAs
                    </div>

                    {selectedIdentifiers.map((identifier, idx) => {
                      return (
                        <div key={idx} className="parse-submit-identifiers">
                          <div>{identifier.network}</div>

                          <div className="parse-submit-identifiers-chain">
                            {chainIdToChain(identifier.chain)}
                            <BlockchainIcon
                              chainId={identifier.chain}
                              network={identifier.network}
                            />
                          </div>

                          <div>{identifier.address}</div>

                          <div
                            onClick={() => {
                              const newIdentifiers = [...selectedIdentifiers];
                              newIdentifiers.splice(idx, 1);

                              setSelectedIdentifiers(newIdentifiers);
                            }}
                            className="parse-submit-identifiers-delete"
                          >
                            <Cross2Icon width={20} height={20} />
                          </div>
                        </div>
                      );
                    })}

                    <div className="parse-submit-chainAddress">
                      <Select
                        ariaLabel="Select Network"
                        items={NETWORK_LIST}
                        isMulti={false}
                        name="submitNetwork"
                        onValueChange={value => {
                          setSelectedChain(null);
                          setSelectedNetwork(value);
                        }}
                        placeholder="Network"
                        optionStyles={{ padding: 16 }}
                        text={
                          <div className="filters-container-select-text">
                            {selectedNetwork?.label || "Network"}
                          </div>
                        }
                        value={selectedNetwork}
                        closeOnSelect
                      />

                      {selectedNetwork && (
                        <Select
                          ariaLabel="Select Chain"
                          items={CHAIN_LIST(selectedNetwork.value)}
                          isMulti={false}
                          name="submitEmitterOrTarget"
                          onValueChange={(value: any) => {
                            setSelectedChain(value);
                          }}
                          optionStyles={{ padding: 16 }}
                          text={
                            <div className="filters-container-select-text">
                              {selectedChain && selectedChain?.icon}
                              {selectedChain ? selectedChain?.label : "Chain"}
                            </div>
                          }
                          type="searchable"
                          value={selectedChain}
                          closeOnSelect
                        />
                      )}

                      <input
                        className="parse-submit-input"
                        placeholder="address"
                        value={selectedAddress}
                        onChange={e => setSelectedAddress(e.target.value)}
                      />
                    </div>

                    <div
                      onClick={() => {
                        if (selectedAddress && selectedChain && selectedNetwork) {
                          setSelectedIdentifiers([
                            ...selectedIdentifiers,
                            {
                              network: selectedNetwork.value,
                              chain: selectedChain.value,
                              address: selectedAddress,
                            },
                          ]);

                          setSelectedChain(null);
                          setSelectedAddress("");
                        } else {
                          toast("Missing some info", {
                            type: "error",
                            theme: "dark",
                          });
                        }
                      }}
                      className="parse-submit-btn"
                    >
                      ADD
                    </div>
                    <div
                      onClick={() => {
                        if (!!selectedIdentifiers.length) {
                          setStep(2);
                          window.scrollTo(0, 0);
                        }
                      }}
                      className="parse-submit-btn down"
                    >
                      Next step
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <br />
                  <h1 className="devtools-page-title">(2/4) Lets parse and decode a VAA</h1>

                  <div className="parse-txType">
                    <SearchIcon width={24} />
                    <input
                      type="text"
                      className={`parse-txType-input ${
                        txSearch && !input && !isLoading ? "error" : ""
                      }`}
                      id="parse-txType-input"
                      placeholder="txHash/vaaID of transaction created with your app"
                      ref={inputTxRef}
                      value={txSearch}
                      onChange={e => {
                        setInput("");
                        setInputs(null);
                        setInputsIndex(0);
                        resetSubmitFields();

                        setTxSearch(e.target.value);
                        inputTxRef?.current?.blur();
                      }}
                      name="txType-input"
                      aria-label="Transaction hash or VAA ID input"
                      spellCheck={false}
                    />
                  </div>

                  {txSearch && !input && !isLoading && (
                    <div className="parse-txType-error">
                      <AlertTriangle width={24} />
                      VAA cannot be found. Please try again or search something different.
                    </div>
                  )}

                  {txSearch && (
                    <div className="parse-links">
                      <button className="parse-links-reset" onClick={resetResult}>
                        Reset search result
                      </button>

                      {!!resultRaw && input && VAA_ID && (
                        <NavLink
                          className="parse-links-navlink"
                          target="_blank"
                          to={`/tx/${txSearch ? txSearch : VAA_ID}`}
                        >
                          <span>View transaction details</span>
                          <LinkIcon width={24} />
                        </NavLink>
                      )}
                    </div>
                  )}

                  {!!inputs?.length && (
                    <div className="parse-multiple">
                      <span className="parse-multiple-left">
                        <InfoCircleIcon width={24} />
                        This txHash has multiple VAAs.
                      </span>

                      <div
                        className="parse-multiple-right"
                        onClick={() => {
                          if (inputs[inputsIndex + 1]) {
                            setInput(inputs[inputsIndex + 1]);
                            setInputsIndex(inputsIndex + 1);
                          } else {
                            setInput(inputs[0]);
                            setInputsIndex(0);
                          }
                        }}
                      >
                        <span className="vaa-pages">
                          {inputsIndex + 1}/{inputs.length}
                        </span>
                        <TriangleDownIcon className="triangle-icon" width={18} />
                      </div>
                    </div>
                  )}

                  <InputEncodedVaa
                    input={input}
                    inputType={inputType}
                    setInput={setInput}
                    setInputType={setInputType}
                    setTxSearch={setTxSearch}
                    setInputs={setInputs}
                    setInputsIndex={setInputsIndex}
                    resetSubmitFields={resetSubmitFields}
                    page="submit"
                  />
                  <div className="parse-content">
                    <span
                      className={`parse-content-title ${hideJson ? "" : "rotate"}`}
                      onClick={() => setHideJson(!hideJson)}
                    >
                      Decoded VAA <TriangleDownIcon width={10} />
                    </span>

                    <div
                      className={`parse-result ${input ? "with-data" : ""} ${
                        hideJson ? "hide" : ""
                      }`}
                      id="parse-result"
                      aria-label="Parsed result"
                    >
                      <div className="parse-result-top">
                        <button
                          className={`parse-result-top-btn ${parsedRaw ? "active" : ""}`}
                          onClick={() => {
                            renderExtras();
                            setParsedRaw(true);
                          }}
                        >
                          Raw
                        </button>

                        <div className="parse-result-top-copy">
                          <CopyToClipboard
                            toCopy={
                              resultRaw && parsedRaw ? stringifyWithBigInt(resultRaw, 4) : "{}"
                            }
                          >
                            Copy all
                            <CopyIcon width={24} />
                          </CopyToClipboard>
                        </div>
                      </div>

                      <div className="parse-result-json">
                        {!resultRaw && !!input ? (
                          <span className="parse-result-not-found">Parsing failed</span>
                        ) : isLoading ? (
                          <Loader />
                        ) : (
                          <>
                            {!resultRaw && (
                              <div className="devtools-page-alert">
                                <div className="devtools-page-alert-info">
                                  <InfoCircleIcon width={24} />
                                  <p>Decoded VAA data will be displayed here</p>
                                </div>
                              </div>
                            )}

                            {!!resultRaw && input && VAA_ID && (
                              <div className="parse-result-json-text">
                                <JsonText data={resultRaw && parsedRaw ? resultRaw : {}} />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {step === 2 && (
            <>
              {finishedParsings.map(parsing => (
                <div key={parsing.payload} className="submit-finished-parsing">
                  <div>Finished parsing {parsing.parsedPayload?.callerAppId}</div>
                </div>
              ))}

              {vaaSubmit ? (
                <>
                  <Submit
                    renderExtras={renderExtras}
                    setParsedVAA={setParsedVAA}
                    resultRaw={vaaSubmit}
                  />
                  <div className="submit-start-parsing">
                    <div onClick={() => setVaaSubmit(null)} className="submit-btn">
                      CANCEL PARSING
                    </div>
                  </div>
                </>
              ) : (
                <div className="submit-start-parsing">
                  {whatToParse().map(([key, value]) => (
                    <div
                      onClick={() => {
                        setVaaSubmit(encoding.hex.decode(value));
                        setPropertyName(key);
                      }}
                      className="submit-btn showoff"
                      key={value}
                    >
                      START PARSING: {key}
                    </div>
                  ))}

                  {!!finishedParsings.length && !vaaSubmit && (
                    <div
                      onClick={() => {
                        setStep(3);
                        window.scrollTo(0, 0);
                      }}
                      className="submit-btn showoff"
                    >
                      Next step
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="devtools-page-title">(3/4) Standardized Properties</h1>

              <div className="submit-standard">
                <div className="submit-standard-description">
                  <p>
                    Standardized properties are properties that are usually displayed in the main
                    view of WormholeScan.
                  </p>
                  <p>
                    You can select a field of your payload and link it with one of the
                    standardizedProperties if it makes sense.
                  </p>
                  <p>
                    Example: If there{"'"}s a field in your VAA payload that represents a token that
                    was sent, you can press it and select tokenAddress
                  </p>
                  <p>
                    This step its optional but without selecting anything we are just going to be
                    able to show your info as raw data in the details of the transaction
                  </p>
                </div>

                <div className="submit-standard-container">
                  {allKeys(payloadOptionsStd).map(a => (
                    <div
                      key={a}
                      className="submit-btn"
                      style={{
                        outline: selectedPropertyName === a ? "green solid 2px" : "",
                      }}
                      onClick={() => {
                        setSelectedPropertyName(a);
                      }}
                    >
                      {a}
                    </div>
                  ))}
                  <br />
                  {finishedParsings[1] && (
                    <>
                      <div className="submit-standard-sub">{propertyName}:</div>

                      {allKeys(finishedParsings[1].parsedPayload).map(a => (
                        <div
                          key={a}
                          className="submit-btn"
                          style={{
                            outline:
                              selectedPropertyName === `${propertyName}.${a}`
                                ? "green solid 2px"
                                : "",
                          }}
                          onClick={() => {
                            setSelectedPropertyName(`${propertyName}.${a}`);
                          }}
                        >
                          {a}
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="submit-standard-container">
                  {Object.entries(stdProperties).map(([stdProp, stdValue]) => {
                    return (
                      <div className="submit-standard-container-props" key={stdProp}>
                        <Tooltip
                          tooltip={<div>{STANDARD_DESCRIPTIONS[stdProp]}</div>}
                          maxWidth={false}
                          type="info"
                        >
                          <div
                            className="submit-btn"
                            onClick={() => {
                              if (selectedPropertyName) {
                                if (stdProp === "toAddress" && !stdProperties.toChain) {
                                  toast("You need toChain first to modify toAddress", {
                                    type: "error",
                                    theme: "dark",
                                  });
                                  return;
                                }

                                setStdProperties({
                                  ...stdProperties,
                                  [stdProp]: selectedPropertyName,
                                });
                                setSelectedPropertyName("");
                              }
                            }}
                          >
                            {stdProp}
                          </div>
                        </Tooltip>

                        {stdValue && (
                          <div className="submit-standard-container-props-value">
                            <div>{"--> "}</div>
                            <div>{stdValue}</div>
                            <Cross2Icon
                              width={18}
                              height={18}
                              color="rgb(225, 50, 50)"
                              onClick={() => {
                                const newStdProperties: any = { ...stdProperties, [stdProp]: null };

                                if (stdProp === "toChain") {
                                  newStdProperties["toAddress"] = null;
                                }

                                setStdProperties(newStdProperties);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="submit-standard">
                <div className="submit-standard-container">
                  {finishedParsings.map((parsing, idx) => (
                    <div key={idx}>
                      <JsonText
                        data={{
                          parsedPayload: parsing.parsedPayload,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="submit-standard-container">
                  <div>
                    <JsonText
                      data={{
                        standardizedProperties: parsedStandardizedProperties,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setStep(4);
                  window.scrollTo(0, 0);
                }}
                style={{ marginTop: 12 }}
                className="submit-btn showoff"
              >
                Next step
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="devtools-page-title">(4/4) Tell us more</h1>

              <div className="submit-last">
                <div className="submit-last-title">
                  Add more VAAs or txHashes that contain this payload so we can test them out:
                </div>

                {addedVAAs.map((addedVAA, idx) => (
                  <div className="submit-last-inputContainer" key={addedVAA}>
                    <input
                      className="parse-submit-input"
                      placeholder="VAA / txHash"
                      value={addedVAA}
                      disabled
                    />
                    <div
                      className="submit-btn"
                      onClick={() => {
                        const newAddedVAAs = [...addedVAAs];
                        newAddedVAAs.splice(idx, 1);

                        setAddedVAAs(newAddedVAAs);
                      }}
                    >
                      REMOVE
                    </div>
                  </div>
                ))}

                <div className="submit-last-inputContainer">
                  <input
                    className="parse-submit-input"
                    placeholder="VAA / txHash"
                    value={lastVaaInput}
                    onChange={e => setLastVaaInput(e.target.value)}
                  />
                  <div
                    className="submit-btn"
                    onClick={() => {
                      setAddedVAAs([...addedVAAs, lastVaaInput]);
                      setLastVaaInput("");
                    }}
                  >
                    ADD
                  </div>
                </div>

                <br />
                <br />
                <div className="submit-last-title">
                  <p>
                    More information: Tell us everything you consider we need to know regarding this
                    protocol for better understanding and better implementation.
                  </p>

                  <p>
                    Ex. If there is some field in the payload that would be nice to show in the
                    overview of the transaction, or if some fields should be grouped in a object for
                    better understanding, etc.
                  </p>
                </div>

                <div className="submit-last-info">
                  <textarea
                    className="submit-last-info-input"
                    placeholder="info"
                    onChange={ev => setLastMoreInfo(ev.target.value.substring(0, 5000))}
                    value={lastMoreInfo}
                    aria-label="More Information text area"
                    draggable={false}
                    spellCheck={false}
                  />
                  <div className="submit-last-info-length">{lastMoreInfo.length} / 5000</div>
                </div>

                <br />
                <div onClick={sendProtocol} className="submit-btn showoff">
                  SUBMIT
                </div>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h1 className="devtools-page-title">Your protocol was submitted successfully!</h1>
              <CheckIcon width={40} />
            </>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default SubmitYourProtocol;

const orderedChains = {
  Mainnet: ChainFilterMainnet as ChainId[],
  Testnet: ChainFilterTestnet as ChainId[],
  Devnet: [] as ChainId[],
};

const NETWORK_LIST: { label: string; value: string }[] = [
  {
    label: "Mainnet",
    value: "Mainnet",
  },
  {
    label: "Testnet",
    value: "Testnet",
  },
];

const STANDARD_DESCRIPTIONS: any = {
  tokenChain: "Origin chain id of the token that's being sent.",
  tokenAddress: "Native address format for the address of the token being sent in its origin chain",
  amount:
    "Number formatted as a string with the decimal zeros of the token; ex: if you're sending 1 USDC this should be 1000000",
  feeChain: "Origin chain id of the fee that's being charged",
  feeAddress: "Native address format for the address of the fee being sent in its origin chain",
  fee: "Number formatted as a string with the decimal zeros of the token being used as fee; ex: if you're charging 1 USDC this should be 1000000",
  fromChain: "Wormhole chain id of source chain. Ex: 1 for Solana, 2 for Ethereum, etc",
  fromAddress: "Native address format for the origin chain",
  toChain: "Wormhole chain id of target chain. Ex: 1 for Solana, 2 for Ethereum, etc",
  toAddress: "Native address format for the destination chain",
};

interface IIdentifier {
  network: "Mainnet" | "Testnet";
  chain: ChainId;
  address: string;
}
