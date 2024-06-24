import "./styles.scss";

interface IProps {
  goFirstPage?: () => void;
  goPrevPage?: () => void;
  currentPage?: number;
  goNextPage?: () => void;
  goLastPage?: () => void;
  goPage?: (pageNumber: number) => void;
  totalPages?: number | undefined;
  className?: string;
  disabled?: boolean;
  disableNextButton?: boolean;
  style?: object;
}

const Pagination = ({
  goFirstPage,
  goPrevPage,
  currentPage = 1,
  goNextPage,
  goLastPage,
  goPage,
  totalPages = Infinity,
  className = "",
  disabled = false,
  disableNextButton = false,
  style = {},
}: IProps) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className={`pagination ${className}`} style={style}>
      {goFirstPage && (
        <button onClick={goFirstPage} disabled={disabled || isFirstPage}>
          &lt;&lt;
        </button>
      )}

      <button onClick={goPrevPage} disabled={disabled || isFirstPage}>
        &lt;
      </button>

      {goPage ? (
        <PageNumbers
          currentPage={currentPage}
          disableNextButton={disableNextButton}
          goPage={goPage}
        />
      ) : (
        <span className={`pagination current`}>{currentPage}</span>
      )}

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

const PageNumbers = ({
  currentPage,
  goPage,
  disableNextButton,
}: {
  currentPage?: number;
  goPage?: (pageNumber: number) => void;
  disableNextButton?: boolean;
}) => {
  const TOTAL_PREV_VISIBLE_PAGES = 2;
  const isPrevOffset = currentPage - TOTAL_PREV_VISIBLE_PAGES >= TOTAL_PREV_VISIBLE_PAGES;
  const firstPrevOffsetPageNumber = currentPage - TOTAL_PREV_VISIBLE_PAGES;
  const pages = [...Array(5)].map((_, i) => (isPrevOffset ? firstPrevOffsetPageNumber + i : i + 1));

  return pages.map((page, index) => (
    <button
      key={index}
      className={`pagination ${page === currentPage ? "current" : "page"}`}
      onClick={() => goPage && goPage(page)}
      disabled={page === currentPage || (disableNextButton && page > currentPage)}
    >
      {page}
    </button>
  ));
};

export default Pagination;
