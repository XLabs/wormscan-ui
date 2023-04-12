import { NavLink as RealNavLink, NavLinkProps } from "react-router-dom";
import "./style.scss";

const NavLink = (props: NavLinkProps) => {
  const goTop = () => window.scrollTo(0, 0);

  return (
    <RealNavLink className="navlink" {...props} onClick={goTop}>
      {props.children}
    </RealNavLink>
  );
};

export default NavLink;
