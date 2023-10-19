import BrandImage from "src/assets/brand.svg";
import "./styles.scss";

type Props = {
  width?: number;
  height?: number;
  size?: "regular" | "small" | "auto";
};

const WormholeBrand = ({ width = 36.75, height = 32.25, size = "auto" }: Props) => {
  return (
    <div className="wormhole-brand">
      <img
        src={BrandImage}
        alt="Wormhole Scan logo"
        className={`wormhole-brand-image ${size}`}
        loading="lazy"
        width="187"
        height="34"
      />
    </div>
  );
};

export default WormholeBrand;
