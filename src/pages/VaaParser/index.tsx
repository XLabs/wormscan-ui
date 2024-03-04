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
  const textareaHexRef = useRef(null);

  const [input, setInput] = useState(processInput(vaaParam));
  const [result, setResult] = useState<GetParsedVaaOutput>(null);

  const { isError, isLoading, isFetching } = useQuery(
    ["getParsedVaa", input],
    () => getClient().guardianNetwork.getParsedVaa(input),
    {
      enabled: !!input,
      retry: 0,
      onSuccess: data => {
        setResult(data);
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
    },
  );

  const VAA_ID =
    result?.vaa?.sequence && result?.vaa?.emitterChain && result?.vaa?.emitterAddress
      ? `${result?.vaa?.emitterChain}/${result?.vaa?.emitterAddress}/${result?.vaa?.sequence}`
      : "";

  return (
    <BaseLayout>
      <div className="devtools-page">
        <div className="devtools-page-container">
          <h1 className="devtools-page-title">VAA Parser</h1>
          <div className="devtools-page-body">
            <div className="parse">
              <div className="parse-input-container">
                <label htmlFor="parse-input">Base64 Encoded VAA</label>
                <textarea
                  className="parse-input"
                  id="parse-input"
                  disabled={false}
                  value={input}
                  ref={textareaRef}
                  onChange={e => {
                    const newInput = processInput(e.target.value);
                    setInput(newInput);
                    navigate(`/vaa-parser/${newInput}`, { replace: true });
                    textareaRef?.current?.blur();
                  }}
                  name="VAA-Input"
                  placeholder="AQA..."
                  aria-label="Base64 VAA input"
                  draggable={false}
                  spellCheck={false}
                />
                <label htmlFor="parse-input-hex">Hex Encoded VAA</label>
                <textarea
                  className="parse-input"
                  id="parse-input-hex"
                  disabled={false}
                  value={input ? "0x" + base64ToHex(input) : input}
                  ref={textareaHexRef}
                  onChange={e => {
                    const newInput = processInput(e.target.value);
                    setInput(newInput);
                    navigate(`/vaa-parser/${newInput}`, { replace: true });
                    textareaHexRef?.current?.blur();
                  }}
                  name="VAA-Input-Hex"
                  placeholder="0x..."
                  aria-label="Hex VAA input"
                  draggable={false}
                  spellCheck={false}
                />
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
                ) : isLoading || isFetching ? (
                  <Loader />
                ) : (
                  <div className="parse-result-json">
                    {!!result && input && VAA_ID && (
                      <div>
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

const processInput = (str: string) => {
  const input = str?.startsWith("0x") ? str.replace("0x", "") : str;
  const hexRegExp = /^[0-9a-fA-F]+$/;

  // isHex (ensuring even length)
  if (hexRegExp.test(input) /* && input.length % 2 === 0 */) {
    return hexToBase64(input);
  }

  return input || "";
};
