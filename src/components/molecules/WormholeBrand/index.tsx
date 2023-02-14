import { WormholeIcon } from "src/components/atoms";
import "./styles.scss";

type Props = {
  width: number;
  height: number;
};

const WormholeBrand = ({ width, height }: Props) => {
  return (
    <div className="wormhole-brand">
      <WormholeIcon width={width} height={height} />
      <span>WORMSCAN</span>
    </div>
  );
};

export default WormholeBrand;
