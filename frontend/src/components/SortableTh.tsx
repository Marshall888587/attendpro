interface SortableThProps {
  label: string;
  field: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
  className?: string;
}

export function SortableTh({ label, field, sortBy, sortOrder, onSort, className }: SortableThProps) {
  const active = sortBy === field;
  return (
    <th className={`px-6 py-3 ${className ?? ""}`}>
      <button
        onClick={() => onSort(field)}
        className={`flex items-center gap-1 hover:text-slate-700 ${active ? "text-slate-700" : ""}`}
      >
        {label}
        <span className="text-[10px] leading-none">{active ? (sortOrder === "asc" ? "▲" : "▼") : "⇅"}</span>
      </button>
    </th>
  );
}
