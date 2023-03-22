import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import "./styles.scss";

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  className?: string;
  placeholder?: string;
  arialLabel?: string;
};

const SearchBar = ({ onSubmit, className = "", placeholder = "", arialLabel = "" }: Props) => {
  return (
    <div className={`search-bar ${className}`}>
      <form onSubmit={onSubmit}>
        <div className="search-bar-input">
          <input type="text" placeholder={placeholder} aria-label={arialLabel} />
        </div>
        <button type="submit">
          <MagnifyingGlassIcon className="icon" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
