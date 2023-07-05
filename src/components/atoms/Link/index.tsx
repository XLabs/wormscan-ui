import { Link as RouterLink, LinkProps, useSearchParams } from "react-router-dom";
import { NETWORK } from "src/types";
import { parseTo } from "src/utils/route";
import "./style.scss";

const Link = (props: LinkProps & { asNavLink?: boolean }) => {
  const { to, asNavLink = true } = props;
  const goTop = (asNavLink: boolean) => asNavLink && window.scrollTo(0, 0);
  const [searchParams] = useSearchParams();
  const network = searchParams.get("network") as NETWORK;

  return (
    <RouterLink
      className="link"
      {...props}
      to={parseTo(to, network)}
      onClick={() => goTop(asNavLink)}
    >
      {props.children}
    </RouterLink>
  );
};

export default Link;
