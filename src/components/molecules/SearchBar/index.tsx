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
          {isLoading ? (
            <span className="search-loader"></span>
          ) : (
            <svg
              className="icon"
              fill="none"
              height="22"
              viewBox="0 0 22 22"
              width="22"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.2499 19.2502L15.1378 15.1307L19.2499 19.2502ZM17.4166 9.62516C17.4166 11.6916 16.5957 13.6735 15.1345 15.1347C13.6732 16.5959 11.6914 17.4168 9.62492 17.4168C7.55844 17.4168 5.5766 16.5959 4.11538 15.1347C2.65416 13.6735 1.83325 11.6916 1.83325 9.62516C1.83325 7.55868 2.65416 5.57684 4.11538 4.11562C5.5766 2.6544 7.55844 1.8335 9.62492 1.8335C11.6914 1.8335 13.6732 2.6544 15.1345 4.11562C16.5957 5.57684 17.4166 7.55868 17.4166 9.62516V9.62516Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
