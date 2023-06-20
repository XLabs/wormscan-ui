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
  const searchType = useRef<"vaaId" | "other">("other");
  const searchString = useRef("");
  const errorsCount = useRef(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const goSearchNotFound = () => {
    const searchNotFoundURL = `/search-not-found?q=${searchString.current}`;
    if (searchType.current === "vaaId") return navigate(searchNotFoundURL);

    errorsCount.current += 1;
    if (errorsCount.current >= 2) {
      navigate(searchNotFoundURL);
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
      onSuccess: (_, { address }) => {
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

  const { mutate: mutateFindVAAById } = useMutation(
    "findVAAById",
    ({ id }: { id: string }) => {
      const splitId = id.split("/");
      const chainId = Number(splitId[0]);
      const emitter = String(splitId[1]);
      const seq = Number(splitId[2]);

      return client.guardianNetwork.getVAA({
        chainId,
        emitter,
        seq,
      });
    },
    {
      onSuccess: vaa => {
        if ("txHash" in vaa) {
          const { txHash } = vaa || {};
          txHash ? navigate(`/tx/${txHash}`) : goSearchNotFound();
        }
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
      searchType.current = "other";

      setIsLoading(true);

      // Check if is probably a VAA ID
      const splitId = value.split("/");
      if (splitId.length === 3) {
        searchType.current = "vaaId";
        mutateFindVAAById({
          id: value,
        });
      } else {
        // Check by address and txHash
        mutateFindVAAByAddress({ address: value });
        mutateFindVAAByTxHash({
          txHash: value,
        });
      }
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
