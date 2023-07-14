import { useState } from "react";
import SearchBar from "src/components/molecules/SearchBar";
import "./styles.scss";
import { useEnvironment } from "src/pages/RelayerDashboard/context/EnvironmentContext";

const Search = () => {
  const { setUserInput } = useEnvironment();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <SearchBar
      value={searchValue}
      onValueChange={setSearchValue}
      onSubmit={() => {
        setUserInput(searchValue);
      }}
      className="header-search-bar"
      name="search"
      placeholder="Search by TxHash / EmmiterSEQ / VAA"
      ariaLabel="Search"
      isLoading={isLoading}
    />
  );
};

export default Search;
