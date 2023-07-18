import { useEffect, useRef, useState } from "react";
import SearchBar from "src/components/molecules/SearchBar";
import { useEnvironment } from "src/pages/RelayerDashboard/context/EnvironmentContext";
import { useSearchParams } from "react-router-dom";
import "./styles.scss";

const Search = () => {
  const { setUserInput } = useEnvironment();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState(searchParams.get("userInput"));
  const mounted = useRef(false);

  useEffect(() => {
    if (searchValue) {
      setSearchParams(prev => {
        prev.set("userInput", searchValue);
        return prev;
      });
      if (!mounted.current && searchValue) {
        setUserInput(searchValue);
      }
    } else {
      setSearchParams(prev => {
        prev.delete("userInput");
        return prev;
      });
    }

    mounted.current = true;
  }, [searchValue, setSearchParams, setUserInput]);

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
