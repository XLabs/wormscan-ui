import * as TabsPrimitive from "@radix-ui/react-tabs";
import "./styles.scss";
import { useEffect, useState } from "react";

type Props = {
  headers: (React.ReactNode | string)[];
  contents: (React.ReactNode | string)[];
  className?: string;
  activeTab?: string;
};

const Tabs = ({ activeTab, headers, contents, className = "" }: Props) => {
  const [tabValue, setTabValue] = useState("tabs-0");

  useEffect(() => {
    setTabValue(activeTab ? activeTab : "tabs-0");
  }, [activeTab, headers]);

  return (
    <TabsPrimitive.Root
      className={`tabs ${className}`}
      value={tabValue}
      onValueChange={setTabValue}
    >
      <TabsPrimitive.List className="tabs-list">
        {headers?.length > 0 &&
          headers.map((header, index) => {
            return (
              <TabsPrimitive.Trigger
                key={`tabs-${index}`}
                className="tabs-trigger"
                value={`tabs-${index}`}
              >
                {header}
              </TabsPrimitive.Trigger>
            );
          })}
      </TabsPrimitive.List>

      {contents?.length > 0 &&
        contents.map((content, index) => {
          return (
            <TabsPrimitive.Content
              key={`tabs-${index}`}
              className="tabs-content"
              value={`tabs-${index}`}
            >
              {content}
            </TabsPrimitive.Content>
          );
        })}
    </TabsPrimitive.Root>
  );
};

export default Tabs;
