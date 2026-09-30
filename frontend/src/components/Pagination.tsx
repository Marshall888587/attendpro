interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
      <span>
        Page {page} sur {totalPages} — {total} résultats
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
        >
          Précédent
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
