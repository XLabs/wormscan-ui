import { CopyIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { Alert, BlockchainIcon, Loader, SignatureCircle, Tooltip } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import WormIcon from "src/icons/wormIcon.svg";
import RelayIcon from "src/icons/relayIcon.svg";
import { GetTransactionsOutput, VAADetail } from "@xlabs-libs/wormscan-sdk";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { shortAddress } from "src/utils/crypto";
import { formatCurrency } from "src/utils/number";
import { ChainId, parseVaa } from "@certusone/wormhole-sdk";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import { BREAKPOINTS, colorStatus, getGuardianSet, txType } from "src/consts";
import { parseTx, parseAddress } from "src/utils/crypto";
import { getCurrentNetwork } from "src/api/Client";
import "./styles.scss";
import {
  DeliveryLifecycleRecord,
  getDeliveryStatusByVaa,
  isRedelivery,
  manualDeliver,
  parseGenericRelayerVaa,
} from "src/pages/RelayerDashboard/utils/VaaUtils";
import { useEnvironment } from "src/pages/RelayerDashboard/context/EnvironmentContext";

import {
  DeliveryInstruction,
  DeliveryTargetInfo,
  RedeliveryInstruction,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import { useCallback, useEffect, useState } from "react";
import { Button, CircularProgress, TextField } from "@mui/material";
import { useEthereumProvider } from "src/pages/RelayerDashboard/context/EthereumProviderContext";
import { getChainInfo } from "src/pages/RelayerDashboard/utils/environment";

const Divider = <div className="divider" />;

const NotFinalDestinationTooltip = () => (
  <div>
    Address shown corresponds to a Smart Contract handling the transaction. Funds will be sent to
    your recipient address.
  </div>
);

export function RedeliveryInstructionDisplay({
  instruction,
}: {
  instruction: RedeliveryInstruction;
}) {
  return (
    <div style={{ margin: "10px" }}>
      <h4>Redelivery Instruction</h4>
      <div>Original VAA Key Info</div>
      <div>{"Chain: " + instruction.deliveryVaaKey.chainId}</div>
      <div>
        {"Emitter" + Buffer.from(instruction.deliveryVaaKey.emitterAddress).toString("hex")}
      </div>
      <div>{"Sequence: " + instruction.deliveryVaaKey.sequence}</div>
      <div style={{ height: "10px" }} />
      <div>
        {"Encoded Execution Params: " +
          Buffer.from(instruction.newEncodedExecutionInfo.toString("hex"))}
      </div>
      <div>{"New Receiver Value: " + instruction.newRequestedReceiverValue}</div>
      <div>
        {"New Sender Address: " + Buffer.from(instruction.newSenderAddress).toString("hex")}
      </div>
      <div>
        {"New Delivery Provider: " +
          Buffer.from(instruction.newSourceDeliveryProvider).toString("hex")}
      </div>
      <div>{"Target Chain: " + instruction.targetChainId}</div>
    </div>
  );
}

export function DeliveryInstructionDisplay({ instruction }: { instruction: DeliveryInstruction }) {
  const spacer = <div style={{ height: "10px" }} />;
  return (
    <div style={{ margin: "10px" }}>
      <h4>Delivery Instruction</h4>
      {Divider}
      <div>{"Target Chain: " + instruction.targetChainId}</div>
      <div>{"Target Address: " + Buffer.from(instruction.targetAddress).toString("hex")}</div>
      <div>{"Extra Receiver Value: " + instruction.extraReceiverValue.toString()}</div>
      <div>{"Refund Address: " + Buffer.from(instruction.refundAddress).toString("hex")}</div>
      <div>{"Refund Chain: " + instruction.refundChainId}</div>
      <div>
        {"Refund Delivery Provider: " +
          Buffer.from(instruction.refundDeliveryProvider).toString("hex")}
      </div>
      <div>{"Receiver Value: " + instruction.requestedReceiverValue.toString()}</div>
      <div>{"Sender Address: " + Buffer.from(instruction.senderAddress).toString("hex")}</div>
      <div>
        {"Source Delivery Provider: " +
          Buffer.from(instruction.sourceDeliveryProvider).toString("hex")}
      </div>

      <h5>Additional Vaa Keys:</h5>
      {instruction.vaaKeys.map(vaaKey => {
        return (
          <div key={vaaKey.chainId}>
            <div>{"Chain: " + vaaKey.chainId}</div>
            <div>{"Emitter" + Buffer.from(vaaKey.emitterAddress).toString("hex")}</div>
            <div>{"Sequence: " + vaaKey.sequence}</div>
          </div>
        );
      })}
      {spacer}
      <div>
        {"Encoded Execution Info: " + Buffer.from(instruction.encodedExecutionInfo).toString("hex")}
      </div>
      <div>{"Payload: " + Buffer.from(instruction.payload).toString("hex")}</div>
    </div>
  );
}

export function PullDeliveryInfo({ rawVaa }: { rawVaa: Uint8Array }) {
  const deliveryVaa = parseVaa(rawVaa);
  const { environment } = useEnvironment();
  const [blockStart, setBlockStart] = useState("-2048");
  const [blockEnd, setBlockEnd] = useState("latest");

  const [deliveryInfoError, setDeliveryInfoError] = useState("");
  const [deliveryInfos, setDeliveryInfos] = useState<DeliveryTargetInfo[]>([]);
  const [isLoadingDeliveryInfo, setIsLoadingDeliveryInfo] = useState(false);

  const onPullDeliveryInfo = async () => {
    setIsLoadingDeliveryInfo(true);
    setDeliveryInfoError("");
    setDeliveryInfos([]);

    const start = parseInt(blockStart);
    const end = blockEnd === "latest" ? "latest" : parseInt(blockEnd);

    if (isNaN(start) || (end !== "latest" && isNaN(end))) {
      setDeliveryInfoError("Invalid block number");
      setIsLoadingDeliveryInfo(false);
      return;
    }

    try {
      const deliveryInfos = await getDeliveryStatusByVaa(environment, deliveryVaa, start, end);

      if (deliveryInfos == null) {
        setDeliveryInfoError("No Delivery Infos were found within the given range");
        setIsLoadingDeliveryInfo(false);
        return;
      } else {
        setDeliveryInfos(deliveryInfos);
        setIsLoadingDeliveryInfo(false);
      }
    } catch (e: any) {
      setDeliveryInfoError(e.message || "An error occurred.");
      setIsLoadingDeliveryInfo(false);
    }
  };

  return (
    <div style={{ margin: "10px", padding: "10px" }}>
      <h4>Pull Delivery Info</h4>
      {Divider}
      <TextField
        label="Block Start"
        value={blockStart}
        onChange={e => setBlockStart(e.target.value)}
        style={{ margin: "10px" }}
      />
      <TextField
        label="Block End"
        value={blockEnd}
        onChange={e => setBlockEnd(e.target.value)}
        style={{ margin: "10px" }}
      />
      <Button
        onClick={onPullDeliveryInfo}
        disabled={isLoadingDeliveryInfo}
        variant="contained"
        style={{ margin: "10px" }}
      >
        Pull Delivery Info
      </Button>
      {deliveryInfoError && <div>{deliveryInfoError}</div>}
      {isLoadingDeliveryInfo && <Loader />}
      {deliveryInfos.map((info, idx) => {
        return <DeliveryInfoDisplay key={idx} info={info} />;
      })}
    </div>
  );
}

export function DeliveryInfoDisplay({ info }: { info: DeliveryTargetInfo }) {
  return (
    <div style={{ padding: "10px" }}>
      {Divider}
      <div>{"GasUsed: " + info.gasUsed.toString()}</div>
      <div>{"New Execution Info: " + info.overrides?.newExecutionInfo?.toString("hex")}</div>
      <div>{"New Receiver Value: " + info.overrides?.newReceiverValue.toString()}</div>
      <div>{"Redelivery Hash: " + info.overrides?.redeliveryHash?.toString("hex")}</div>
      <div>{"Refund Status: " + info.refundStatus}</div>
      <div>{"Revert String: " + info.revertString}</div>
      <div>{"Source Chain: " + info.sourceChain}</div>
      <div>{"Source VAA Seq: " + info.sourceVaaSequence?.toString()}</div>
      <div>{"Status: " + info.status}</div>
      <div>{"TxHash: " + info.transactionHash}</div>
      <div>{"Vaa Hash: " + info.vaaHash}</div>
    </div>
  );
}

export function ManualDeliverDeliveryVaa({ rawVaa }: { rawVaa: Uint8Array }) {
  const deliveryVaa = parseVaa(rawVaa);
  const deliveryInstruction = parseGenericRelayerVaa(deliveryVaa) as DeliveryInstruction;
  const { environment } = useEnvironment();

  const [manualDeliverError, setManualDeliverError] = useState("");
  const [isManualDelivering, setIsManualDelivering] = useState(false);
  const [manualDeliverTxHash, setManualDeliverTxHash] = useState("");

  const { chainId, signer, signerAddress, providerError } = useEthereumProvider();

  const targetChainInfo = getChainInfo(environment, deliveryInstruction.targetChainId as ChainId);
  const walletIsConnected = !!signer;
  const correctChain = walletIsConnected && targetChainInfo.evmNetworkId === chainId;
  //TODO this
  const overrides: any = null;

  const onManualDeliver = useCallback(async () => {
    setIsManualDelivering(true);
    setManualDeliverError("");

    if (!walletIsConnected || !correctChain || !signer || !signerAddress) {
      setManualDeliverError("Wallet is not connected to the correct EVM network");
      setIsManualDelivering(false);
      return;
    }

    try {
      const tx = await manualDeliver(
        environment,
        targetChainInfo,
        rawVaa,
        signer,
        signerAddress,
        overrides || undefined,
      );

      //for some reason I'm seeing transactionHash on the actual runtime object after debugging.
      // @ts-ignore
      setManualDeliverTxHash((tx.hash || tx.transactionHash) as string);
      setIsManualDelivering(false);
    } catch (e: any) {
      setManualDeliverError(e.message || "An error occurred.");
      setIsManualDelivering(false);
    }
  }, [
    walletIsConnected,
    correctChain,
    signer,
    signerAddress,
    environment,
    targetChainInfo,
    rawVaa,
    overrides,
  ]);

  return (
    <div style={{ margin: "10px", padding: "10px" }}>
      <h4>Manual Deliver</h4>
      <Button
        onClick={onManualDeliver}
        disabled={!correctChain || isManualDelivering}
        variant="contained"
        style={{ margin: "10px" }}
      >
        Manual Deliver
      </Button>
      {!correctChain && <div>Wallet is not connected to the correct EVM network</div>}
      {!correctChain && (
        <div>
          Expected EVM Network: {targetChainInfo.evmNetworkId + " "}
          Actual EVM Network: {chainId}
        </div>
      )}
      {!correctChain && !walletIsConnected && <div>Wallet is not connected</div>}
      {providerError && <div>{"Provider Error: " + providerError}</div>}
      {manualDeliverError && <div>{manualDeliverError}</div>}
      {isManualDelivering && <CircularProgress />}
      {manualDeliverTxHash && (
        <div>{"Successfully landed the delivery: " + manualDeliverTxHash}</div>
      )}
    </div>
  );
}

const VaaReader = ({ rawVaa }: { rawVaa: Uint8Array }) => {
  const vaa = parseVaa(rawVaa);
  const info: DeliveryInstruction | RedeliveryInstruction | null = parseGenericRelayerVaa(vaa);

  const vaaHeaderInfo = (
    <div style={{ margin: "10px" }}>
      <h4>VAA Info </h4>
      {Divider}
      <div>Chain: {vaa.emitterChain}</div>
      <div>Emitter: {Buffer.from(vaa.emitterAddress).toString("hex")}</div>
      <div>Sequence: {vaa.sequence.toString()}</div>
      <div>Hash: {Buffer.from(vaa.hash).toString("hex")}</div>
      <div>Timestamp: {vaa.timestamp.toString()}</div>
    </div>
  );

  const isDelivery = info && !isRedelivery(info);

  const vaaBodyInfo =
    info == null ? (
      <div>This VAA can&apos;t be parsed. It is likely not a Wormhole relayer VAA.</div>
    ) : isRedelivery(info) ? (
      <RedeliveryInstructionDisplay instruction={info as RedeliveryInstruction} />
    ) : (
      <DeliveryInstructionDisplay instruction={info as DeliveryInstruction} />
    );

  return (
    <div style={{ margin: "10px" }}>
      {vaaHeaderInfo}
      <div style={{ height: "10px" }} />
      {vaaBodyInfo}
      {isDelivery && <PullDeliveryInfo rawVaa={rawVaa} />}
      {isDelivery && <ManualDeliverDeliveryVaa rawVaa={rawVaa} />}
    </div>
  );
};

type Props = {
  lifecycleRecords: DeliveryLifecycleRecord[];
};

const Overview = ({ lifecycleRecords }: Props) => {
  const { environment } = useEnvironment();

  const lifecycle = lifecycleRecords.find(record => !!record.vaa);
  const vaa = lifecycle?.vaa;
  const parsedVaa = parseVaa(vaa);

  // const vaaReaders = lifecycleRecords.map((record, idx) => {
  //   return record.vaa ? (
  //     <div key={"record" + idx} style={{ margin: "10px" }}>
  //       <VaaReader key={idx} rawVaa={record.vaa} />
  //     </div>
  //   ) : null;
  // });

  if (!vaa) return <div>No VAA was found</div>;

  const { guardianSetIndex, emitterAddress, emitterChain, guardianSignatures, hash, sequence } =
    parsedVaa || {};
  const guardianSetList = getGuardianSet(guardianSetIndex);

  const parsedEmitterAddress = Buffer.from(emitterAddress).toString("hex");
  const parsedHash = Buffer.from(hash).toString("hex");
  const parsedSequence = Number(sequence);
  const parsedGuardianSignatures = guardianSignatures?.map(({ index, signature }) => ({
    index,
    signature: Buffer.from(signature).toString("hex"),
    name: guardianSetList?.[index]?.name,
  }));

  const totalGuardiansNeeded = environment.network === "MAINNET" ? 13 : 1;
  const guardianSignaturesCount = guardianSignatures?.length || 0;

  // const {
  //   chainId: globalToChainId,
  //   from: globalTo,
  //   timestamp: globalToTimestamp,
  //   txHash: globalToRedeemTx,
  // } = destinationTx || {};

  const fromChain = emitterChain;
  // const fromAddress = globalFrom;
  // const toChain = stdToChain || globalToChainId;
  // const toAddress = stdToAddress || globalTo;
  // const startDate = timestamp || globalFromTimestamp;
  // const endDate = globalToTimestamp;
  // const tokenChain = stdTokenChain || payloadTokenChain;
  // const tokenAddress = stdTokenAddress || payloadTokenAddress;
  // const isUnknownApp = callerAppId === UNKNOWN_APP_ID || appIds?.includes(UNKNOWN_APP_ID);

  // const parsedOriginAddress = parseAddress({
  //   value: fromAddress,
  //   chainId: fromChain as ChainId,
  // });

  // const parsedEmitterAddress = parseAddress({
  //   value: emitterNativeAddress,
  //   chainId: emitterChain as ChainId,
  // });

  // const parsedDestinationAddress = parseAddress({
  //   value: toAddress,
  //   chainId: toChain as ChainId,
  // });

  // const parsedRedeemTx = parseTx({ value: globalToRedeemTx, chainId: toChain as ChainId });

  // const originDate = new Date(startDate).toLocaleString("en-US", {
  //   year: "numeric",
  //   month: "short",
  //   day: "numeric",
  //   hour: "2-digit",
  //   minute: "2-digit",
  //   hour12: false,
  // });
  // const destinationDate = new Date(endDate).toLocaleString("en-US", {
  //   year: "numeric",
  //   month: "short",
  //   day: "numeric",
  //   hour: "2-digit",
  //   minute: "2-digit",
  //   hour12: false,
  // });

  // const amountSent = formatCurrency(Number(tokenAmount));
  // const amountSentUSD = formatCurrency(Number(usdAmount));

  // const originDateParsed = originDate.replace(/(.+),\s(.+),\s/g, "$1, $2 at ");
  // const destinationDateParsed = destinationDate.replace(/(.+),\s(.+),\s/g, "$1, $2 at ");

  return (
    <>
      {/* <Summary
        startDate={startDate}
        transactionTimeInMinutes={transactionTimeInMinutes}
        fee={fee}
        symbol={symbol}
        originChainId={fromChain}
        destinationChainId={toChain}
        payloadType={payloadType}
      /> */}

      <div className="relayer-tx-overview">
        <div className="relayer-tx-overview-graph">
          <div className={`relayer-tx-overview-graph-step green source`}>
            <div className="relayer-tx-overview-graph-step-name">
              <div>SOURCE CHAIN</div>
            </div>
            <div className="relayer-tx-overview-graph-step-iconWrapper">
              <div className="relayer-tx-overview-graph-step-iconContainer">
                {fromChain && <BlockchainIcon chainId={fromChain} size={32} />}
              </div>
            </div>
            <div className={`relayer-tx-overview-graph-step-data-container`}>
              <div>
                <div className="relayer-tx-overview-graph-step-title">Sent from</div>
                <div className="relayer-tx-overview-graph-step-description">
                  {fromChain && getChainName({ chainId: fromChain }).toUpperCase()}
                </div>
              </div>
              {/* <>
                <div style={{ order: tokenAmount ? 1 : 2 }}>
                  {tokenAmount && (
                    <>
                      <div className="relayer-tx-overview-graph-step-title">Amount</div>
                      <div className="relayer-tx-overview-graph-step-description">
                        {amountSent}{" "}
                        {symbol && (
                          <a
                            href={getExplorerLink({
                              chainId: tokenChain,
                              value: tokenAddress,
                              base: "token",
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {symbol}
                          </a>
                        )}
                        ({amountSentUSD || "-"} USD)
                      </div>
                    </>
                  )}
                </div>
                <div style={{ order: tokenAmount ? 2 : 1 }}>
                  {parsedOriginAddress && (
                    <>
                      <div className="relayer-tx-overview-graph-step-title">Source wallet</div>
                      <div className="relayer-tx-overview-graph-step-description">
                        <a
                          href={getExplorerLink({
                            chainId: fromChain,
                            value: parsedOriginAddress,
                            base: "address",
                            isNativeAddress: true,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {shortAddress(parsedOriginAddress).toUpperCase()}
                        </a>{" "}
                        <CopyToClipboard toCopy={parsedOriginAddress}>
                          <CopyIcon />
                        </CopyToClipboard>
                      </div>
                    </>
                  )}
                </div>
              </> */}
            </div>
          </div>

          {/* <div className="relayer-tx-overview-graph-step green">
          <div className="relayer-tx-overview-graph-step-name">
            <div>EMITTER CONTRACT</div>
          </div>
          <div className="relayer-tx-overview-graph-step-iconWrapper">
            <div className="relayer-tx-overview-graph-step-iconContainer">
              <img src={WormIcon} alt="" height={32} loading="lazy" />
            </div>
          </div>
          <div className="relayer-tx-overview-graph-step-data-container">
            <div>
              <div className="relayer-tx-overview-graph-step-title">Time</div>
              <div className="relayer-tx-overview-graph-step-description">{originDateParsed}</div>
            </div>
            <div>
              <div className="relayer-tx-overview-graph-step-title">Contract Address</div>
              <div className="relayer-tx-overview-graph-step-description">
                <a
                  href={getExplorerLink({
                    chainId: fromChain,
                    value: parsedEmitterAddress,
                    base: "address",
                    isNativeAddress: true,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {shortAddress(parsedEmitterAddress).toUpperCase()}
                </a>{" "}
                <CopyToClipboard toCopy={parsedEmitterAddress}>
                  <CopyIcon />
                </CopyToClipboard>
              </div>
            </div>
          </div>
        </div>

        <div className={`relayer-tx-overview-graph-step signatures ${colorStatus["COMPLETED"]}`}>
          <div className="relayer-tx-overview-graph-step-name">
            <div>SIGNED VAA</div>
          </div>
          <div className="relayer-tx-overview-graph-step-iconWrapper">
            <div className="relayer-tx-overview-graph-step-signaturesContainer">
              <SignatureCircle guardianSignatures={guardianSignatures} />
              <div className="relayer-tx-overview-graph-step-signaturesContainer-text">
                <div className="relayer-tx-overview-graph-step-signaturesContainer-text-number">
                  {guardianSignaturesCount}/{totalGuardiansNeeded}
                </div>
                <div className="relayer-tx-overview-graph-step-signaturesContainer-text-description">
                  Signatures
                </div>
              </div>
            </div>
          </div>

          <div className="relayer-tx-overview-graph-step-data-container signatures">
            <div>
              <div className="relayer-tx-overview-graph-step-title">VAA ID</div>
              <div className="relayer-tx-overview-graph-step-description">
                {shortAddress(VAAId)}
                <CopyToClipboard toCopy={VAAId}>
                  <CopyIcon />
                </CopyToClipboard>
              </div>
            </div>
          </div>
        </div>

        {globalToRedeemTx && (
          <div className={`relayer-tx-overview-graph-step ${colorStatus["COMPLETED"]}`}>
            <div className="relayer-tx-overview-graph-step-name">
              <div>RELAYING</div>
            </div>
            <div className="relayer-tx-overview-graph-step-iconWrapper">
              <div className="relayer-tx-overview-graph-step-iconContainer">
                <img src={RelayIcon} alt="" height={32} loading="lazy" />
              </div>
            </div>
            <div className="relayer-tx-overview-graph-step-data-container">
              <div>
                <div className="relayer-tx-overview-graph-step-title">Time</div>
                <div className="relayer-tx-overview-graph-step-description">{destinationDateParsed}</div>
              </div>

              <div>
                <div className="relayer-tx-overview-graph-step-title">Redeem Tx</div>
                <div className="relayer-tx-overview-graph-step-description">
                  <a
                    href={getExplorerLink({
                      chainId: toChain,
                      value: parsedRedeemTx,
                      isNativeAddress: true,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortAddress(parsedRedeemTx).toUpperCase()}
                  </a>{" "}
                  <CopyToClipboard toCopy={parsedRedeemTx}>
                    <CopyIcon />
                  </CopyToClipboard>
                </div>
              </div>
            </div>
          </div>
        )}

        {toChain && (
          <div className="relayer-tx-overview-graph-step green">
            <div className="relayer-tx-overview-graph-step-name">
              <div>DESTINATION CHAIN</div>
            </div>
            <div className="relayer-tx-overview-graph-step-iconWrapper">
              <div className="relayer-tx-overview-graph-step-iconContainer">
                {toChain && <BlockchainIcon chainId={toChain} size={32} />}
              </div>
            </div>
            <div className="relayer-tx-overview-graph-step-data-container">
              <div>
                <div className="relayer-tx-overview-graph-step-title">Sent to</div>
                <div className="relayer-tx-overview-graph-step-description">
                  {toChain && getChainName({ chainId: toChain }).toUpperCase()}
                </div>
              </div>
              <div>
                <div className="relayer-tx-overview-graph-step-title">
                  Destination wallet
                  {isUnknownApp && (
                    <Tooltip tooltip={<NotFinalDestinationTooltip />} type="info">
                      <InfoCircledIcon />
                    </Tooltip>
                  )}
                </div>
                <div className="relayer-tx-overview-graph-step-description">
                  <a
                    href={getExplorerLink({
                      chainId: toChain,
                      value: parsedDestinationAddress,
                      base: "address",
                      isNativeAddress: true,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortAddress(parsedDestinationAddress).toUpperCase()}
                  </a>{" "}
                  <CopyToClipboard toCopy={parsedDestinationAddress}>
                    <CopyIcon />
                  </CopyToClipboard>
                </div>
              </div>
            </div>
          </div>
        )} */}

          <div style={{ marginTop: "120px" }}>
            <VaaReader rawVaa={vaa} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
