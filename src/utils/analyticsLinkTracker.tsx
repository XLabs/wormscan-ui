import React, { ReactNode, useEffect } from "react";
import analytics from "src/analytics";

export const AnalyticsLinkTracker = (props: { children: ReactNode }) => {
  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if the clicked element is an <a> tag with an href attribute
      if (target.tagName === "A" && target.getAttribute("href")) {
        const href = target.getAttribute("href");

        analytics.track("linkClicked", {
          selected: href,
        });
      }
    };

    // Detect left clicks and middle clicks on links
    document.addEventListener("click", handleLinkClick);
    document.addEventListener("auxclick", handleLinkClick);

    // Cleanup the events listeners on component unmount
    return () => {
      document.removeEventListener("click", handleLinkClick);
      document.removeEventListener("auxclick", handleLinkClick);
    };
  }, []);

  return <>{props.children}</>;
};
