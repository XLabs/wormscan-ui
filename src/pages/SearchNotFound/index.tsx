import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BaseLayout } from "src/layouts/BaseLayout";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import TooManyTries from "./TooManyTries";
import Error400 from "./Error400";
import Error500 from "./Error500";
import Error502 from "./Error502";
import Error503 from "./Error503";
import "./styles.scss";

const SearchNotFound = () => {
  const location = useLocation();
  const [timer, setTimer] = useState<number>(15);
  const navigate = useNavigateCustom();
  const q = new URLSearchParams(location.search).get("q") || "";
  const { status } = location.state || {};
  const statusCode = status || "400";
  const redirectURL = localStorage.getItem("reloadRedirect");
  const isMaxAttempts = localStorage.getItem("attemptsMade") === "8";

  useEffect(() => {
    // when we reload the page, we want to redirect to the tx page
    const setReloadRedirect = () => {
      if (document.visibilityState === "hidden") {
        if (q === "txs") {
          localStorage.setItem("reloadRedirect", `/txs`);
        } else {
          localStorage.setItem("reloadRedirect", `/tx/${q}`);
        }
      }
    };

    window.addEventListener("unload", setReloadRedirect);
    return () => {
      window.removeEventListener("unload", setReloadRedirect);
    };
  }, [q]);

  useEffect(() => {
    // redirect to the tx page if we have a redirectURL (redirectURL exists when we reload the page)
    if (redirectURL) {
      navigate(redirectURL);
      localStorage.removeItem("reloadRedirect");
    }

    // countdown timer
    const intervalId = setInterval(() => {
      if (timer <= 1) {
        if (q === "txs") {
          navigate("/txs");
        } else {
          navigate(`/tx/${q}`);
        }
        let attemptsMade = +localStorage.getItem("attemptsMade");
        attemptsMade += 1;
        localStorage.setItem("attemptsMade", attemptsMade.toString());
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
  }, [redirectURL, navigate, timer, q, isMaxAttempts]);

  const goHome = () => {
    navigate("/");
  };

  return (
    <BaseLayout>
      {!redirectURL && (
        <>
          {isMaxAttempts ? (
            <TooManyTries goHome={goHome} />
          ) : (
            <>
              {statusCode !== 500 && statusCode !== 502 && statusCode !== 503 && (
                <Error400 q={q} timer={timer} goHome={goHome} />
              )}
              {statusCode === 500 && <Error500 timer={timer} goHome={goHome} />}
              {statusCode === 502 && <Error502 timer={timer} goHome={goHome} />}
              {statusCode === 503 && <Error503 timer={timer} goHome={goHome} />}
            </>
          )}
        </>
      )}
    </BaseLayout>
  );
};

export default SearchNotFound;
