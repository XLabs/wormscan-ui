import { Path, useNavigate, useSearchParams } from "react-router-dom";
import { Network } from "@certusone/wormhole-sdk";
import { parseTo } from "../route";

export function useNavigateCustom() {
  const realNavigate = useNavigate();
  const [searchParams] = useSearchParams();
  const network = searchParams.get("network")?.toUpperCase() as Network;

  const navigate = (to: string | Partial<Path>, params = {}) => {
    realNavigate(parseTo(to, network), params);
  };

  return navigate;
}
