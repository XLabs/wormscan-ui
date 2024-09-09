import Lottie from "react-lottie";
import LoaderAnimation from "src/lotties/loader.json";
import "./styles.scss";

const Loader = () => (
  <div className="loader">
    <Lottie
      options={{
        animationData: LoaderAnimation,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice",
        },
      }}
      height={48}
      isClickToPauseDisabled={true}
      width={48}
    />
  </div>
);

export default Loader;
