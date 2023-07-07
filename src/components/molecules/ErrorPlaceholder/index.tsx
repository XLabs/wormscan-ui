import DefaultErrorImage from "src/icons/errors/default.svg";
import ChartErrorImage from "src/icons/errors/chart.svg";
import SankeyErrorImage from "src/icons/errors/sankey.svg";
import "./styles.scss";

type Props = {
  errorText?: string;
  errorType?: "chart" | "sankey" | "default";
};

const ERROR_IMAGES = {
  chart: ChartErrorImage,
  sankey: SankeyErrorImage,
  default: DefaultErrorImage,
};

const ErrorPlaceholder = ({
  errorText = "No data source for this report",
  errorType = "default",
}: Props) => {
  return (
    <div className="error-placeholder">
      <div className="error-placeholder-image">
        <img src={ERROR_IMAGES[errorType]} alt="" loading="lazy" width="100" height="78"></img>
      </div>
      <div className="error-placeholder-text">{errorText}</div>
    </div>
  );
};

export default ErrorPlaceholder;
