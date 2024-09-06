import { TopAssets } from "src/components/molecules";
import { TokenActivity } from "src/components/organisms";
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
