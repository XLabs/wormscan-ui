import React, { forwardRef, useState } from "react";
import { useMutation } from "react-query";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useRecoilState } from "recoil";
import { useEnvironment } from "src/context/EnvironmentContext";
import { loadPageState } from "src/utils/recoilStates";
import { useNavigateCustom } from "src/utils/hooks";
import analytics from "src/analytics";
import { getClient } from "src/api/Client";

interface Props {
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onFocus: React.FocusEventHandler<HTMLInputElement>;
  ref: React.RefObject<HTMLInputElement>;
}

const Search = forwardRef<HTMLInputElement, Props>((props, ref) => {
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

    let value = searchValue;
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
    <form className="search-bar" data-testid="search-form" onSubmit={handleSearch}>
      <div className="search-bar-input">
        {isLoading || loadingPage ? (
          <span className="search-loader"></span>
        ) : (
          <MagnifyingGlassIcon height={24} width={24} />
        )}

        <input
          {...props}
          aria-label={t("home.header.search.ariaLabel")}
          disabled={isLoading}
          name="Search"
          onChange={e => setSearchValue(e.target.value)}
          placeholder={t("home.header.search.placeholder")}
          ref={ref}
          type="text"
          value={searchValue}
        />
      </div>
    </form>
  );
});

Search.displayName = "Search";

export default Search;
