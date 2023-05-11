import { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import client from "src/api/Client";
import "./styles.scss";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { mutate: mutateFindVAAByAddress } = useMutation(
    "findVAAByAddress",
    ({ address }: { address: string }) =>
      client.search.findVAAByAddress({
        address,
      }),
    {
      onSuccess: response => {
        const { data } = response || {};
        const { vaas } = data || {};
        console.log({ vaas });
      },
    },
  );

  const { mutate: mutateFindVAAByTxHash } = useMutation(
    "findVAAByTxHash",
    ({ txHash }: { txHash: string }) =>
      client.guardianNetwork.getVAAbyTxHash({
        txHash,
        parsedPayload: true,
      }),
    {
      onSuccess: vaa => {
        console.log({ vaa });
        const { txHash } = vaa || {};
        txHash && navigate(`/tx/${txHash}`);
      },
    },
  );

  interface FormData {
    address: { value: string };
  }

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { address } = e.target as typeof e.target & FormData;
    let { value } = address;
    if (value) {
      value = value.trim();
      mutateFindVAAByAddress({ address: value });
      mutateFindVAAByTxHash({
        txHash: value,
      });
    }
  };

  return (
    <section className="home-hero">
      <div className="home-hero-text">{t("home.hero.text")}</div>

      <form onSubmit={handleSearch} data-testid="search-form">
        <div className="home-hero-search">
          <div className="home-hero-search-input">
            <input
              type="text"
              name="address"
              placeholder={t("home.hero.placeholder")}
              aria-label={t("home.hero.search")}
            />
          </div>
          <button type="submit">
            <MagnifyingGlassIcon className="icon" />
          </button>
        </div>
      </form>
    </section>
  );
};

export { Hero };
