import { useEffect, useState } from "react";
import { StatusBadge } from "../../components/StatusBadge";
import * as statsService from "../../services/stats.service";

export function StudentHistoryPage() {
  const [presences, setPresences] = useState<any[]>([]);

  useEffect(() => {
    statsService.getMyStats().then((res: any) => setPresences(res.presences ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mon historique</h1>
        <p className="mt-1 text-sm text-slate-500">L'ensemble de vos séances enregistrées.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Matière</th>
              <th className="px-6 py-3">Enregistré le</th>
              <th className="px-6 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {presences.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-6 py-3 text-slate-600">{new Date(p.cours.date).toLocaleDateString("fr-FR")}</td>
                <td className="px-6 py-3 text-slate-600">{p.cours.affectation.matiere.nomMatiere}</td>
                <td className="px-6 py-3 text-slate-400">
                  {new Date(p.heureEnregistrement).toLocaleString("fr-FR")}
                </td>
                <td className="px-6 py-3">
                  <StatusBadge status={p.statut} />
                </td>
              </tr>
            ))}
            {presences.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  Aucune séance enregistrée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
