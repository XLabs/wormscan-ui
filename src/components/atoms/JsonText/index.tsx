import React from "react";
import "./styles.scss";
import { JsonView } from "react-json-view-lite";
import { addQuotesInKeys } from "src/utils/string";

type Props = {
  data: object;
};

const JsonText = ({ data }: Props) => {
  return (
    <div className="json-view">
      <JsonView
        data={addQuotesInKeys(data)}
        style={{
          basicChildStyle: "json-view-row",
          booleanValue: "json-view-info",
          collapsedContent: "json-view-collapsedContent",
          collapseIcon: "json-view-collapseIcon",
          container: "",
          expandIcon: "json-view-expandIcon",
          label: "json-view-key",
          nullValue: "json-view-info",
          numberValue: "json-view-number",
          otherValue: "json-view-string",
          punctuation: "",
          stringValue: "json-view-string",
          undefinedValue: "json-view-info",
        }}
      />
    </div>
  );
};

export default JsonText;
