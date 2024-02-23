import React, { useState } from "react";
import { useMutation } from "react-query";
import { useTranslation } from "react-i18next";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import { getClient } from "src/api/Client";
import SearchBar from "../../SearchBar";
import analytics from "src/analytics";
import { useEnvironment } from "src/context/EnvironmentContext";
import { useRecoilState } from "recoil";
import { loadPageState } from "src/utils/recoilStates";

interface FormData {
  search: { value: string };
}

const Search = () => {
  const { environment } = useEnvironment();
  const navigate = useNavigateCustom();
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingPage, setLoadingPage] = useRecoilState(loadPageState);

  const setSearch = (val: boolean) => {
    if (val) {
      setIsLoading(true);
      setLoadingPage(true);
    } else {
      setIsLoading(false);
      setTimeout(() => {
        setLoadingPage(false);
      }, 1500);
    }
  };

  const { mutate: mutateFindVAAByAddress } = useMutation(
    async ({ address }: { address: string }) => {
      const otherNetwork = environment.network === "MAINNET" ? "TESTNET" : "MAINNET";

      const [currentNetworkResult, otherNetworkResult] = (await Promise.all([
        getClient().guardianNetwork.getOperations({ address }),
        getClient(otherNetwork).guardianNetwork.getOperations({ address }),
      ])) as any;

      if (!!currentNetworkResult?.length) {
        navigate(`/txs?address=${address}&network=${environment.network}`);
      } else if (!!otherNetworkResult?.length) {
        navigate(`/txs?address=${address}&network=${otherNetwork}`);
      } else {
        throw new Error("Both requests failed");
      }
    },
    {
      onError: (_err, { address }) => {
        // Navigate to tx page if by address fails
        const txHash = address;
        navigate(`/tx/${txHash}`);
      },
      onSettled: () => {
        setSearch(false);
      },
    },
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    analytics.track("search", {
      network: environment.network,
    });

    const { search } = e.target as typeof e.target & FormData;
    let { value } = search;
    if (value && value.trim()) {
      value = value.trim();

      setSearch(true);

      // Check if is probably a VAA ID
      const splitId = value.split("/");
      if (splitId.length === 3) {
        setSearch(false);
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
      isLoading={isLoading || loadingPage}
    />
  );
};

export default Search;
