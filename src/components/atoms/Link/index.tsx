import { Link as RouterLink, LinkProps, useSearchParams } from "react-router-dom";
import { NETWORK } from "src/types";
import { parseTo } from "src/utils/route";
import "./style.scss";

const Link = (props: LinkProps) => {
  const { to } = props;
  const goTop = () => window.scrollTo(0, 0);
  const [searchParams] = useSearchParams();
  const network = searchParams.get("network") as NETWORK;

  return (
    <RouterLink className="link" {...props} to={parseTo(to, network)} onClick={goTop}>
      {props.children}
    </RouterLink>
  );
};

export default Link;
