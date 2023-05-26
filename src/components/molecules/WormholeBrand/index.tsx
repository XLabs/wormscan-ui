import WormholeIcon from "src/icons/WormholeIcon";
import "./styles.scss";

type Props = {
  width: number;
  height: number;
};

const WormholeBrand = ({ width, height }: Props) => {
  return (
    <div className="wormhole-brand">
      <WormholeIcon width={width} height={height} />
      <div className="wormhole-brand-text">
        <span className="wormhole-brand-title">WORMSCAN</span>
        <div className="wormhole-brand-subtitle">Wormhole Explorer</div>
      </div>
    </div>
  );
};

export default WormholeBrand;
