import { Tabs } from "src/components/organisms";
import Overview from "./Overview/index";
import RawData from "./RawData";
import { DeliveryLifecycleRecord } from "src/pages/RelayerDashboard/utils/VaaUtils";

interface Props {
  lifecycleRecords: DeliveryLifecycleRecord[];
}

const Information = ({ lifecycleRecords }: Props) => {
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
            <Overview lifecycleRecords={lifecycleRecords} />
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
