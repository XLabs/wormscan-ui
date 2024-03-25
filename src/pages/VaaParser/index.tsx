import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { BaseLayout } from "src/layouts/BaseLayout";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import analytics from "src/analytics";
import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import { GetParsedVaaOutput } from "src/api/guardian-network/types";
import { JsonText, Loader, NavLink, Tooltip } from "src/components/atoms";
import {
  CopyIcon,
  ExternalLinkIcon,
  InfoCircledIcon,
  TriangleRightIcon,
  WidthIcon,
} from "@radix-ui/react-icons";
import { CopyToClipboard } from "src/components/molecules";
import { getChainIcon, getChainName } from "src/utils/wormhole";
import { ChainId } from "src/api";
import { getGuardianSet, txType } from "src/consts";
import { formatDate } from "src/utils/date";
import { useParams } from "react-router-dom";
import { hexToBase64 } from "src/utils/string";
import "./styles.scss";
import { parseVaa } from "@certusone/wormhole-sdk";
import VaaInput from "./Input";
import CopyContent from "./CopyContent";
import { useEnvironment } from "src/context/EnvironmentContext";

const VaaParser = () => {
  useEffect(() => {
    analytics.page({ title: "VAA_PARSER" });
  }, []);

  const { environment } = useEnvironment();

  const params = useParams();
  const vaaParam = params?.["*"];
  const navigate = useNavigateCustom();

  const inputTxRef = useRef(null);

  const [inputs, setInputs] = useState<Array<string>>(null);
  const [inputsIndex, setInputsIndex] = useState(0);

  const paramTx = vaaParam?.includes("operation/");

  const [input, setInput] = useState(paramTx ? "" : processInputValue(vaaParam));
  const [inputType, setInputType] = useState(paramTx ? "base64" : processInputType(vaaParam));
  const [txSearch, setTxSearch] = useState(paramTx ? vaaParam.replace("operation/", "") : "");

  const [parsedRaw, setParsedRaw] = useState(false);
  const [result, setResult] = useState<GetParsedVaaOutput>(null);
  const [resultRaw, setResultRaw] = useState<any>(null);

  const renderExtras = (renderTo: Element | Document) => {
    renderTo.querySelectorAll(".added-stuff").forEach(a => a.remove());

    // Add texts to enhace information
    renderTo.querySelectorAll(".json-view-key").forEach(a => {
      // Add chain names and icon to decoded VAA
      if (
        a.innerHTML?.includes("fromChain") ||
        a.innerHTML?.includes("toChain") ||
        a.innerHTML?.includes("tokenChain") ||
        a.innerHTML?.includes("emitterChain") ||
        a.innerHTML?.includes("refundChainId") ||
        a.innerHTML?.includes("recipientChain") ||
        a.innerHTML?.includes("targetChainId") ||
        a.innerHTML?.includes("feeChain")
      ) {
        const parentElement = a.parentElement;
        const chainId = +parentElement.children?.[1]?.innerHTML as ChainId;

        const chain = getChainName({
          chainId: chainId,
          network: environment.network,
        });

        if (chain) {
          const reactContainer = document.createElement("span");
          const root = createRoot(reactContainer);

          parentElement?.appendChild(reactContainer);

          const chainIcon = getChainIcon({ chainId });
          root.render(
            <div
              style={{
                display: "inline-block",
                marginLeft: 8,
                cursor: "default",
                userSelect: "none",
              }}
            >
              <img
                src={chainIcon}
                alt={`${chain} icon`}
                style={{
                  display: "inline-block",
                  transform: "scale(1.2) translateY(2px)",
                  marginLeft: 4,
                  marginRight: 6,
                }}
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
        const parentElement = a.parentElement;

        const type = txType[+parentElement.children?.[1]?.innerHTML] ?? false;

        if (type) {
          const reactContainer = document.createElement("span");
          const root = createRoot(reactContainer);

          parentElement?.appendChild(reactContainer);
          root.render(<span style={{ marginLeft: 4 }}>{` (${type})`}</span>);
        }
      }

      // Add timestamps as texts in decoded VAA
      if (a.innerHTML?.includes("timestamp")) {
        const parentElement = a.parentElement;

        const timestamp = parentElement.children?.[1]?.innerHTML?.replaceAll('"', "");

        const time = new Date(isNaN(+timestamp) ? timestamp : +timestamp * 1000);
        const formatted = formatDate(time);

        if (formatted) {
          const TimestampTooltip = () => (
            <Tooltip
              tooltip={
                <div>
                  This is the timestamp of the block on the blockchain which emitted this VAA, not
                  the time the VAA was signed by the guardians.
                </div>
              }
              type="info"
            >
              <InfoCircledIcon />
            </Tooltip>
          );

          const reactContainer = document.createElement("span");
          reactContainer.classList.add("copy-item");
          const root = createRoot(reactContainer);

          a.parentElement?.appendChild(reactContainer);
          root.render(
            <>
              <span
                style={{
                  display: "inline-block",
                  transform: "translateY(-2px)",
                  marginRight: 5,
                }}
              >{` // ${formatted}`}</span>
              <TimestampTooltip />
            </>,
          );
        }
      }
    });

    // Add a copy to clipboard to strings and numbers (single values)
    renderTo.querySelectorAll(".json-view-string, .json-view-number").forEach(text => {
      const reactContainer = document.createElement("span");
      reactContainer.classList.add("copy-item");

      const parentElement = text.parentElement;
      reactContainer.classList.add("added-stuff");

      parentElement.appendChild(reactContainer);

      const root = createRoot(reactContainer);
      root.render(<CopyContent text={text.innerHTML} />);
    });

    // Add a copy to clipboard to objects and arrays (multiple values)
    renderTo.querySelectorAll(".json-view-collapseIcon").forEach(item => {
      const parentElement = item.parentElement;

      (item as HTMLElement).addEventListener("click", _ev => {
        setTimeout(() => renderExtras(parentElement), 100);
      });

      if (parentElement?.parentElement?.parentElement?.className === "json-view") return;

      const reactContainer = document.createElement("span");
      reactContainer.classList.add("copy-item");

      const whichChild = parentElement.children[1].className === "json-view-key" ? 3 : 2;
      const childElement = parentElement.children[whichChild];
      reactContainer.classList.add("added-stuff");

      parentElement.insertBefore(reactContainer, childElement);

      const root = createRoot(reactContainer);

      let textToCopy = parentElement.innerText.replace(/"[^"]*":/, "");
      if (textToCopy.endsWith(",")) textToCopy = textToCopy.slice(0, -1);

      root.render(<CopyContent text={textToCopy} />);
    });
  };

  const getGuardianName = (guardianSet: number, index: number) => {
    const guardianSetList = getGuardianSet(guardianSet);
    return guardianSetList?.[index]?.name;
  };

  const {
    isError,
    isLoading: isLoadingParse,
    isFetching: isFetchingParse,
  } = useQuery(["getParsedVaa", input], () => getClient().guardianNetwork.getParsedVaa(input), {
    enabled: !!input,
    retry: 0,
    onSettled: _data => {
      // success or fail, process RAW vaa (no API) and set it
      try {
        const parsedVaa = parseVaa(Buffer.from(input, "base64"));
        const { emitterAddress, guardianSignatures, hash, sequence, guardianSetIndex } =
          parsedVaa || {};

        const parsedEmitterAddress = Buffer.from(emitterAddress).toString("hex");
        const parsedHash = Buffer.from(hash).toString("hex");
        const parsedSequence = Number(sequence);
        const parsedGuardianSignatures = guardianSignatures?.map(({ index, signature }) => ({
          index,
          signature: Buffer.from(signature).toString("hex"),
          name: getGuardianName(guardianSetIndex, index),
        }));

        setResultRaw({
          ...parsedVaa,
          payload: parsedVaa.payload ? Buffer.from(parsedVaa.payload).toString("hex") : null,
          emitterAddress: parsedEmitterAddress,
          guardianSignatures: parsedGuardianSignatures,
          hash: parsedHash,
          sequence: parsedSequence,
        });
      } catch (e) {
        setResultRaw(null);
      }
    },
    onSuccess: data => {
      // add guardian names to guardianSignatures
      if (data?.vaa?.guardianSetIndex && data?.vaa?.guardianSignatures) {
        data = {
          ...data,
          vaa: {
            ...data.vaa,
            guardianSignatures: data.vaa.guardianSignatures.map(({ index, signature }: any) => ({
              index,
              signature,
              name: getGuardianName(data?.vaa?.guardianSetIndex, index),
            })),
          },
        };
      }
      setResult(data);

      const vaaID = `${data?.vaa?.emitterChain}/${data?.vaa?.emitterAddress}/${data?.vaa?.sequence}`;
      if (!txSearch) {
        setTxSearch(vaaID);
      }
      setTimeout(() => {
        renderExtras(document);
      }, 100);
    },
  });

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
      const otherNetwork = environment.network === "MAINNET" ? "TESTNET" : "MAINNET";
      const otherNetworkResponse = await getClient(otherNetwork).guardianNetwork.getOperations(
        send,
      );

      if (!!otherNetworkResponse?.length) {
        navigate(`/vaa-parser/operation/${txSearch}?network=${otherNetwork}`);
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
          setInputType("base64");

          if (data.length > 1) {
            const rawVAAs = data.map(a => a?.vaa?.raw);
            setInputs(rawVAAs);
            setInputsIndex(0);
          }

          inputTxRef.current?.blur();
          navigate(`/vaa-parser/operation/${txSearch}`, { replace: true });
        }
      },
    },
  );

  const VAA_ID =
    result?.vaa?.sequence && result?.vaa?.emitterChain && result?.vaa?.emitterAddress
      ? `${result?.vaa?.emitterChain}/${result?.vaa?.emitterAddress}/${result?.vaa?.sequence}`
      : resultRaw?.sequence && resultRaw?.emitterChain && resultRaw?.emitterAddress
      ? `${resultRaw?.emitterChain}/${resultRaw?.emitterAddress}/${resultRaw?.sequence}`
      : "";

  const isLoading = isLoadingParse || isFetchingParse || isLoadingTx || isFetchingTx;

  return (
    <BaseLayout>
      <div className="devtools-page">
        <div className="devtools-page-container">
          <h1 className="devtools-page-title">VAA Parser</h1>
          <div className="devtools-page-body">
            <div className="parse">
              <div className="parse-txType">
                <label htmlFor="parse-txType-input">TxHash/VaaID search</label>
                <input
                  type="text"
                  className="parse-txType-input"
                  id="parse-txType-input"
                  ref={inputTxRef}
                  value={txSearch}
                  onChange={e => {
                    setInput("");
                    setInputs(null);
                    setInputsIndex(0);

                    setTxSearch(e.target.value);
                    inputTxRef?.current?.blur();
                    navigate(`/vaa-parser/operation/${e.target.value}`, { replace: true });
                  }}
                  name="txType-input"
                  aria-label="Transaction hash or VAA ID input"
                  spellCheck={false}
                />
              </div>
              {!!inputs?.length && (
                <div className="parse-multiple">
                  <span className="parse-multiple-left">This txHash has multiple VAAs.</span>
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
                    <span className="right-icon">
                      <TriangleRightIcon width={18} height={18} />
                    </span>
                  </div>
                </div>
              )}
              <VaaInput
                input={input}
                inputType={inputType}
                setInput={setInput}
                setInputType={setInputType}
                setTxSearch={setTxSearch}
                setInputs={setInputs}
                setInputsIndex={setInputsIndex}
              />
              <div className="parse-result" id="parse-result" aria-label="Parsed result">
                <div className="parse-result-title">
                  <span>Decoded VAA: {parsedRaw ? "Raw" : "Parsed"}</span>
                  <span
                    onClick={() => {
                      setTimeout(() => renderExtras(document), 100);
                      setParsedRaw(!parsedRaw);
                    }}
                    className="parse-result-title-switch"
                  >
                    <span className="parse-result-title-switch-text">
                      Switch to {parsedRaw ? "parsed" : "raw"} decode
                    </span>
                    <WidthIcon height={24} width={24} className="parse-result-title-switch-icon" />
                  </span>
                </div>

                <div className="parse-result-copy">
                  <CopyToClipboard
                    toCopy={
                      result && !parsedRaw
                        ? JSON.stringify(result, null, 4)
                        : resultRaw && parsedRaw
                        ? JSON.stringify(resultRaw, null, 4)
                        : "{}"
                    }
                  >
                    <CopyIcon height={24} width={24} />
                  </CopyToClipboard>
                </div>

                {isError && !resultRaw ? (
                  <span className="parse-result-not-found">Parsing failed</span>
                ) : isLoading ? (
                  <Loader />
                ) : (
                  <div className="parse-result-json">
                    {(!!result || !!resultRaw) && input && VAA_ID && (
                      <div className="parse-result-json-text">
                        <JsonText
                          data={
                            result && !parsedRaw ? result : resultRaw && parsedRaw ? resultRaw : {}
                          }
                        />
                        <NavLink target="_blank" to={`/tx/${txSearch ? txSearch : VAA_ID}`}>
                          <div className="parse-result-bottom">
                            <span>View on Transactions</span>
                            <ExternalLinkIcon height={15} width={15} />
                          </div>
                        </NavLink>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default VaaParser;

export const processInputValue = (str: string) => {
  const input = str?.startsWith("0x") ? str.replace("0x", "") : str;
  const hexRegExp = /^[0-9a-fA-F]+$/;
  const isHex = hexRegExp.test(input);

  if (isHex) {
    return hexToBase64(input);
  }

  return input || "";
};

export const processInputType = (str: string): "base64" | "hex" => {
  const input = str?.startsWith("0x") ? str.replace("0x", "") : str;
  const hexRegExp = /^[0-9a-fA-F]+$/;
  const isHex = hexRegExp.test(input);

  if (isHex) return "hex";
  return "base64";
};
