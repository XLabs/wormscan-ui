import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import "./styles.scss";

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  name: string;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
};

const SearchBar = ({ onSubmit, name, className = "", placeholder = "", ariaLabel = "" }: Props) => {
  return (
    <div className={`search-bar ${className}`}>
      <form onSubmit={onSubmit} data-testid="search-form">
        <div className="search-bar-input">
          <input type="text" name={name} placeholder={placeholder} aria-label={ariaLabel} />
        </div>
        <button type="submit">
          <MagnifyingGlassIcon className="icon" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
