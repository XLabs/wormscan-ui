import { LayersIcon } from "src/icons/generic";
import { MORE_INFO_GOVERNOR_URL } from "src/consts";
import "./styles.scss";

const GovernorHeader = () => {
  return (
    <div className="governor-header">
      <h1 className="governor-header-title">
        <LayersIcon width={24} />
        Governor
      </h1>
      <p className="governor-header-description">
        The Wormhole Governor is an added security measure that enhances stability and safety by
        setting thresholds for transaction sizes and volume.{" "}
        <a
          className="governor-header-description-link"
          href={MORE_INFO_GOVERNOR_URL}
          target="_blank"
          rel="noreferrer"
        >
          Learn more
        </a>
      </p>
    </div>
  );
};

export default GovernorHeader;
