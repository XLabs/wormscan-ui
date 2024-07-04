import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "src/icons/generic";

const CopyContent = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  return (
    <>
      {copied ? (
        <div style={{ marginRight: 6 }}>
          <CheckIcon width={24} />
        </div>
      ) : (
        <div
          style={{ marginRight: 6 }}
          onClick={async () => {
            setCopied(true);
            await navigator.clipboard.writeText(text);
          }}
        >
          <CopyIcon width={24} />
        </div>
      )}
    </>
  );
};

export default CopyContent;
