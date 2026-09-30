import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  highlighted?: boolean;
}

export function StatCard({ label, value, hint, icon, highlighted }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlighted ? "border-primary-900 bg-primary-900 text-white" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-wide ${highlighted ? "text-primary-100" : "text-slate-500"}`}>
          {label}
        </span>
        {icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${highlighted ? "bg-white/15" : "bg-primary-50 text-primary-700"}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      {hint && <p className={`mt-1 text-xs ${highlighted ? "text-primary-100" : "text-slate-500"}`}>{hint}</p>}
    </div>
  );
}
