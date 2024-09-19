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
import { useLocalStorage, useNavigateCustom, useWindowSize } from "src/utils/hooks";
import analytics from "src/analytics";
import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import { Tooltip, CopyContent, Loader } from "src/components/atoms";
import {
  CheckCircle2,
  CrossIcon,
  DesktopIcon,
  DownloadIcon,
  InfoCircleIcon,
} from "src/icons/generic";
import { getChainIcon, getChainName } from "src/utils/wormhole";
import { BREAKPOINTS, getGuardianSet, txType } from "src/consts";
import { formatDate } from "src/utils/date";
import { useParams } from "react-router-dom";
import { useEnvironment } from "src/context/EnvironmentContext";
import {
  allKeys,
  deepCloneWithBigInt,
  getNestedProperty,
  stringifyWithStringBigInt,
} from "src/utils/object";
import { processInputValue, processInputType, waitForElement } from "src/utils/parser";
import { toast } from "react-toastify";
import { sendProtocolSubmission } from "src/utils/cryptoToolkit";
import { Step1 } from "./Step1";
import { Step2 } from "./Step2";
import { Step3 } from "./Step3";
import { Step4 } from "./Step4";
import "./styles.scss";

const SubmitYourProtocol = () => {
  useEffect(() => {
    analytics.page({ title: "SUBMIT_PROTOCOL" });
  }, []);

  const { environment } = useEnvironment();
  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;

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

  const [step, setStepState] = useState(1);
  const setStep = (newStep: number) => {
    if (newStep > 1) {
      analytics.page({ title: `SUBMIT_PROTOCOL_STEP${newStep}` });
    }
    setStepState(newStep);
  };

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

  const [selectedIdentifiers, setSelectedIdentifiers] = useLocalStorage<IIdentifier[]>(
    "selectedIdentifiers",
    [],
  );

  const [selectedNetwork, setSelectedNetwork] = useState(NETWORK_LIST[0]);
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
        }
      },
    },
  );

  const VAA_ID =
    resultRaw?.sequence && resultRaw?.emitterChain && resultRaw?.emitterAddress
      ? `${resultRaw?.emitterChain}/${resultRaw?.emitterAddress}/${resultRaw?.sequence}`
      : "";

  const isLoading = isLoadingTx || isFetchingTx;

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

      if (value || value === 0n) {
        newParsedStandardizedProperties[key] = value === 0n ? "0" : value;
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

  const [contactInfo, setContactInfo] = useState("");
  const [logos, setLogos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "fail">(null);
  const [retried, setRetried] = useState(false);

  const sendProtocol = async () => {
    if (!logos.length) {
      toast("Upload at least one logo for your protocol", {
        type: "error",
        theme: "dark",
      });
      return;
    }

    if (!contactInfo) {
      toast("Contact information is needed", {
        type: "error",
        theme: "dark",
      });
      return;
    }

    setIsSubmitting(true);
    setStep(5);

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
      logos,
      contactInfo,
    });

    if (submitResponse === "OK") {
      setSubmitStatus("success");
      setIsSubmitting(false);
    } else {
      setSubmitStatus("fail");
      setIsSubmitting(false);
    }
  };

  const downloadJson = () => {
    const jsonString = stringifyWithStringBigInt({
      input,
      resultRaw: stringifyWithStringBigInt(resultRaw),
      finishedParsings: stringifyWithStringBigInt(finishedParsings),
      parsedStandardizedProperties: stringifyWithStringBigInt(parsedStandardizedProperties),
      lastMoreInfo,
      addedVAAs: stringifyWithStringBigInt(addedVAAs),
      selectedIdentifiers: stringifyWithStringBigInt(selectedIdentifiers),
      stdProperties: JSON.stringify(stdProperties),
      propertyName,
      contactInfo,
    });

    const blob = new Blob([jsonString], { type: "application/json" });

    const link = document.createElement("a");

    link.download = "data.json";
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isDesktop) {
    return (
      <BaseLayout secondaryHeader>
        <div className="devtools-page">
          <div className="devtools-page-container">
            <div className="only-desktop">
              <DesktopIcon width={30} />
              <div className="only-desktop-title">Tool available for Desktop</div>
              <div className="only-desktop-description">
                The &apos;Submit Your Protocol&apos; tool enables Wormhole integrators to parse
                their own VAA payloads, allowing WormholeScan to recognize and display enhanced
                information for those specific transactions or messages in the future.
              </div>
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout secondaryHeader>
      <div className="devtools-page">
        <div className="devtools-page-container">
          <h1 className="devtools-page-title">Submit Your Protocol</h1>
          <h2 className="devtools-page-description">
            The &apos;Submit Your Protocol&apos; tool enables Wormhole integrators to parse their
            own VAA payloads, allowing WormholeScan to recognize and display enhanced information
            for those specific transactions or messages in the future.
          </h2>

          <div className="devtools-page-body">
            <div className="parse">
              {step === 1 && (
                <Step1
                  selectedNetwork={selectedNetwork}
                  selectedChain={selectedChain}
                  setSelectedChain={setSelectedChain}
                  setSelectedNetwork={setSelectedNetwork}
                  selectedAddress={selectedAddress}
                  setSelectedAddress={setSelectedAddress}
                  setStep={setStep}
                  selectedIdentifiers={selectedIdentifiers}
                  setSelectedIdentifiers={setSelectedIdentifiers}
                />
              )}

              {step === 2 && (
                <Step2
                  hideJson={hideJson}
                  input={input}
                  inputs={inputs}
                  inputsIndex={inputsIndex}
                  inputTxRef={inputTxRef}
                  inputType={inputType}
                  isLoading={isLoading}
                  parsedRaw={parsedRaw}
                  renderExtras={renderExtras}
                  resetResult={resetResult}
                  resetSubmitFields={resetSubmitFields}
                  resultRaw={resultRaw}
                  setHideJson={setHideJson}
                  setInput={setInput}
                  setInputs={setInputs}
                  setInputsIndex={setInputsIndex}
                  setInputType={setInputType}
                  setParsedRaw={setParsedRaw}
                  setTxSearch={setTxSearch}
                  txSearch={txSearch}
                  VAA_ID={VAA_ID}
                  finishedParsings={finishedParsings}
                  vaaSubmit={vaaSubmit}
                  setParsedVAA={setParsedVAA}
                  setVaaSubmit={setVaaSubmit}
                  setStep={setStep}
                  setPropertyName={setPropertyName}
                />
              )}
            </div>
          </div>

          {step === 3 && (
            <Step3
              allKeys={allKeys}
              payloadOptionsStd={payloadOptionsStd}
              finishedParsings={finishedParsings}
              stdProperties={stdProperties}
              setStdProperties={setStdProperties}
              setStep={setStep}
              parsedStandardizedProperties={parsedStandardizedProperties}
              propertyName={propertyName}
            />
          )}

          {step === 4 && (
            <Step4
              addedVAAs={addedVAAs}
              lastMoreInfo={lastMoreInfo}
              lastVaaInput={lastVaaInput}
              sendProtocol={sendProtocol}
              setAddedVAAs={setAddedVAAs}
              setLastMoreInfo={setLastMoreInfo}
              setLastVaaInput={setLastVaaInput}
              setStep={setStep}
              contactInfo={contactInfo}
              setContactInfo={setContactInfo}
              logos={logos}
              setLogos={setLogos}
            />
          )}

          {step === 5 && (
            <>
              {isSubmitting ? (
                <Loader />
              ) : (
                <>
                  {submitStatus === "success" && (
                    <div className="lastStep">
                      <div className="lastStep-icon check">
                        <CheckCircle2 width={40} />
                      </div>

                      <h1>Your request was submitted successfully!</h1>

                      <div className="lastStep-description">
                        We have all the information we need. Your request has been submitted, and
                        you will soon see your protocol on Wormholescan.
                      </div>

                      <div className="lastStep-buttons">
                        <div
                          onClick={() => {
                            navigate("/");
                          }}
                          className="primary"
                        >
                          Done
                        </div>
                        <div className="download" onClick={downloadJson}>
                          <DownloadIcon width={26} />
                          Download JSON
                        </div>
                      </div>
                    </div>
                  )}

                  {submitStatus === "fail" && (
                    <div className="lastStep">
                      <div className="lastStep-icon cross">
                        <CrossIcon width={40} />
                      </div>

                      <h1>Something went wrong</h1>

                      <div className="lastStep-description">
                        A mistake or unforeseen issue has arisen, causing confusion and potentially
                        requiring immediate attention to rectify the situation.
                      </div>

                      <div className="lastStep-buttons">
                        {!retried && (
                          <div
                            className="primary"
                            onClick={() => {
                              setRetried(true);
                              sendProtocol();
                            }}
                          >
                            Try Again
                          </div>
                        )}
                        <div className="download" onClick={downloadJson}>
                          <DownloadIcon width={26} />
                          Download JSON
                        </div>
                      </div>

                      {retried && (
                        <div className="lastStep-sendManual">
                          <p>You can download your JSON and send it to us so we can process it.</p>
                          <p>Sorry for the inconvenience.</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default SubmitYourProtocol;

export const NETWORK_LIST: { label: Network; value: Network }[] = [
  {
    label: "Mainnet",
    value: "Mainnet",
  },
  {
    label: "Testnet",
    value: "Testnet",
  },
];

export interface IIdentifier {
  network: "Mainnet" | "Testnet";
  chain: ChainId;
  address: string;
}
