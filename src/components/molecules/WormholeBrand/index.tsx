import BrandImage from "src/assets/brand.svg";
import "./styles.scss";

type Props = {
  size?: "regular" | "small" | "auto";
};

const WormholeBrand = ({ size = "auto" }: Props) => {
  return (
    <div className="wormhole-brand">
      <img
        src={BrandImage}
        alt="Wormhole Scan logo"
        className={`wormhole-brand-image ${size}`}
        loading="lazy"
        width="180"
        height="34"
      />
    </div>
  );
};

export default WormholeBrand;
