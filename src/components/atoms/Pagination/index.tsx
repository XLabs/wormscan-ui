import "./styles.scss";

interface IProps {
  className?: string;
  currentPage?: number;
  disabled?: boolean;
  disableNextButton?: boolean;
  goFirstPage?: () => void;
  goLastPage?: () => void;
  goNextPage?: () => void;
  goPage?: (pageNumber: number) => void;
  goPrevPage?: () => void;
  style?: object;
  totalPages?: number | undefined;
  visiblePages?: number;
}

const Pagination = ({
  className = "",
  currentPage = 1,
  disabled = false,
  disableNextButton = false,
  goFirstPage,
  goLastPage,
  goNextPage,
  goPage,
  goPrevPage,
  style = {},
  totalPages = Infinity,
  visiblePages = 5,
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

      <div className="pagination-pages">
        {goPage ? (
          <PageNumbers
            currentPage={currentPage}
            disableNextButton={disableNextButton}
            goPage={goPage}
            visiblePages={visiblePages}
          />
        ) : (
          <span className={`pagination current`}>{currentPage}</span>
        )}
      </div>

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
  disableNextButton,
  goPage,
  visiblePages,
}: {
  currentPage?: number;
  disableNextButton?: boolean;
  goPage?: (pageNumber: number) => void;
  visiblePages?: number;
}) => {
  const TOTAL_PREV_VISIBLE_PAGES = 2;
  const isPrevOffset = currentPage - TOTAL_PREV_VISIBLE_PAGES >= TOTAL_PREV_VISIBLE_PAGES;
  const firstPrevOffsetPageNumber = currentPage - TOTAL_PREV_VISIBLE_PAGES;
  const pages = [...Array(visiblePages)].map((_, i) =>
    isPrevOffset ? firstPrevOffsetPageNumber + i : i + 1,
  );

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
