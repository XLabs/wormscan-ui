import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import TooManyTries from "./TooManyTries";
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
  const location = useLocation();
  const { pathname } = location;

  const [timer, setTimer] = useState<number>(15);
  const navigate = useNavigateCustom();
  const isMaxAttempts = localStorage.getItem("attemptsMade") === "4";

  useEffect(() => {
    setTimer(15);
  }, [pathname]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (timer <= 1) {
        let attemptsMade = +localStorage.getItem("attemptsMade");
        attemptsMade += 1;
        localStorage.setItem("attemptsMade", attemptsMade.toString());
        localStorage.setItem("q", q);
        window.location.reload();
        return;
      }
      setTimer(prev => prev - 1);
    }, 1000);

    if (isMaxAttempts) {
      clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isMaxAttempts, q, timer]);

  const goHome = () => {
    navigate("/");
  };

  return (
    <div>
      {isMaxAttempts ? (
        <TooManyTries goHome={goHome} />
      ) : (
        <>
          {errorCode !== 500 && errorCode !== 502 && errorCode !== 503 && (
            <Error400 q={q} timer={timer} goHome={goHome} />
          )}
          {errorCode === 500 && <Error500 timer={timer} goHome={goHome} />}
          {errorCode === 502 && <Error502 timer={timer} goHome={goHome} />}
          {errorCode === 503 && <Error503 timer={timer} goHome={goHome} />}
        </>
      )}
    </div>
  );
};

export default SearchNotFound;
