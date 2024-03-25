import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

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
        <CheckIcon height={16} width={16} />
      ) : (
        <CopyIcon
          height={14}
          width={14}
          onClick={async () => {
            setCopied(true);
            await navigator.clipboard.writeText(text);
          }}
        />
      )}
    </>
  );
};

export default CopyContent;
