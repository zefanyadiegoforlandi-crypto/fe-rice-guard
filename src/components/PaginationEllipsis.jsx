export default function PaginationEllipsis({ currentPage, totalPages, onPageChange, className = '' }) {
  if (!totalPages || totalPages < 1) return null;

  const siblingCount = 1;
  const pages = new Set([1, totalPages]);

  for (
    let page = Math.max(1, currentPage - siblingCount);
    page <= Math.min(totalPages, currentPage + siblingCount);
    page += 1
  ) {
    pages.add(page);
  }

  const orderedPages = Array.from(pages).sort((a, b) => a - b);
  const items = [];

  orderedPages.forEach((page, index) => {
    const previous = orderedPages[index - 1];
    if (index > 0 && page - previous > 1) {
      items.push({ type: 'ellipsis', key: `ellipsis-${previous}-${page}` });
    }
    items.push({ type: 'page', value: page, key: `page-${page}` });
  });

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-[var(--muted)] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Prev
      </button>

      {items.map((item) =>
        item.type === 'ellipsis' ? (
          <span key={item.key} className="px-2 text-sm font-bold text-gray-400">
            …
          </span>
        ) : (
          <button
            key={item.key}
            onClick={() => onPageChange(item.value)}
            className={`min-w-10 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
              item.value === currentPage
                ? 'bg-[var(--forest)] text-white border-[var(--forest)]'
                : 'border-gray-200 text-[var(--muted)] hover:bg-gray-50'
            }`}
          >
            {item.value}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-[var(--muted)] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}