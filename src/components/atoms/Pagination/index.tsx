import "./styles.scss";

type Props = {
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
};

const Pagination = ({
  goFirstPage,
  goPrevPage,
  currentPage = 1,
  goNextPage,
  goLastPage,
  goPage,
  totalPages = Infinity,
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

      {goPage ? (
        <PageNumbers currentPage={currentPage} goPage={goPage} />
      ) : (
        <span className={`pagination number current`}>{currentPage}</span>
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
}: {
  currentPage?: number;
  goPage?: (pageNumber: number) => void;
}) => {
  const TOTAL_PREV_VISIBLE_PAGES = 2;
  const isPrevOffset = currentPage - TOTAL_PREV_VISIBLE_PAGES >= TOTAL_PREV_VISIBLE_PAGES;
  const firstPrevOffsetPageNumber = currentPage - TOTAL_PREV_VISIBLE_PAGES;
  const pages = [...Array(5)].map((_, i) => (isPrevOffset ? firstPrevOffsetPageNumber + i : i + 1));

  return (
    <>
      {pages.map((page, index) => (
        <button
          key={index}
          className={`pagination number ${page === currentPage ? "current" : "page"}`}
          onClick={() => goPage && goPage(page)}
        >
          {page}
        </button>
      ))}
    </>
  );
};

export default Pagination;
