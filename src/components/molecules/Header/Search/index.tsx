import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import { getClient } from "src/api/Client";
import SearchBar from "../../SearchBar";

interface FormData {
  search: { value: string };
}

const Search = () => {
  const navigate = useNavigateCustom();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState("");

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
      onError: (_err, { address }) => {
        // Navigate to tx page if by address fails
        const txHash = address;
        navigate(`/tx/${txHash}`);
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { search } = e.target as typeof e.target & FormData;
    let { value } = search;
    if (value && value.trim()) {
      value = value.trim();

      setIsLoading(true);

      // Check if is probably a VAA ID
      const splitId = value.split("/");
      if (splitId.length === 3) {
        setIsLoading(false);
        navigate(`/tx/${value}`);
      } else {
        // Check by address, if fails, navigate to tx page
        mutateFindVAAByAddress({ address: value });
      }
    }
    setSearchValue("");
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
