import { useEffect, useMemo, useState } from "react";
import { StatCard } from "../components/StatCard";
import { SimpleAreaChart, SimpleBarChart } from "../components/charts";
import { IconChart, IconWarning } from "../components/Icons";
import * as statsService from "../services/stats.service";
import { ReportStats } from "../services/stats.service";

function absenceBadge(count: number) {
  if (count >= 10) return { label: "Convocation", className: "bg-red-50 text-red-700" };
  if (count >= 5) return { label: "Avertissement", className: "bg-amber-50 text-amber-700" };
  return { label: "À surveiller", className: "bg-slate-100 text-slate-600" };
}

export function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);

  useEffect(() => {
    statsService.getReportStats().then(setStats);
  }, []);

  const csvContent = useMemo(() => {
    if (!stats) return "";
    const header = ["Étudiant", "Classe", "Absences injustifiées", "Dernière absence"];
    const rows = stats.topAbsences.map((s) => [
      s.nom,
      s.classe,
      s.absencesInjustifiees,
      s.derniereAbsence ? new Date(s.derniereAbsence).toLocaleDateString("fr-FR") : "",
    ]);
    return [header, ...rows].map((r) => r.join(";")).join("\n");
  }, [stats]);

  function handleExportExcel() {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rapport-attendpro-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!stats) return <p className="text-slate-500">Chargement...</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between rounded-xl bg-primary-50 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rapports & Statistiques</h1>
          <p className="mt-1 text-sm text-slate-500">Analyse détaillée de l'assiduité sur l'ensemble de l'établissement.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Exporter en PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="rounded-lg bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
          >
            Exporter en Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Taux de présence global" value={`${stats.tauxPresenceGlobal}%`} icon={<IconChart />} />
        <StatCard label="Absences ce mois" value={stats.absencesCeMois} icon={<IconWarning />} />
        <StatCard label="Moyenne par classe" value={`${stats.moyenneParClasse}%`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Évolution des Absences</h2>
          <SimpleAreaChart points={stats.evolutionAbsences.map((e) => e.count)} />
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            {stats.evolutionAbsences.map((e) => (
              <span key={e.mois}>{e.mois}</span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Présence par Matière</h2>
          <div className="space-y-3">
            {stats.presenceParMatiere.map((m) => (
              <div key={m.matiere}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">{m.matiere}</span>
                  <span className="font-semibold text-slate-800">{m.taux}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-primary-700" style={{ width: `${m.taux}%` }} />
                </div>
              </div>
            ))}
            {stats.presenceParMatiere.length === 0 && <p className="text-sm text-slate-400">Aucune donnée.</p>}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Présence par Enseignant</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.presenceParEnseignant.map((e) => (
              <div key={e.enseignant} className="rounded-lg border border-slate-100 p-4">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{e.enseignant}</span>
                  <span className="font-semibold text-slate-800">{e.taux}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-primary-700" style={{ width: `${e.taux}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-400">{e.seances} présences enregistrées</p>
              </div>
            ))}
            {stats.presenceParEnseignant.length === 0 && <p className="text-sm text-slate-400">Aucune donnée.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Top Étudiants (Absences)</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Étudiant</th>
              <th className="px-6 py-3">Classe</th>
              <th className="px-6 py-3">Absences injustifiées</th>
              <th className="px-6 py-3">Dernière absence</th>
              <th className="px-6 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {stats.topAbsences.map((s) => {
              const badge = absenceBadge(s.absencesInjustifiees);
              return (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-medium text-slate-800">{s.nom}</td>
                  <td className="px-6 py-3 text-slate-600">{s.classe}</td>
                  <td className="px-6 py-3 font-semibold text-red-600">{s.absencesInjustifiees}</td>
                  <td className="px-6 py-3 text-slate-500">
                    {s.derniereAbsence ? new Date(s.derniereAbsence).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {stats.topAbsences.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  Aucune absence enregistrée.
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
