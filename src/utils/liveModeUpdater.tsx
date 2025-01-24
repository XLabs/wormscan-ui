import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { liveModeState } from "./recoilStates";

const LiveModeUpdater: React.FC = () => {
  const { pathname } = useLocation();
  const setLiveMode = useSetRecoilState(liveModeState);

  useEffect(() => {
    if (!pathname.startsWith("/tx")) {
      setLiveMode(true);
    }
  }, [pathname, setLiveMode]);

  return null;
};

export default LiveModeUpdater;
