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
  disableNextButton?: boolean;
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
  disableNextButton = false,
}: Props) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className={`pagination ${className}`}>
      {goFirstPage && (
        <button onClick={goFirstPage} disabled={disabled || isFirstPage}>
          &lt;&lt;
        </button>
      )}

      <button onClick={goPrevPage} disabled={disabled || isFirstPage}>
        &lt;
      </button>

      <span className="pagination-current">{currentPage}</span>

      <button onClick={goNextPage} disabled={disabled || disableNextButton || isLastPage}>
        &gt;
      </button>

      {goLastPage && (
        <button
          className="pagination-last-page"
          onClick={goLastPage}
          disabled={disabled || true || isLastPage}
        >
          &gt;&gt;
        </button>
      )}
    </div>
  );
};

export default Pagination;
