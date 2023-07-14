import { useEffect, useState } from "react";
import SearchBar from "src/components/molecules/SearchBar";
import "./styles.scss";
import { useEnvironment } from "src/pages/RelayerDashboard/context/EnvironmentContext";

const Search = () => {
  const { userInput, setUserInput } = useEnvironment();

  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setSearchValue(userInput);
  }, [userInput]);

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
      isLoading={false}
    />
  );
};

export default Search;
