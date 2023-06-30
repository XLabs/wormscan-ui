import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import { Loader } from "src/components/atoms";
import { BaseLayout } from "src/layouts/BaseLayout";
import { Information } from "./Information";
import { Top } from "./Top";
import { useParams, useSearchParams } from "react-router-dom";
import { VAADetail } from "@xlabs-libs/wormscan-sdk";
import { ChainId, parseVaa } from "@certusone/wormhole-sdk";
import { Buffer } from "buffer";
import { getGuardianSet } from "../../consts";
import { NETWORK } from "src/types";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import "./styles.scss";

const STALE_TIME = 1000 * 10;

const Tx = () => {
  const navigate = useNavigateCustom();
  const { txHash } = useParams();
  const [searchParams] = useSearchParams();
  const network = searchParams.get("network") as NETWORK;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emitterChainId, setEmitterChainId] = useState<ChainId | undefined>(undefined);
  const [VAAId, setVAAId] = useState<string>("");
  const [parsedVAAData, setParsedVAAData] = useState<
    (Omit<VAADetail, "vaa"> & { vaa: any }) | undefined
  >(undefined);
  const vaaIdSplit = VAAId.split("/");
  const chainId = Number(vaaIdSplit?.[0]);
  const emitter = vaaIdSplit?.[1];
  const seq = Number(vaaIdSplit?.[2]);

  useEffect(() => {
    setIsLoading(true);
  }, [txHash]);

  useEffect(() => {
    if (!network) return;

    setIsLoading(true);
  }, [network]);

  const { data: VAAData } = useQuery(
    ["getVAA", txHash],
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
    },
  );

  useEffect(() => {
    if (!VAAData) return;

    const { id } = VAAData || {};
    id && setVAAId(id);
  }, [VAAData]);

  const { vaa, payload, guardianSetIndex } = VAAData || {};
  const { payloadType } = payload || {};

  const { data: globalTxData } = useQuery(
    ["globalTx", VAAId],
    () =>
      getClient().guardianNetwork.getGlobalTx({
        chainId,
        emitter,
        seq,
        query: {
          parsedPayload: true,
        },
      }),
    {
      enabled: Boolean(VAAId),
      onSuccess: () => setIsLoading(false),
      onError: () => navigate(`/search-not-found/${txHash}`),
    },
  );

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

    const parsedVAAData = {
      ...VAAData,
      vaa: {
        ...parsedVaa,
        emitterAddress: parsedEmitterAddress,
        guardianSignatures: parsedGuardianSignatures,
        hash: parsedHash,
        sequence: parsedSequence,
      },
    };

    setParsedVAAData(parsedVAAData);
    setEmitterChainId(emitterChain as ChainId);
  }, [vaa, VAAData, guardianSetIndex]);

  return (
    <BaseLayout>
      <div className="tx-page">
        {isLoading ? (
          <div className="tx-page-loader">
            <Loader />
          </div>
        ) : (
          <>
            <Top txHash={txHash} emitterChainId={emitterChainId} payloadType={payloadType} />
            <Information VAAData={parsedVAAData} globalTxData={globalTxData} />
          </>
        )}
      </div>
    </BaseLayout>
  );
};

export { Tx };
