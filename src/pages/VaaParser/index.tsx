import { useEffect, useRef, useState } from "react";
import { BaseLayout } from "src/layouts/BaseLayout";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import analytics from "src/analytics";
import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import { GetParsedVaaOutput } from "src/api/guardian-network/types";
import { JsonText, Loader, NavLink } from "src/components/atoms";
import { CopyIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { CopyToClipboard } from "src/components/molecules";
import { getChainName } from "src/utils/wormhole";
import { ChainId } from "src/api";
import { txType } from "src/consts";
import { formatDate } from "src/utils/date";
import { useParams } from "react-router-dom";
import { base64ToHex, hexToBase64 } from "src/utils/string";
import "./styles.scss";

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

  const [result, setResult] = useState<GetParsedVaaOutput>(null);

  const {
    isError,
    isLoading: isLoadingParse,
    isFetching: isFetchingParse,
  } = useQuery(["getParsedVaa", input], () => getClient().guardianNetwork.getParsedVaa(input), {
    enabled: !!input,
    retry: 0,
    onSuccess: data => {
      setResult(data);
      const vaaID = `${data?.vaa?.emitterChain}/${data?.vaa?.emitterAddress}/${data?.vaa?.sequence}`;
      if (!txSearch) {
        setTxSearch(vaaID);
      }

      setTimeout(() => {
        document.querySelectorAll(".json-view-key").forEach(a => {
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

              a.parentElement?.appendChild(newText);
            }
          }

          // Add timestamps as texts in decoded VAA
          if (a.innerHTML?.includes("timestamp")) {
            const parentElement = a.parentElement;

            const timestamp = parentElement.children?.[1]?.innerHTML?.replaceAll('"', "");
            const time = new Date(timestamp);
            const formatted = formatDate(time);

            if (formatted) {
              const newText = document.createElement("span");
              newText.textContent = ` // ${formatted}`;

              a.parentElement?.appendChild(newText);
            }
          }
        });
      }, 150);
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
              <div className="parse-input-container">
                <label htmlFor="parse-input">Encoded VAA</label>
                <textarea
                  className="parse-input"
                  id="parse-input"
                  disabled={false}
                  value={inputType === "base64" ? input : base64ToHex(input)}
                  ref={textareaRef}
                  onChange={e => {
                    const targetValue = e.target.value;

                    const newInput = processInputValue(targetValue);
                    setInput(newInput);
                    setInputType(processInputType(targetValue));
                    setTxSearch("");

                    navigate(`/vaa-parser/${newInput}`, { replace: true });
                    textareaRef?.current?.blur();
                  }}
                  name="VAA-Input"
                  placeholder={`base64/hex vaa..`}
                  aria-label="Base64 VAA input"
                  draggable={false}
                  spellCheck={false}
                />
                {input && (
                  <div className="parse-input-container-format">
                    <span
                      onClick={() => {
                        setInputType("hex");
                      }}
                      className={inputType === "hex" ? "active" : ""}
                    >
                      Hex
                    </span>
                    <span
                      onClick={() => {
                        setInputType("base64");
                      }}
                      className={inputType === "base64" ? "active" : ""}
                    >
                      Base64
                    </span>
                  </div>
                )}
              </div>
              <div className="parse-result" id="parse-result" aria-label="Parsed result">
                <div className="parse-result-title">Decoded VAA</div>
                <div className="parse-result-title"></div>

                <div className="parse-result-copy">
                  <CopyToClipboard toCopy={result ? JSON.stringify(result) : "{}"}>
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
                        <JsonText data={result} />
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

const processInputValue = (str: string) => {
  const input = str?.startsWith("0x") ? str.replace("0x", "") : str;
  const hexRegExp = /^[0-9a-fA-F]+$/;
  const isHex = hexRegExp.test(input);

  if (isHex) {
    return hexToBase64(input);
  }

  return input || "";
};

const processInputType = (str: string): "base64" | "hex" => {
  const input = str?.startsWith("0x") ? str.replace("0x", "") : str;
  const hexRegExp = /^[0-9a-fA-F]+$/;
  const isHex = hexRegExp.test(input);

  if (isHex) return "hex";
  return "base64";
};
