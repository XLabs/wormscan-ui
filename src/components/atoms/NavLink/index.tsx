import { NavLink as RouterLink, NavLinkProps, useSearchParams } from "react-router-dom";
import { NETWORK } from "src/types";
import { parseTo } from "src/utils/route";
import "./style.scss";

const NavLink = (props: NavLinkProps) => {
  const { to } = props;
  const goTop = () => window.scrollTo(0, 0);
  const [searchParams] = useSearchParams();
  const network = searchParams.get("network") as NETWORK;

  return (
    <RouterLink className="navlink" {...props} to={parseTo(to, network)} onClick={goTop}>
      {props.children}
    </RouterLink>
  );
};

export default NavLink;
