import { useTranslation } from "react-i18next";
import { NETWORK } from "src/types";
import "./styles.scss";

type Props = {
  network: NETWORK;
};

const Banner = ({ network }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="banner">
      <div className="banner-content"> {t("banner.network", { network: network })}</div>
    </div>
  );
};

export default Banner;
