import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import client from "src/api/Client";
import { Loader } from "src/components/atoms";
import { BaseLayout } from "src/layouts/BaseLayout";
import { Information } from "./Information";
import { Top } from "./Top";
import { useParams } from "react-router-dom";
import { VAADetail } from "@xlabs-libs/wormscan-sdk";
import { parseVaa } from "@certusone/wormhole-sdk";
import { Buffer } from "buffer";
import "./styles.scss";
import { getGuardianSet } from "../../conts";

const Tx = () => {
  const { txHash } = useParams();
  const [VAAId, setVAAId] = useState<string>("");
  const [parsedVAAData, setParsedVAAData] = useState<
    (Omit<VAADetail, "vaa"> & { vaa: any }) | undefined
  >(undefined);
  const vaaIdSplit = VAAId.split("/");
  const chainId = Number(vaaIdSplit?.[0]);
  const emitter = vaaIdSplit?.[1];
  const seq = Number(vaaIdSplit?.[2]);

  const {
    isLoading: VAADataIsLoading,
    error: VAAError,
    data: VAAData,
  } = useQuery(
    ["getVAA", txHash],
    () =>
      client.guardianNetwork.getVAAbyTxHash({
        query: {
          txHash,
          parsedPayload: true,
        },
      }),
    {
      onSuccess: vaa => {
        console.log({ vaa });
        const { id } = vaa || {};
        id && setVAAId(id);
      },
    },
  );

  const {
    isLoading: globalTxIsLoading,
    error: globalTxError,
    data: globalTxData,
  } = useQuery(
    ["globalTx"],
    () =>
      client.guardianNetwork.getGlobalTx({
        chainId,
        emitter,
        seq,
        query: {
          parsedPayload: true,
        },
      }),
    { enabled: Boolean(VAAId) },
  );

  const { vaa, payload, guardianSetIndex } = VAAData || {};
  const { payloadType } = payload || {};

  useEffect(() => {
    if (!vaa) return;

    // Decode SignedVAA and get guardian signatures with name
    const guardianSetList = getGuardianSet(guardianSetIndex);
    const vaaBuffer = Buffer.from(vaa, "base64");
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

    console.log("SignedVAA Parsed", parsedVAAData);

    setParsedVAAData(parsedVAAData);
  }, [vaa]);

  return (
    <BaseLayout>
      <div className="tx-page">
        {VAADataIsLoading || globalTxIsLoading || !Boolean(parsedVAAData) ? (
          <div className="tx-page-loader">
            <Loader />
          </div>
        ) : (
          <>
            <Top txHash={txHash} payloadType={payloadType} />
            <Information VAAData={parsedVAAData} globalTxData={globalTxData} />
          </>
        )}
      </div>
    </BaseLayout>
  );
};

export { Tx };
