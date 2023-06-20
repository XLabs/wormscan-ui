import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import client from "src/api/Client";
import SearchBar from "../../SearchBar";
import { useRef } from "react";

const Search = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const searchString = useRef("");
  const errorsCount = useRef(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const goSearchNotFound = () => {
    errorsCount.current += 1;
    if (errorsCount.current >= 2) {
      navigate(`/search-not-found/${searchString.current}`);
    }
  };

  const { mutate: mutateFindVAAByAddress } = useMutation(
    "findVAAByAddress",
    ({ address }: { address: string }) => {
      try {
        return client.search.findVAAByAddress({
          address,
        });
      } catch (error) {
        console.log(error);
      }
    },
    {
      onSuccess: (response, { address }) => {
        navigate(`/txs?address=${address}`);
      },
      onError: _ => {
        goSearchNotFound();
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  const { mutate: mutateFindVAAByTxHash } = useMutation(
    "findVAAByTxHash",
    ({ txHash }: { txHash: string }) =>
      client.guardianNetwork.getVAAbyTxHash({
        query: {
          txHash,
          parsedPayload: false,
        },
      }),
    {
      onSuccess: vaa => {
        const { txHash } = vaa || {};
        txHash ? navigate(`/tx/${txHash}`) : goSearchNotFound();
      },
      onError: _ => {
        goSearchNotFound();
      },
      onSettled: () => {
        setIsLoading(false);
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
      errorsCount.current = 0;
      searchString.current = value;

      setIsLoading(true);
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
      isLoading={isLoading}
    />
  );
};

export default Search;
