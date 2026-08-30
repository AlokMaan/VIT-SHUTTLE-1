import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

/**
 * Reusable data table with sort, filter, pagination, and responsive card fallback.
 *
 * Props:
 * - columns: [{ key, label, sortable?, render?(value, row) }]
 * - data: array of row objects
 * - pageSize: number (default 10)
 * - searchable: boolean (default true)
 * - searchPlaceholder: string
 * - onRowClick: (row) => void
 * - emptyMessage: string
 * - actions: (row) => ReactNode (rendered in last column)
 */
export default function DataTable({
  columns = [],
  data = [],
  pageSize = 10,
  searchable = true,
  searchPlaceholder = 'Search...',
  onRowClick,
  emptyMessage = 'No data found',
  actions,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some(({ key }) => {
        const val = row[key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Reset page when search changes
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div>
      {/* Search */}
      {searchable && (
        <div className="mb-4">
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2.5"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <Search size={16} style={{ color: 'var(--text-4)' }} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-sm"
              style={{ color: 'var(--text)' }}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 font-semibold whitespace-nowrap"
                  style={{
                    color: 'var(--text-3)',
                    borderBottom: '1px solid var(--border)',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                  }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
              {actions && (
                <th
                  className="text-right px-4 py-3 font-semibold"
                  style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-12"
                  style={{ color: 'var(--text-4)' }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr
                  key={row._id || row.id || idx}
                  className="transition-colors duration-150"
                  style={{
                    background: idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)',
                    borderBottom: '1px solid var(--border)',
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                  onClick={() => onRowClick?.(row)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)')
                  }
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3" style={{ color: 'var(--text-2)' }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: 'var(--text-4)' }}>
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)} of{' '}
            {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center border-0 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border-0 cursor-pointer text-xs font-medium transition-colors"
                  style={{
                    background: page === pageNum ? 'var(--primary-bg)' : 'var(--surface-2)',
                    color: page === pageNum ? 'var(--primary)' : 'var(--text-3)',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center border-0 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
