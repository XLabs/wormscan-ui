import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { BaseLayout } from "src/layouts/BaseLayout";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import analytics from "src/analytics";
import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import { GetParsedVaaOutput } from "src/api/guardian-network/types";
import { JsonText, Loader, NavLink, Tooltip } from "src/components/atoms";
import { CheckIcon, CopyIcon, ExternalLinkIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { CopyToClipboard } from "src/components/molecules";
import { getChainName } from "src/utils/wormhole";
import { ChainId } from "src/api";
import { getGuardianSet, txType } from "src/consts";
import { formatDate } from "src/utils/date";
import { useParams } from "react-router-dom";
import { base64ToHex, hexToBase64 } from "src/utils/string";
import "./styles.scss";
import { parseVaa } from "@certusone/wormhole-sdk";
import VaaInput from "./Input";

const VaaParser = () => {
  useEffect(() => {
    analytics.page({ title: "VAA_PARSER" });
  }, []);

  const params = useParams();
  const vaaParam = params?.["*"];
  const navigate = useNavigateCustom();

  const textareaRef = useRef(null);
  const inputTxRef = useRef(null);

  const [input, setInput] = useState(processInputValue(vaaParam));
  const [inputType, setInputType] = useState(processInputType(vaaParam));
  const [txSearch, setTxSearch] = useState("");

  const [parsedRaw, setParsedRaw] = useState(false);
  const [result, setResult] = useState<GetParsedVaaOutput>(null);
  const [resultRaw, setResultRaw] = useState<any>(null);

  const renderExtras = (renderTo: Element | Document) => {
    renderTo.querySelectorAll(".added-stuff").forEach(a => a.remove());

    // Add texts to enhace information
    renderTo.querySelectorAll(".json-view-key").forEach(a => {
      // Add chain names to decoded VAA
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

        const chain = getChainName({
          chainId: +parentElement.children?.[1]?.innerHTML as ChainId,
          network: "MAINNET",
        });

        if (chain) {
          const newText = document.createElement("span");
          newText.textContent = ` // ${chain}`;
          newText.classList.add("added-stuff");

          a.parentElement?.appendChild(newText);
        }
      }

      // Add payload types to decoded VAA
      if (a.innerHTML?.includes("payloadType")) {
        const parentElement = a.parentElement;

        const type = txType[+parentElement.children?.[1]?.innerHTML] ?? false;

        if (type) {
          const newText = document.createElement("span");
          newText.textContent = ` // ${type}`;
          newText.classList.add("added-stuff");

          a.parentElement?.appendChild(newText);
        }
      }

      // Add timestamps as texts in decoded VAA
      if (a.innerHTML?.includes("timestamp")) {
        const parentElement = a.parentElement;

        const timestamp = parentElement.children?.[1]?.innerHTML?.replaceAll('"', "");

        const time = new Date(isNaN(+timestamp) ? timestamp : +timestamp * 1000);
        const formatted = formatDate(time);

        if (formatted) {
          const newText = document.createElement("span");
          newText.textContent = ` // ${formatted}`;
          newText.classList.add("added-stuff");

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

          a.parentElement?.appendChild(newText);
          a.parentElement?.appendChild(reactContainer);
          root.render(<TimestampTooltip />);
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

  const {
    isError,
    isLoading: isLoadingParse,
    isFetching: isFetchingParse,
  } = useQuery(["getParsedVaa", input], () => getClient().guardianNetwork.getParsedVaa(input), {
    enabled: !!input,
    retry: 0,
    onSuccess: data => {
      const guardianSetIndex = data.vaa.guardianSetIndex;
      // Decode SignedVAA and get guardian signatures with name
      const guardianSetList = getGuardianSet(guardianSetIndex);
      const vaaBuffer = Buffer.from(input, "base64");
      const parsedVaa = parseVaa(vaaBuffer);

      const { emitterAddress, guardianSignatures, hash, sequence } = parsedVaa || {};
      const parsedEmitterAddress = Buffer.from(emitterAddress).toString("hex");
      const parsedHash = Buffer.from(hash).toString("hex");
      const parsedSequence = Number(sequence);
      const parsedGuardianSignatures = guardianSignatures?.map(({ index, signature }) => ({
        index,
        signature: Buffer.from(signature).toString("hex"),
        name: guardianSetList?.[index]?.name,
      }));

      setResult(data);
      setResultRaw({
        ...parsedVaa,
        payload: parsedVaa.payload ? Buffer.from(parsedVaa.payload).toString("hex") : null,
        emitterAddress: parsedEmitterAddress,
        guardianSignatures: parsedGuardianSignatures,
        hash: parsedHash,
        sequence: parsedSequence,
      });

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
    () => {
      const isVaaID = txSearch.split("/")?.length === 3;
      const send = isVaaID ? { vaaID: txSearch } : { txHash: txSearch };

      return getClient().guardianNetwork.getOperations(send);
    },
    {
      retry: 0,
      enabled: !!txSearch && !input,
      onSuccess: data => {
        if (data.length && data[0].vaa?.raw) {
          const rawVAA = data[0].vaa?.raw;

          setInput(rawVAA);
          setInputType("base64");

          navigate(`/vaa-parser/${rawVAA}`, { replace: true });
          inputTxRef.current?.blur();
        }
      },
    },
  );

  const VAA_ID =
    result?.vaa?.sequence && result?.vaa?.emitterChain && result?.vaa?.emitterAddress
      ? `${result?.vaa?.emitterChain}/${result?.vaa?.emitterAddress}/${result?.vaa?.sequence}`
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
                    console.log(e.target.value);

                    setTxSearch(e.target.value);
                    inputTxRef?.current?.blur();
                  }}
                  name="txType-input"
                  aria-label="Transaction hash or VAA ID input"
                  spellCheck={false}
                />
              </div>
              <VaaInput
                input={input}
                inputType={inputType}
                setInput={setInput}
                setInputType={setInputType}
                setTxSearch={setTxSearch}
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
                    Switch to {parsedRaw ? "parsed" : "raw"} decode
                  </span>
                </div>

                <div className="parse-result-copy">
                  <CopyToClipboard
                    toCopy={
                      result
                        ? parsedRaw
                          ? JSON.stringify(resultRaw)
                          : JSON.stringify(result)
                        : "{}"
                    }
                  >
                    <CopyIcon height={24} width={24} />
                  </CopyToClipboard>
                </div>

                {isError ? (
                  <span className="parse-result-not-found">Parsing failed</span>
                ) : isLoading ? (
                  <Loader />
                ) : (
                  <div className="parse-result-json">
                    {!!result && input && VAA_ID && (
                      <div className="parse-result-json-text">
                        <JsonText data={parsedRaw ? resultRaw : result} />
                        <NavLink target="_blank" to={`/tx/${VAA_ID}`}>
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

const CopyContent = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  return (
    <>
      {copied ? (
        <CheckIcon height={16} width={16} />
      ) : (
        <CopyIcon
          height={14}
          width={14}
          onClick={async () => {
            setCopied(true);
            await navigator.clipboard.writeText(text);
          }}
        />
      )}
    </>
  );
};
