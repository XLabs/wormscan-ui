import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import { getClient } from "src/api/Client";
import SearchBar from "../../SearchBar";

const Search = () => {
  const navigate = useNavigateCustom();
  const { t } = useTranslation();
  const searchType = useRef<"vaaId" | "other">("other");
  const searchString = useRef("");
  const errorsCount = useRef(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState("");
  const queryClient = useQueryClient();

  const goSearchNotFound = (err: Error) => {
    const searchNotFoundURL = `/search-not-found?q=${searchString.current}`;
    let statusCode = 404;

    if (err?.message) {
      // get the status code from the error message
      statusCode = parseInt(err?.message?.match(/\d+/)?.[0], 10);
    }

    if (searchType.current === "vaaId") {
      return navigate(searchNotFoundURL, {
        state: {
          status: statusCode,
        },
      });
    }

    errorsCount.current += 1;
    if (errorsCount.current >= 2) {
      navigate(searchNotFoundURL, {
        state: {
          status: statusCode,
        },
      });
    }
  };

  const { mutate: mutateFindVAAByAddress } = useMutation(
    ({ address }: { address: string }) => {
      try {
        return getClient().search.findVAAByAddress({
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
      onError: (err: Error) => {
        goSearchNotFound(err);
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  const { mutate: mutateFindVAAByTxHash } = useMutation(
    ({ txHash }: { txHash: string }) =>
      getClient().guardianNetwork.getVAAbyTxHash({
        query: {
          txHash,
          parsedPayload: true,
        },
      }),
    {
      onSuccess: (vaa, params) => {
        const { txHash } = vaa?.[0] || {};
        if (txHash) {
          queryClient.setQueryData(["getVAAbyTxHash", txHash], vaa);
          navigate(`/tx/${txHash}`);
        } else {
          navigate(`/tx/${params.txHash}`);
        }
      },
      onError: (_err, params) => {
        navigate(`/tx/${params.txHash}`);
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  const { mutate: mutateFindVAAById } = useMutation(
    ({ id }: { id: string }) => {
      const splitId = id.split("/");
      const chainId = Number(splitId[0]);
      const emitter = String(splitId[1]);
      const seq = Number(splitId[2]);

      return getClient().guardianNetwork.getVAA({
        chainId,
        emitter,
        seq,
        query: {
          parsedPayload: true,
        },
      });
    },
    {
      onSuccess: vaa => {
        if ("id" in vaa) {
          const { id: VAAId } = vaa || {};

          if (VAAId) {
            queryClient.setQueryData(["getVAA", VAAId], vaa);
            navigate(`/tx/${VAAId}`);
          } else {
            goSearchNotFound(new Error("Request failed with status code 404"));
          }
        }
      },
      onError: (err: Error) => {
        goSearchNotFound(err);
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
    localStorage.removeItem("attemptsMade");
    localStorage.removeItem("reloadRedirect");

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

      setSearchValue("");
    }
  };

  return (
    <SearchBar
      value={searchValue}
      onValueChange={setSearchValue}
      onSubmit={handleSearch}
      className="header-search-bar"
      name="search"
      placeholder={t("home.header.search.placeholder")}
      ariaLabel={t("home.header.search.ariaLabel")}
      isLoading={isLoading}
    />
  );
};

export default Search;
