// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import googleAnalytics from "@analytics/google-analytics";
import Analytics from "analytics";

const isProd = process.env.NODE_ENV === "production";

const analytics = isProd
  ? Analytics({
      app: "awesome-app",
      plugins: [
        googleAnalytics({
          measurementIds: [process.env.WORMSCAN_ANALYTICS_ID],
          gtagConfig: {
            anonymize_ip: true,
          },
        }),
      ],
    })
  : {
      track: () => null as any,
      page: () => null as any,
    };

export default analytics;
