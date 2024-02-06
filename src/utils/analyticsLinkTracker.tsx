import React, { ReactNode, useEffect } from "react";
import analytics from "src/analytics";

export const AnalyticsLinkTracker = (props: { children: ReactNode }) => {
  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      let target = event.target as HTMLElement;

      // link can be clicked directly on target or on parent element (for dynamic urls)
      while (target) {
        // Check if the current element is an <a> tag with an href attribute
        if (target.tagName === "A" && target.getAttribute("href")) {
          const href = target.getAttribute("href");

          analytics.track("linkClicked", {
            selected: href,
          });

          // Exit the loop after tracking
          break;
        }

        // Move up to the parent element
        target = target.parentElement;
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
