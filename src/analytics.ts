// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import googleAnalytics from "@analytics/google-analytics";
import Analytics from "analytics";

const analytics = Analytics({
  app: "awesome-app",
  plugins: [
    googleAnalytics({
      measurementIds: [process.env.WORMSCAN_ANALYTICS_ID],
    }),
  ],
});

analytics.on("page", pageView => {
  console.log("page view", pageView?.payload?.properties?.title);
});

analytics.on("track", trackEvent => {
  console.log("event track", trackEvent?.payload?.event, trackEvent?.payload?.properties);
});

export default analytics;
