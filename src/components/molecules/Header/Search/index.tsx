import React from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import client from "src/api/Client";
import SearchBar from "../../SearchBar";

const Search = () => {
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
        query: {
          txHash,
          parsedPayload: true,
        },
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
    search: { value: string };
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { search } = e.target as typeof e.target & FormData;
    let { value } = search;
    if (value) {
      value = value.trim();
      mutateFindVAAByAddress({ address: value });
      mutateFindVAAByTxHash({
        txHash: value,
      });
    }
  };

  return (
    <SearchBar
      className="header-search-bar"
      onSubmit={handleSearch}
      name="search"
      placeholder={t("home.header.search.placeholder")}
      ariaLabel={t("home.header.search.ariaLabel")}
    />
  );
};

export default Search;
