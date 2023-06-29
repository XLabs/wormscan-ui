import { Path, useNavigate, useSearchParams } from "react-router-dom";
import { NETWORK } from "src/types";
import { parseTo } from "../route";

export function useNavigateCustom() {
  const realNavigate = useNavigate();
  const [searchParams] = useSearchParams();
  const network = searchParams.get("network") as NETWORK;

  const navigate = (to: string | Partial<Path>) => {
    realNavigate(parseTo(to, network));
  };

  return navigate;
}
