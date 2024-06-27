import { Path, useNavigate, useSearchParams } from "react-router-dom";
import { Network } from "@wormhole-foundation/sdk/dist/cjs";
import { parseTo } from "../../route";

function useNavigateCustom() {
  const realNavigate = useNavigate();
  const [searchParams] = useSearchParams();
  const network = searchParams.get("network")?.toUpperCase() as Network;

  const navigate = (to: string | Partial<Path>, params = {}) => {
    realNavigate(parseTo(to, network), params);
  };

  return navigate;
}

export default useNavigateCustom;
