import { NavLink as RealNavLink, NavLinkProps } from "react-router-dom";

const NavLink = (props: NavLinkProps) => {
  const goTop = () => window.scrollTo(0, 0);

  return (
    <RealNavLink {...props} onClick={goTop}>
      {props.children}
    </RealNavLink>
  );
};

export default NavLink;
