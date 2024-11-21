import { NavLink as RouterLink, NavLinkProps, useSearchParams } from "react-router-dom";
import { Network } from "@wormhole-foundation/sdk";
import { parseTo } from "src/utils/route";

const NavLink = (props: NavLinkProps | any) => {
  const { to, onClick } = props;
  const goTop = () => window.scrollTo(0, 0);
  const [searchParams] = useSearchParams();
  const network = searchParams.get("network") as Network;

  const handleOnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick && onClick(e);
    goTop();
  };

  if (!to) return <div className={props.className}>{props.children}</div>;

  return (
    <RouterLink className="navlink" {...props} to={parseTo(to, network)} onClick={handleOnClick}>
      {props.children}
    </RouterLink>
  );
};

export default NavLink;
