import { Tabs } from "src/components/organisms";
import Overview from "./Overview/index";
import RawData from "./RawData";
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
  const records = lifecycleRecords.filter(record => !!record.vaa);
  const navigate = useNavigate();

  const txsData: any = useQueries(
    records.map((record, idx) => ({
      queryKey: ["getTransactions", record.vaa],
      queryFn: () => {
        const parsedVaa = parseVaa(record.vaa);

        const chainId = parsedVaa.emitterChain;
        const emitter = Buffer.from(parsedVaa.emitterAddress).toString("hex");
        const seq = Number(parsedVaa.sequence);

        return getClient().search.getTransactions({ chainId, emitter, seq });
      },
      staleTime: Infinity,
      onSuccess: (data: GetTransactionsOutput) => {
        console.log("success getting tx!", idx, data);
      },
      onError: (err: unknown) => {
        console.log("error getting tx", idx, err);
        // navigate(`/search-not-found/${txHash}`)
      },
    })),
  );

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
        headers={["OVERVIEW", "RAW DATA"]}
        contents={[
          <>
            <Overview
              txsData={txsData as GetTransactionsOutput[]}
              lifecycleRecords={lifecycleRecords}
            />
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
