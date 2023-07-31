import { Path, useNavigate, useSearchParams } from "react-router-dom";
import { parseTo } from "../route";
import { Network } from "@certusone/wormhole-sdk";

export function useNavigateCustom() {
  const realNavigate = useNavigate();
  const [searchParams] = useSearchParams();
  const network = searchParams.get("network")?.toUpperCase() as Network;

  const navigate = (to: string | Partial<Path>) => {
    realNavigate(parseTo(to, network));
  };

  return navigate;
}
