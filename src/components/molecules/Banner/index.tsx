import { ExclamationTriangleIcon, MinusCircledIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import "./styles.scss";

const BannerWarning = () => (
  <div className="banner banner-warning">
    <div className="banner-icon">
      <ExclamationTriangleIcon color="var(--color-alert-100)" width={24} height={24} />
    </div>
    <div className="banner-content">
      <h2 className="banner-content-title">
        <span className="banner-content-title-text">Wormhole Upgrade Approaching</span>{" "}
        <span className="banner-content-title-hyphen">-</span>{" "}
        <span className="banner-content-title-text">Expect Temporary Downtime</span>
      </h2>
      <div className="banner-content-description">
        <p>
          A required upgrade is being coordinated and executed by the network of Wormhole Guardian
          (validator) nodes to add Gateway to the Wormhole stack.{" "}
          <span className="banner-content-description-span-break">
            Please take note that token bridging will pause for several hours on{" "}
            <span className="banner-content-description-span-warning">Monday, August 21, 2023</span>{" "}
            during the upgrade. Follow:{" "}
            <a
              className="banner-content-description-link"
              href="https://x.com/wormholecrypto"
              target="_blank"
              rel="noreferrer"
            >
              @wormholescrypto
            </a>{" "}
            and join the{" "}
            <a
              className="banner-content-description-link"
              href="https://discord.gg/wormholecrypto"
              target="_blank"
              rel="noreferrer"
            >
              Discord
            </a>{" "}
            for updates.
          </span>
        </p>
      </div>
    </div>
  </div>
);

const BannerError = () => (
  <div className="banner banner-error">
    <div className="banner-icon">
      <MinusCircledIcon color="var(--color-error-100)" width={24} height={24} />
    </div>
    <div className="banner-content">
      <h2 className="banner-content-title">
        <span className="banner-content-title-text">Whormhole Upgrade In Progress</span>{" "}
        <span className="banner-content-title-hyphen">-</span>{" "}
        <span className="banner-content-title-text">Temporary Downtime In Effect</span>
      </h2>
      <div className="banner-content-description">
        <p>
          A required upgrade is being executed by the network of Wormhole Guardian (validator) nodes
          to add Gateway to the Wormhole stack.{" "}
          <span className="banner-content-description-span">
            Token bridging is currently paused.
          </span>
        </p>
        <p>
          Follow:{" "}
          <a
            className="banner-content-description-link"
            href="https://x.com/wormholecrypto"
            target="_blank"
            rel="noreferrer"
          >
            @wormholescrypto
          </a>{" "}
          and join the{" "}
          <a
            className="banner-content-description-link"
            href="https://discord.gg/wormholecrypto"
            target="_blank"
            rel="noreferrer"
          >
            Discord
          </a>{" "}
          for updates.
        </p>
      </div>
    </div>
  </div>
);

const BannerSuccess = () => (
  <div className="banner banner-success">
    <div className="banner-icon">
      <CheckCircledIcon color="var(--color-success-100)" width={24} height={24} />
    </div>
    <div className="banner-content">
      <h2 className="banner-content-title">
        Wormhole Upgrade Completed <span className="banner-content-title-hyphen">-</span>{" "}
        <span className="banner-content-title-span">Back Online</span>
      </h2>
      <div className="banner-content-description">
        <p>
          A required upgrade was completed by the network of Wormhole Guardian (validator) nodes to
          add Gateway to the Wormhole stack.{" "}
          <span className="banner-content-description-span">Token bridging is now live.</span>
        </p>
      </div>
    </div>
  </div>
);

const EthBridgeBanner = () => (
  <div className="banner banner-success">
    <div className="banner-icon">
      <ExclamationTriangleIcon color="var(--color-success-100)" width={24} height={24} />
    </div>
    <div className="banner-content">
      <h2 className="banner-content-title">
        Native ETH transfers now live
        {/* <span className="banner-content-title-span">Back Online</span> */}
      </h2>
      <div className="banner-content-description">
        <p>
          Native ETH transfers now live across Eth, Arb, Base, OP, Polygon, BNB, and Avax!{" "}
          <a
            className="banner-content-description-link"
            target="_blank"
            rel="noreferrer"
            href="https://wormhole.com/wormhole-launches-native-token-transfers-starting-with-native-eth-and-wsteth-across-7-evm-chains/"
          >
            Learn more
          </a>{" "}
          about native Eth transfers and{" "}
          <a
            className="banner-content-description-link"
            target="_blank"
            rel="noreferrer"
            href="http://portalbridge.com/"
          >
            get started today!
          </a>{" "}
          Want to integrate into your own Dapps?{" "}
          <a
            className="banner-content-description-link"
            target="_blank"
            rel="noreferrer"
            href="https://docs.wormhole.com/wormhole/quick-start/wh-connect"
          >
            Find out more here.
          </a>
        </p>
      </div>
    </div>
  </div>
);

const Banner = () => {
  function isWarningRange(): boolean {
    const currentDate = new Date();
    const startDate = new Date("2023-08-18T20:00:00Z"); // August 18, 2023, 8:00 PM UTC
    const endDate = new Date("2023-08-21T06:00:00Z"); // August 21, 2023, 6:00 AM UTC

    return currentDate >= startDate && currentDate <= endDate;
  }

  function isErrorRange(): boolean {
    const currentDate = new Date();
    const startDate = new Date("2023-08-21T06:00:00Z"); // August 21, 2023, 6:00 AM UTC
    const endDate = new Date("2023-08-21T09:00:00Z"); // August 21, 2023, 9:00 AM UTC

    return currentDate >= startDate && currentDate <= endDate;
  }

  function isSuccessRange(): boolean {
    const currentDate = new Date();
    const startDate = new Date("2023-08-21T09:00:00Z"); // August 21, 2023, 9:00 AM UTC
    const endDate = new Date("2023-08-22T09:00:00Z"); // August 22, 2023, 9:00 AM UTC

    return currentDate >= startDate && currentDate <= endDate;
  }

  function isEthBridgeDate(): boolean {
    const currentDate = new Date();
    const startDate = new Date("2024-01-17T10:00:00-05:00"); // January 17, 2024, 10:00 AM EST
    const endDate = new Date("2024-01-24T10:00:00-05:00"); // January 24, 2024, 10:00 AM EST

    return currentDate >= startDate && currentDate <= endDate;
  }

  const isWarning = isWarningRange();
  const isError = isErrorRange();
  const isSuccess = isSuccessRange();
  const isEthBridge = isEthBridgeDate();

  if (isWarning) {
    return <BannerWarning />;
  } else if (isError) {
    return <BannerError />;
  } else if (isSuccess) {
    return <BannerSuccess />;
  } else if (isEthBridge) {
    return <EthBridgeBanner />;
  }
};

export default Banner;
