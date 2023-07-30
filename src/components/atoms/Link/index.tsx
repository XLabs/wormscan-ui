import { Link as RouterLink, LinkProps, useSearchParams } from "react-router-dom";
import { parseTo } from "src/utils/route";
import "./style.scss";
import { Network } from "@certusone/wormhole-sdk";

const Link = (props: LinkProps & { asNavLink?: boolean }) => {
  const { to, asNavLink = true, ...rest } = props;
  const goTop = (asNavLink: boolean) => asNavLink && window.scrollTo(0, 0);
  const [searchParams] = useSearchParams();
  const network = searchParams.get("network")?.toUpperCase() as Network;

  return (
    <RouterLink
      className="link"
      {...rest}
      to={parseTo(to, network)}
      onClick={() => goTop(asNavLink)}
    >
      {props.children}
    </RouterLink>
  );
};

export default Link;
