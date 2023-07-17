import { useEffect, useRef, useState } from "react";
import SearchBar from "src/components/molecules/SearchBar";
import "./styles.scss";
import { useEnvironment } from "src/pages/RelayerDashboard/context/EnvironmentContext";

const params = new URLSearchParams(window.location.search);
const queryParams: { [key: string]: string } = {};
for (const param of params) {
  queryParams[param[0]] = param[1];
}

const Search = () => {
  const { userInput, setUserInput } = useEnvironment();

  function updateQueryParams(key: string, value: string | null) {
    const url = new URL(window.location.href);
    if (value === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
    window.history.pushState({}, "", url.toString());
  }

  const [searchValue, setSearchValue] = useState(queryParams.userInput);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) {
      setSearchValue(userInput);
    } else {
      mounted.current = true;
    }
  }, [userInput]);

  useEffect(() => {
    if (searchValue) {
      updateQueryParams("userInput", searchValue);
    } else {
      updateQueryParams("userInput", null);
    }
  }, [searchValue]);

  return (
    <SearchBar
      value={searchValue ?? ""}
      onValueChange={setSearchValue}
      onSubmit={ev => {
        ev.preventDefault();
        setUserInput(searchValue);
      }}
      className="header-search-bar"
      name="search"
      placeholder="Search by TxHash / EmmiterSEQ / VAA"
      ariaLabel="Search"
      isLoading={false}
    />
  );
};

export default Search;
