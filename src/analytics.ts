// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import googleAnalytics from "@analytics/google-analytics";
import Analytics from "analytics";

const analytics = Analytics({
  app: "awesome-app",
  plugins: [
    googleAnalytics({
      measurementIds: ["G-XD1LW6R8X0"],
    }),
  ],
});

analytics.on("page", pageView => {
  console.log(pageView);
});

export default analytics;
