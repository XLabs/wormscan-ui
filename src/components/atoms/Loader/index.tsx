import Lottie from "react-lottie-player";
import LoaderAnimation from "src/lotties/loader.json";
import "./styles.scss";

const Loader = () => (
  <div className="loader">
    <Lottie animationData={LoaderAnimation} loop play style={{ width: 48, height: 48 }} />
  </div>
);

export default Loader;
