import WormholeIcon from "src/icons/WormholeIcon";
import BrandImage from "src/assets/brand.svg";
import "./styles.scss";

type Props = {
  onlyIcon?: boolean;
  width?: number;
  height?: number;
};

const WormholeBrand = ({ width = 36.75, height = 32.25, onlyIcon }: Props) => {
  return (
    <div className="wormhole-brand">
      {onlyIcon ? (
        <WormholeIcon width={width} height={height} />
      ) : (
        <>
          <img src={BrandImage} alt="Wormhole Scan logo" className="wormhole-brand-image" />
        </>
      )}
    </div>
  );
};

export default WormholeBrand;
