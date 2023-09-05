import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import "./styles.scss";

type Props = {
  value: string;
  onValueChange: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  name: string;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
  isLoading?: boolean;
};

const SearchBar = ({
  onSubmit,
  value,
  onValueChange,
  name,
  className = "",
  placeholder = "",
  ariaLabel = "",
  isLoading = false,
}: Props) => {
  return (
    <div className={`search-bar ${className}`}>
      <form onSubmit={onSubmit} data-testid="search-form">
        <div className="search-bar-input">
          <input
            type="text"
            value={value}
            onChange={e => onValueChange(e.target.value)}
            name={name}
            placeholder={placeholder}
            aria-label={ariaLabel}
          />
        </div>
        <button type="submit" aria-label="search">
          {isLoading ? <span className="search-loader"></span> : <MagnifyingGlassIcon className="icon" />}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
