const styles: Record<string, string> = {
  ACTIF: "bg-emerald-50 text-emerald-700",
  INACTIF: "bg-slate-100 text-slate-500",
  EN_CONGE: "bg-amber-50 text-amber-700",
  PRESENT: "bg-emerald-50 text-emerald-700",
  ABSENT: "bg-red-50 text-red-700",
  RETARD: "bg-amber-50 text-amber-700",
  ABSENCE_JUSTIFIEE: "bg-blue-50 text-blue-700",
  EN_ATTENTE: "bg-amber-50 text-amber-700",
  ACCEPTE: "bg-emerald-50 text-emerald-700",
  REFUSE: "bg-red-50 text-red-700",
};

const labels: Record<string, string> = {
  ACTIF: "Actif",
  INACTIF: "Inactif",
  EN_CONGE: "En congé",
  PRESENT: "Présent",
  ABSENT: "Absent",
  RETARD: "Retard",
  ABSENCE_JUSTIFIEE: "Justifiée",
  EN_ATTENTE: "En attente",
  ACCEPTE: "Acceptée",
  REFUSE: "Refusée",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}
