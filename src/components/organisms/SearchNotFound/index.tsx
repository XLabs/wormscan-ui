import { useNavigateCustom } from "src/utils/hooks";
import Error400 from "./Error400";
import Error500 from "./Error500";
import Error502 from "./Error502";
import Error503 from "./Error503";
import "./styles.scss";

type SearchNotFoundProps = {
  q: string;
  errorCode: number;
};

const SearchNotFound = ({ q, errorCode }: SearchNotFoundProps) => {
  const navigate = useNavigateCustom();

  const goHome = () => {
    navigate("/");
  };

  return (
    <div>
      {errorCode !== 500 && errorCode !== 502 && errorCode !== 503 && (
        <Error400 q={q} goHome={goHome} />
      )}
      {errorCode === 500 && <Error500 goHome={goHome} />}
      {errorCode === 502 && <Error502 goHome={goHome} />}
      {errorCode === 503 && <Error503 goHome={goHome} />}
    </div>
  );
};

export default SearchNotFound;
