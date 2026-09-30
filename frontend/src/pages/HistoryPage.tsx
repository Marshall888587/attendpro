import { useEffect, useMemo, useState } from "react";
import { Pagination } from "../components/Pagination";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { SortableTh } from "../components/SortableTh";
import { IconChart, IconClasses, IconHistory, IconWarning } from "../components/Icons";
import * as attendanceService from "../services/attendance.service";
import * as classService from "../services/class.service";
import * as subjectService from "../services/subject.service";
import * as teacherService from "../services/teacher.service";
import * as studentService from "../services/student.service";
import { HistoryEntry } from "../services/attendance.service";
import { Classe, Enseignant, Etudiant, Matiere } from "../types";
import { useAuth } from "../hooks/useAuth";

export function HistoryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<attendanceService.GlobalAttendanceStats | null>(null);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);

  const [classeId, setClasseId] = useState("");
  const [matiereId, setMatiereId] = useState("");
  const [enseignantId, setEnseignantId] = useState("");
  const [etudiantId, setEtudiantId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [dateOrder, setDateOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    classService.listClasses({ pageSize: 100 }).then((res) => setClasses(res.data));
    subjectService.listMatieres().then(setMatieres);
    if (isAdmin) {
      attendanceService.getGlobalStats().then(setStats);
      teacherService.listTeachers({ pageSize: 100 }).then((res) => setEnseignants(res.data));
      studentService.listStudents({ pageSize: 100 }).then((res) => setEtudiants(res.data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    attendanceService
      .listHistory({
        page,
        classeId: classeId ? Number(classeId) : undefined,
        matiereId: matiereId ? Number(matiereId) : undefined,
        enseignantId: enseignantId ? Number(enseignantId) : undefined,
        etudiantId: etudiantId ? Number(etudiantId) : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortOrder: dateOrder,
      })
      .then((res) => {
        setEntries(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      });
  }, [classeId, matiereId, enseignantId, etudiantId, dateFrom, dateTo, page, dateOrder]);

  function handleSortDate() {
    setDateOrder((o) => (o === "asc" ? "desc" : "asc"));
    setPage(1);
  }

  const csvContent = useMemo(() => {
    const header = ["Date", "Heure", "Classe", "Matière", "Enseignant", "Présents", "Absents", "Retards", "Taux"];
    const rows = entries.map((e) => [
      new Date(e.date).toLocaleDateString("fr-FR"),
      e.heureDebut,
      e.classe.nomClasse,
      e.matiere.nomMatiere,
      `${e.enseignant.prenom} ${e.enseignant.nom}`,
      e.presents,
      e.absents,
      e.retards,
      `${e.taux}%`,
    ]);
    return [header, ...rows].map((r) => r.join(";")).join("\n");
  }, [entries]);

  function handleExportCsv() {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `historique-presences-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setClasseId("");
    setMatiereId("");
    setEnseignantId("");
    setEtudiantId("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Historique des présences</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Consultez et analysez les enregistrements de présence passés. Utilisez les filtres pour affiner votre recherche.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Exporter (CSV)
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
          >
            Imprimer
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Taux de présence global" value={`${stats?.tauxPresenceGlobal ?? 0}%`} icon={<IconChart />} />
          <StatCard label="Total absences" value={stats?.totalAbsences ?? "—"} icon={<IconWarning />} />
          <StatCard label="Total retards" value={stats?.totalRetards ?? "—"} icon={<IconHistory />} />
          <StatCard label="Cours annulés" value={stats?.coursAnnules ?? "—"} icon={<IconClasses />} />
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Filtres de recherche</h2>
          <button onClick={resetFilters} className="text-sm font-medium text-primary-700 transition-colors hover:text-primary-900">
            Réinitialiser les filtres
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Du</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setPage(1);
                setDateFrom(e.target.value);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Au</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setPage(1);
                setDateTo(e.target.value);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Classe</label>
            <select
              value={classeId}
              onChange={(e) => {
                setPage(1);
                setClasseId(e.target.value);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="">Toutes les classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nomClasse}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Matière</label>
            <select
              value={matiereId}
              onChange={(e) => {
                setPage(1);
                setMatiereId(e.target.value);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="">Toutes les matières</option>
              {matieres.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nomMatiere}
                </option>
              ))}
            </select>
          </div>
          {isAdmin && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Enseignant</label>
                <select
                  value={enseignantId}
                  onChange={(e) => {
                    setPage(1);
                    setEnseignantId(e.target.value);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <option value="">Tous les enseignants</option>
                  {enseignants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.prenom} {t.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Étudiant</label>
                <select
                  value={etudiantId}
                  onChange={(e) => {
                    setPage(1);
                    setEtudiantId(e.target.value);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <option value="">Tous les étudiants</option>
                  {etudiants.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.prenom} {s.nom}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <SortableTh label="Date & Heure" field="date" sortBy="date" sortOrder={dateOrder} onSort={handleSortDate} />
              <th className="px-6 py-3">Classe</th>
              <th className="px-6 py-3">Matière & Enseignant</th>
              {etudiantId ? (
                <th className="px-6 py-3">Statut de l'étudiant</th>
              ) : (
                <>
                  <th className="px-6 py-3">Présents</th>
                  <th className="px-6 py-3">Absents</th>
                  <th className="px-6 py-3">Retards</th>
                  <th className="px-6 py-3">Taux</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="px-6 py-3">
                  <p className="font-medium text-slate-800">{new Date(e.date).toLocaleDateString("fr-FR")}</p>
                  <p className="text-xs text-slate-400">
                    {e.heureDebut}
                    {e.heureFin ? ` - ${e.heureFin}` : ""}
                  </p>
                </td>
                <td className="px-6 py-3">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{e.classe.nomClasse}</span>
                </td>
                <td className="px-6 py-3">
                  <p className="font-medium text-slate-700">{e.matiere.nomMatiere}</p>
                  <p className="text-xs text-slate-400">
                    {e.enseignant.prenom} {e.enseignant.nom}
                  </p>
                </td>
                {etudiantId ? (
                  <td className="px-6 py-3">
                    {e.etudiantStatut ? <StatusBadge status={e.etudiantStatut} /> : <span className="text-slate-400">—</span>}
                  </td>
                ) : (
                  <>
                    <td className="px-6 py-3 font-semibold text-emerald-600">{e.presents}</td>
                    <td className="px-6 py-3 font-semibold text-red-600">{e.absents}</td>
                    <td className="px-6 py-3 font-semibold text-amber-600">{e.retards}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`font-semibold ${e.taux >= 90 ? "text-emerald-600" : e.taux >= 75 ? "text-amber-600" : "text-red-600"}`}
                      >
                        {e.taux}%
                      </span>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={etudiantId ? 4 : 7} className="px-6 py-8 text-center text-slate-400">
                  Aucune séance trouvée pour ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>
    </div>
  );
}
