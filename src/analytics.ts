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
  console.log(process.env.WORMSCAN_ANALYTICS_ID, pageView);
});

export default analytics;
