import "./styles.scss";

const Loader = () => (
  <div className="loader">
    <div className="loader-container">
      <div className="loader-circle loader-circle-large" />
      <div className="loader-circle loader-circle-medium" />
      <div className="loader-circle loader-circle-small" />
      <div className="loader-circle loader-circle-smallest" />
      <div className="loader-circle loader-circle-dot" />
    </div>
  </div>
);

export default Loader;
