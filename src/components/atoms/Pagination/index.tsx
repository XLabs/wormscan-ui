import "./styles.scss";

type Props = {
  goFirstPage?: () => void;
  goPrevPage?: () => void;
  currentPage?: number;
  goNextPage?: () => void;
  goLastPage?: () => void;
  totalPages?: number | undefined;
  className?: string;
  disabled?: boolean;
};

const Pagination = ({
  goFirstPage,
  goPrevPage,
  currentPage = 1,
  goNextPage,
  goLastPage,
  totalPages = undefined,
  className,
  disabled = false,
}: Props) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Note: goLastPage button is disabled due to API limitation

  return (
    <div className={`pagination ${className}`}>
      <button onClick={goFirstPage} disabled={disabled || isFirstPage}>
        &lt;&lt;
      </button>
      <button onClick={goPrevPage} disabled={disabled || isFirstPage}>
        &lt;
      </button>
      <span className="pagination-current">{currentPage}</span>
      <button onClick={goNextPage} disabled={disabled || isLastPage}>
        &gt;
      </button>
      <button onClick={goLastPage} disabled={disabled || true || isLastPage}>
        &gt;&gt;
      </button>
    </div>
  );
};

export default Pagination;
