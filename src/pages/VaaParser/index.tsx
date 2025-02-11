import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ChainId, chainToChainId, deserialize, encoding, network } from "@wormhole-foundation/sdk";
import { BaseLayout } from "src/layouts/BaseLayout";
import { useNavigateCustom } from "src/utils/hooks";
import analytics from "src/analytics";
import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import { GetParsedVaaOutput } from "src/api/guardian-network/types";
import { JsonText, Loader, NavLink, Tooltip, CopyContent } from "src/components/atoms";
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
import { processInputValue, processInputType, waitForElement } from "src/utils/parser";
import "./styles.scss";

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
  const [hideJson, setHideJson] = useState(false);

  const resetResult = () => {
    setInputs(null);
    setInputsIndex(0);
    setInput("");
    setTxSearch("");
    setResult(null);
    setResultRaw(null);
    navigate(`/developers/vaa-parser?network=${environment.network}`);
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
          // Add chain names and icon to decoded VAA
          if (
            a.innerHTML?.includes("chain") ||
            a.innerHTML?.includes("emitterChain") ||
            a.innerHTML?.includes("fromChain") ||
            a.innerHTML?.includes("recipientChain") ||
            a.innerHTML?.includes("refundChainId") ||
            a.innerHTML?.includes("targetChainId") ||
            a.innerHTML?.includes("destinationChain") ||
            a.innerHTML?.includes("sourceChainId") ||
            a.innerHTML?.includes("destChainId") ||
            a.innerHTML?.includes("toChain") ||
            a.innerHTML?.includes("tokenChain") ||
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
            const parentElement = a.parentElement;

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
            const parentElement = a.parentElement;

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
                    <InfoCircleIcon />
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

        // Add a copy to clipboard to objects and arrays (multiple value``s)
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
    onSettled: async _data => {
      // success or fail, process RAW vaa (no API) and set it
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
          signature: "0x" + Buffer.from(encoding.b64.decode(signature)).toString("hex"),
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
      } catch (e) {
        setResultRaw(null);
      }
    },
    onError: _err => {
      setResult(null);
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
      renderExtras();
      collapseGuardianSignatures();
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
      const otherNetwork = environment.network === "Mainnet" ? "Testnet" : "Mainnet";
      const otherNetworkResponse = await getClient(otherNetwork).guardianNetwork.getOperations(
        send,
      );

      if (!!otherNetworkResponse?.length) {
        navigate(`/developers/vaa-parser/operation/${txSearch}?network=${otherNetwork}`);
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
          navigate(`/developers/vaa-parser/operation/${txSearch}?network=${environment.network}`, {
            replace: true,
          });
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
    <BaseLayout secondaryHeader>
      <div className="devtools-page">
        <div className="devtools-page-container">
          <h1 className="devtools-page-title">VAA Parser</h1>
          <h2 className="devtools-page-description">
            The VAA Parser tool allows decoding a VAA using input methods such as txHash, VAA ID
            (wormholeChainID, EmitterAddress, Sequence), a VAA in hexadecimal format, or base64
            format
          </h2>
          <div className="devtools-page-body">
            <div className="parse">
              <div className="parse-txType">
                <SearchIcon width={24} />
                <input
                  type="text"
                  className={`parse-txType-input ${
                    txSearch && !input && !isLoading ? "error" : ""
                  }`}
                  id="parse-txType-input"
                  placeholder="Insert a TxHash or VAA ID"
                  ref={inputTxRef}
                  value={txSearch}
                  onChange={e => {
                    setInput("");
                    setInputs(null);
                    setInputsIndex(0);

                    setTxSearch(e.target.value);
                    inputTxRef?.current?.blur();
                    navigate(
                      `/developers/vaa-parser/operation/${e.target.value}?network=${environment.network}`,
                      { replace: true },
                    );
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

                  {(!!result || !!resultRaw) && input && VAA_ID && (
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
                    <InfoCircleIcon />
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
                page="vaa-parser"
                network={environment.network}
              />

              <div className="parse-content">
                <span
                  className={`parse-content-title ${hideJson ? "" : "rotate"}`}
                  onClick={() => setHideJson(!hideJson)}
                >
                  Decoded VAA <TriangleDownIcon />
                </span>

                <div
                  className={`parse-result ${input ? "with-data" : ""} ${hideJson ? "hide" : ""}`}
                  id="parse-result"
                  aria-label="Parsed result"
                >
                  <div className="parse-result-top">
                    <div className="parse-result-top-btns">
                      <button
                        className={`parse-result-top-btn ${parsedRaw ? "" : "active"}`}
                        onClick={() => {
                          renderExtras();
                          collapseGuardianSignatures();
                          setParsedRaw(false);
                        }}
                      >
                        Parsed
                      </button>
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
                    </div>

                    <div className="parse-result-top-copy">
                      <CopyToClipboard
                        toCopy={
                          result && !parsedRaw
                            ? stringifyWithBigInt(result, 4)
                            : resultRaw && parsedRaw
                            ? stringifyWithBigInt(resultRaw, 4)
                            : "{}"
                        }
                      >
                        Copy all
                        <CopyIcon width={24} />
                      </CopyToClipboard>
                    </div>
                  </div>

                  <div className="parse-result-json">
                    {isError && !resultRaw ? (
                      <span className="parse-result-not-found">Parsing failed</span>
                    ) : isLoading ? (
                      <Loader />
                    ) : (
                      <>
                        {!resultRaw && (
                          <div className="devtools-page-alert">
                            <div className="devtools-page-alert-info">
                              <InfoCircleIcon />
                              <p>Decoded VAA data will be displayed here</p>
                            </div>
                          </div>
                        )}

                        {(!!result || !!resultRaw) && input && VAA_ID && (
                          <div className="parse-result-json-text">
                            <JsonText
                              data={
                                result && !parsedRaw
                                  ? result
                                  : resultRaw && parsedRaw
                                  ? resultRaw
                                  : {}
                              }
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default VaaParser;
