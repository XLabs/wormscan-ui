import { TokenActivity, TopAssets } from "src/components/molecules";
import "./styles.scss";

const Tokens = () => {
  return (
    <div className="tokens-page">
      <TokenActivity />

      <TopAssets />
    </div>
  );
};

export default Tokens;
