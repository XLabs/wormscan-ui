import { Tabs } from "src/components/organisms";
import Overview from "./Overview";
import RawData from "./RawData";
import Advanced from "./Advanced";
import { DeliveryLifecycleRecord } from "src/pages/RelayerDashboard/utils/VaaUtils";

interface Props {
  lifecycleRecords: DeliveryLifecycleRecord[];
}

const Information = ({ lifecycleRecords }: Props) => (
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
          <Overview lifecycleRecords={lifecycleRecords} />
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

export { Information };
