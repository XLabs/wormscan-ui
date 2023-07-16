import { Tabs } from "src/components/organisms";
import Overview from "./Overview";
import RawData from "./RawData";
import Advanced from "./Advanced";
import { DeliveryLifecycleRecord } from "src/pages/RelayerDashboard/utils/VaaUtils";
import { useState } from "react";

interface Props {
  lifecycleRecords: DeliveryLifecycleRecord[];
}

const Information = ({ lifecycleRecords }: Props) => {
  const [activeTab, setActiveTab] = useState("tabs-0");
  const goAdvancedTab = () => {
    setActiveTab("tabs-0");
    setTimeout(() => setActiveTab("tabs-1"), 0);
  };

  return (
    <section
      style={{
        marginTop: 16,
        marginBottom: 32,
      }}
    >
      <Tabs
        activeTab={activeTab}
        headers={["OVERVIEW", "ADVANCED", "RAW DATA"]}
        contents={[
          <>
            <Overview goAdvancedTab={goAdvancedTab} lifecycleRecords={lifecycleRecords} />
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

// parsedVaa.timestamp --> timestamp de la tx mejor.
