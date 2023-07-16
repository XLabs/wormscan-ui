import { Tabs } from "src/components/organisms";
import Overview from "./Overview";
import RawData from "./RawData";
import Advanced from "./Advanced";
import { DeliveryLifecycleRecord } from "src/pages/RelayerDashboard/utils/VaaUtils";
import { useQueries, useQuery } from "react-query";
import { parseVaa } from "@certusone/wormhole-sdk";
import { getClient } from "src/api/Client";
import { useNavigate } from "react-router-dom";
import { GetTransactionsOutput } from "@xlabs-libs/wormscan-sdk";

interface Props {
  lifecycleRecords: DeliveryLifecycleRecord[];
}

const Information = ({ lifecycleRecords }: Props) => {
  // const txsData: any = useQueries(
  //   lifecycleRecords.map((record, idx) => ({
  //     queryKey: ["getTransactions", record.vaa],
  //     queryFn: () => {
  //       const parsedVaa = parseVaa(record.vaa);

  //       const chainId = parsedVaa.emitterChain;
  //       const emitter = Buffer.from(parsedVaa.emitterAddress).toString("hex");
  //       const seq = Number(parsedVaa.sequence);

  //       return getClient().search.getTransactions({ chainId, emitter, seq });
  //     },
  //     staleTime: Infinity,
  //     onSuccess: (data: GetTransactionsOutput) => {
  //       console.log("success getting tx!", idx, data);
  //     },
  //     onError: (err: unknown) => {
  //       console.log("error getting tx", idx, err);
  //       // navigate(`/search-not-found/${txHash}`)
  //     },
  //   })),
  // );

  // const { payload } = (txData as GetTransactionsOutput) || {};
  // const { payloadType } = payload || {};

  return (
    <section
      style={{
        marginTop: 16,
        marginBottom: 32,
      }}
    >
      <Tabs
        headers={["OVERVIEW", "ADVANCED", "RAW DATA"]}
        contents={[
          <>
            <Overview
              // txsData={txsData as GetTransactionsOutput[]}
              lifecycleRecords={lifecycleRecords}
            />
          </>,
          <>
            <Advanced lifecycleRecords={lifecycleRecords} />
          </>,
          <>
            <RawData lifecycleRecords={lifecycleRecords} />
          </>,
        ]}
      />
    </section>
  );
};

export { Information };

// put the sender address a la derecha de contract address

// if delivery provider matches default one, no need to show it
// if delivery provider === refund provider ==> not show refund provider

// target address should be the leftiest thing on overview

// binance smart chain --> BNB chain

// parsedVaa.timestamp --> timestamp de la tx mejor.
