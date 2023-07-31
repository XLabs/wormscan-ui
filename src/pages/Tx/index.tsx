import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import { Loader } from "src/components/atoms";
import { BaseLayout } from "src/layouts/BaseLayout";
import { Information } from "./Information";
import { Top } from "./Top";
import { useParams } from "react-router-dom";
import { GetTransactionsOutput, VAADetail } from "@xlabs-libs/wormscan-sdk";
import { parseVaa } from "@certusone/wormhole-sdk";
import { ChainId } from "@xlabs-libs/wormscan-sdk";
import { Buffer } from "buffer";
import { getGuardianSet } from "../../consts";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import { useEnvironment } from "src/context/EnvironmentContext";
import "./styles.scss";

const STALE_TIME = 1000 * 10;

const Tx = () => {
  const navigate = useNavigateCustom();
  const { txHash, chainId, emitter, seq } = useParams();
  const { environment } = useEnvironment();
  const network = environment.network;

  const VAAId: string = `${chainId}/${emitter}/${seq}`;
  const isTxHashSearch = Boolean(txHash);
  const isVAAIdSearch = Boolean(chainId) && Boolean(emitter) && Boolean(seq);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emitterChainId, setEmitterChainId] = useState<ChainId | undefined>(undefined);
  const [parsedVAAData, setParsedVAAData] = useState<
    (VAADetail & { vaa: any; decodedVaa: any }) | undefined
  >(undefined);

  useEffect(() => {
    setIsLoading(true);
  }, [txHash, chainId, emitter, seq]);

  useEffect(() => {
    if (!network) return;

    setIsLoading(true);
  }, [network]);

  const { data: VAADataByTx } = useQuery(
    ["getVAAbyTxHash", txHash],
    () =>
      getClient().guardianNetwork.getVAAbyTxHash({
        query: {
          txHash,
          parsedPayload: true,
        },
      }),
    {
      onError: () => navigate(`/search-not-found/${txHash}`),
      staleTime: STALE_TIME,
      enabled: isTxHashSearch,
    },
  );

  const { data: VAADataByVAAId }: { data: VAADetail } = useQuery(
    ["getVAA", VAAId],
    () => {
      return getClient().guardianNetwork.getVAA({
        chainId: Number(chainId),
        emitter,
        seq: Number(seq),
        query: {
          parsedPayload: true,
        },
      });
    },
    {
      onError: () => navigate(`/search-not-found/?q=${VAAId}`),
      staleTime: STALE_TIME,
      enabled: isVAAIdSearch,
    },
  );

  const VAAData: VAADetail | null = isTxHashSearch ? VAADataByTx : VAADataByVAAId;
  const { id: VAADataId, txHash: VAADataTxHash, vaa, guardianSetIndex } = VAAData || {};

  const { data: txData, refetch: refetchTxData } = useQuery(
    ["getTransactions", VAADataId],
    () => {
      const VAADataVaaId = VAADataId.split("/");
      const VaaDataChainId = Number(VAADataVaaId?.[0]);
      const VaaDataEmitter = VAADataVaaId?.[1];
      const VaaDataSeq = Number(VAADataVaaId?.[2]);

      return getClient().search.getTransactions({
        chainId: VaaDataChainId,
        emitter: VaaDataEmitter,
        seq: VaaDataSeq,
      });
    },
    {
      enabled: false,
      onSuccess: () => setIsLoading(false),
      onError: () => navigate(`/search-not-found/?q=${VAADataId}`),
    },
  );

  useEffect(() => {
    if (!VAAData) return;

    refetchTxData();
  }, [VAAData, refetchTxData]);

  const { payload } = (txData as GetTransactionsOutput) || {};
  const { payloadType } = payload || {};

  useEffect(() => {
    if (!vaa) return;

    // Decode SignedVAA and get guardian signatures with name
    const guardianSetList = getGuardianSet(guardianSetIndex);
    const vaaBuffer = Buffer.from(vaa, "base64");
    const parsedVaa = parseVaa(vaaBuffer);

    const { emitterAddress, emitterChain, guardianSignatures, hash, sequence } = parsedVaa || {};
    const parsedEmitterAddress = Buffer.from(emitterAddress).toString("hex");
    const parsedHash = Buffer.from(hash).toString("hex");
    const parsedSequence = Number(sequence);
    const parsedGuardianSignatures = guardianSignatures?.map(({ index, signature }) => ({
      index,
      signature: Buffer.from(signature).toString("hex"),
      name: guardianSetList?.[index]?.name,
    }));

    const newVAAData = {
      ...VAAData,
      vaa,
      decodedVaa: {
        ...parsedVaa,
        emitterAddress: parsedEmitterAddress,
        guardianSignatures: parsedGuardianSignatures,
        hash: parsedHash,
        sequence: parsedSequence,
      },
    };

    setParsedVAAData(newVAAData);
    setEmitterChainId(emitterChain as ChainId);
  }, [vaa, VAAData, guardianSetIndex]);

  return (
    <BaseLayout>
      <div className="tx-page">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <Top txHash={VAADataTxHash} emitterChainId={emitterChainId} payloadType={payloadType} />
            <Information VAAData={parsedVAAData} txData={txData as GetTransactionsOutput} />
          </>
        )}
      </div>
    </BaseLayout>
  );
};

export default Tx;
