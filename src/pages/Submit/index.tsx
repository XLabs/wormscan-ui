import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ChainId,
  chainIdToChain,
  chainToChainId,
  deserialize,
  encoding,
  Network,
} from "@wormhole-foundation/sdk";
import { BaseLayout } from "src/layouts/BaseLayout";
import { useNavigateCustom } from "src/utils/hooks";
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

import { stringifyWithBigInt } from "src/utils/object";
import { Submit } from "./Submit";
import { processInputValue, processInputType, waitForElement, isHex } from "src/utils/parser";
import { ChainFilterMainnet, ChainFilterTestnet } from "../Txs/Information/Filters";
import { Cross2Icon } from "@radix-ui/react-icons";
import { toast } from "react-toastify";
import "./styles.scss";

const SubmitYourProtocol = () => {
  useEffect(() => {
    analytics.page({ title: "SUBMIT_PROTOCOL" });
  }, []);

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
    navigate("/submit");
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

  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [selectedChain, setSelectedChain] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedIdentifiers, setSelectedIdentifiers] = useState([]);

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
    setVaaSubmit(null);
    setPropertyName(null);
  };

  useEffect(() => {
    if (!!parsedVAA) {
      console.log({
        finishedParsings,
        resultRaw,
        parsedVAA,
      });
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

      setResultRaw({
        ...parsedVaaAny,
        payload: parsedVaa.payload ? Buffer.from(parsedVaa.payload).toString("hex") : null,
        emitterAddress: parsedEmitterAddress,
        emitterChain: chainToChainId(parsedVaa.emitterChain),
        guardianSignatures: parsedGuardianSignatures,
        hash: parsedHash,
        sequence: parsedSequence,
      });

      setParsedRaw(true);

      renderExtras();
      collapseGuardianSignatures();
    } catch (e) {
      setResultRaw(null);
    }
  }, [input, renderExtras]);

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
        navigate(`/submit/operation/${txSearch}?network=${otherNetwork}`);
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
          navigate(`/submit/operation/${txSearch}`, { replace: true });
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
            // console.log([parsingInternalPayload ? "payload." + key : key, value]);
            return [parsingInternalPayload ? "payload." + key : key, value];
          }
          return null;
        })
        .filter(a => a !== null);

      return parsables;
    }
    return [];
  }, [resultRaw]);

  return (
    <BaseLayout secondaryHeader>
      <div className="devtools-page">
        <div className="devtools-page-container">
          <h1 className="devtools-page-title">Submit Your Protocol</h1>
          <h2 className="devtools-page-description">
            The Submit your Protocol tool is currently located within the Dev-Tools section. It
            allows Wormhole Integrators to parse a VAA of their own so WormholeScan can later parse
            that kind of VAAs and show better information regarding those transactions or messages.
          </h2>

          <div className="devtools-page-body">
            <div className="parse">
              <h1 className="devtools-page-title">How can we identify your VAAs?</h1>
              <div className="parse-submit">
                <div className="parse-submit-description">
                  Give us your emitter addresses or contract addresses that we can use to identify
                  your VAAs
                </div>

                {selectedIdentifiers.map((identifier, idx) => {
                  console.log({ identifier, idx });
                  return (
                    <div key={idx} className="parse-submit-identifiers">
                      <div>{identifier.network}</div>

                      <div className="parse-submit-identifiers-chain">
                        {chainIdToChain(identifier.chain)}
                        <BlockchainIcon chainId={identifier.chain} network={identifier.network} />
                      </div>

                      <div>{identifier.address}</div>

                      {step === 1 && (
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
                      )}
                    </div>
                  );
                })}

                {step === 1 && (
                  <>
                    <div className="parse-submit-chainAddress">
                      <Select
                        ariaLabel="Select Network"
                        items={NETWORK_LIST}
                        isMulti={false}
                        name="submitNetwork"
                        onValueChange={value => {
                          console.log(value);
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
                            console.log(value);
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
                        }
                      }}
                      className="parse-submit-btn down"
                    >
                      Next step
                    </div>
                  </>
                )}
              </div>

              {step > 1 && (
                <>
                  <h1 className="devtools-page-title">Lets parse and decode a VAA</h1>

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
                        navigate(`/submit/operation/${e.target.value}`, { replace: true });
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
                            collapseGuardianSignatures();
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

          {step > 1 && (
            <>
              {finishedParsings.map(parsing => (
                <div key={parsing.payload} className="submit-finished-parsing">
                  <div>Finished parsing {parsing.parsedPayload?.callerAppId}</div>
                  {/* <JsonText
                      data={{
                        payload: encoding.hex.encode(parsing.payload),
                        userLayout: parsing.userLayout,
                        parsedPayload: parsing.parsedPayload,
                      }}
                    /> */}
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
                </div>
              )}
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