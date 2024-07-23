import { useState } from "react";
import { CopyIcon, TriangleDownIcon } from "src/icons/generic";
import { CopyToClipboard } from "src/components/molecules";
import { JsonText } from "src/components/atoms";
import "./styles.scss";

const BlockSection = ({ title, code, id }: { title: string; code: any; id?: string }) => {
  const [showSection, setShowSection] = useState(true);

  if (!code) return null;
  const jsonParsed = JSON.parse(code);

  const addQuotesInKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(addQuotesInKeys);
    } else if (typeof obj === "object" && obj !== null) {
      // newObj = keys with quotes
      const newObj: any = {};

      for (const key in obj) {
        // add quotes to key
        const newKey = `"${key}"`;
        newObj[newKey] = addQuotesInKeys(obj[key]);
      }

      return newObj;
    } else {
      return obj;
    }
  };

  const handleShowSection = () => {
    setShowSection(!showSection);
  };

  return (
    <div className="block-section">
      <button
        className={`block-section-btn ${showSection ? "show" : "hide"}`}
        onClick={handleShowSection}
      >
        {title}
        <TriangleDownIcon />
      </button>

      <div className="block-section-block" id={id || title.replaceAll(" ", "")}>
        <div className="block-section-block-top">
          <div className="block-section-block-title">Transaction data</div>
          <div className="block-section-block-copy">
            <CopyToClipboard toCopy={code}>
              <>
                Copy all <CopyIcon width={24} />
              </>
            </CopyToClipboard>
          </div>
        </div>

        <div className={`block-section-block-body ${showSection ? "show" : "hide"}`}>
          <JsonText data={jsonParsed} />
        </div>
      </div>
    </div>
  );
};

export default BlockSection;
