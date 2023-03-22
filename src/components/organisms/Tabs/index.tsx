import * as TabsPrimitive from "@radix-ui/react-tabs";
import "./styles.scss";

type Props = {
  headers: (React.ReactNode | string)[];
  contents: (React.ReactNode | string)[];
  className?: string;
};

const Tabs = ({ headers, contents, className = "" }: Props) => {
  return (
    <TabsPrimitive.Root className={`tabs ${className}`} defaultValue="tabs-0">
      <TabsPrimitive.List className="tabs-list" aria-label="Manage your account">
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
