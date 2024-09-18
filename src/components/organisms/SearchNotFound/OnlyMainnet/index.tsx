import { useEnvironment } from "src/context/EnvironmentContext";
import "../styles.scss";

const OnlyMainnet = () => {
  const { environment, setEnvironment } = useEnvironment();

  return (
    <div className="only-mainnet">
      <p className="only-mainnet-text">Page available on Mainnet network.</p>

      <p className="only-mainnet-text">
        To view on MAINNET click{" "}
        <button className="only-mainnet-text-link" onClick={() => setEnvironment("Mainnet")}>
          HERE
        </button>
      </p>
    </div>
  );
};

export default OnlyMainnet;
