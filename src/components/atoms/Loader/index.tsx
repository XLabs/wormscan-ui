import LoaderGif from "src/assets/loader.gif";
import "./styles.scss";

// Note: I am keeping the former loader code, just in case I need it in the future.
// const Loader = () => <span className="spinner-loader" />;
const Loader = () => (
  <div className="loader-container">
    <img className="gif-loader" src={LoaderGif} alt="spinner-loader" />
  </div>
);

export default Loader;
