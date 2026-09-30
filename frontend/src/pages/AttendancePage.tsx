import { useEffect, useMemo, useState } from "react";
import * as attendanceService from "../services/attendance.service";
import { Affectation, Cours, EtudiantWithPresence, StatutPresence } from "../types";

const TIME_SLOTS = [
  { label: "08:00 - 10:00", heureDebut: "08:00", heureFin: "10:00" },
  { label: "10:15 - 12:15", heureDebut: "10:15", heureFin: "12:15" },
  { label: "14:00 - 16:00", heureDebut: "14:00", heureFin: "16:00" },
  { label: "16:15 - 18:15", heureDebut: "16:15", heureFin: "18:15" },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function AttendancePage() {
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [classeId, setClasseId] = useState("");
  const [matiereId, setMatiereId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [slotIndex, setSlotIndex] = useState("");
  const [salle, setSalle] = useState("");

  const [cours, setCours] = useState<Cours | null>(null);
  const [etudiants, setEtudiants] = useState<EtudiantWithPresence[]>([]);
  const [statuts, setStatuts] = useState<Record<number, StatutPresence>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    attendanceService.listAffectations().then(setAffectations);
  }, []);

  const classesOptions = useMemo(() => {
    const seen = new Map<number, string>();
    affectations.forEach((a) => {
      if (a.classe) seen.set(a.classeId, a.classe.nomClasse);
    });
    return [...seen.entries()];
  }, [affectations]);

  const matiereOptions = useMemo(
    () => affectations.filter((a) => String(a.classeId) === classeId),
    [affectations, classeId]
  );

  async function loadSeance() {
    if (!classeId || !matiereId || !date || slotIndex === "") return;
    const slot = TIME_SLOTS[Number(slotIndex)];
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await attendanceService.getOrCreateSeance({
        classeId: Number(classeId),
        matiereId: Number(matiereId),
        date,
        heureDebut: slot.heureDebut,
        heureFin: slot.heureFin,
        salle: salle || undefined,
      });
      setCours(res.cours);
      setEtudiants(res.etudiants);
      if (res.cours.salle) setSalle(res.cours.salle);
      const initial: Record<number, StatutPresence> = {};
      res.etudiants.forEach((e) => {
        initial[e.id] = e.presence?.statut ?? "PRESENT";
      });
      setStatuts(initial);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Impossible de charger la séance.");
      setCours(null);
      setEtudiants([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSeance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classeId, matiereId, date, slotIndex]);

  function handleSalleBlur() {
    if (cours) loadSeance();
  }

  function setAllPresent() {
    const next: Record<number, StatutPresence> = {};
    etudiants.forEach((e) => (next[e.id] = "PRESENT"));
    setStatuts(next);
  }

  function reset() {
    loadSeance();
  }

  async function handleSave() {
    if (!cours) return;
    setSaving(true);
    setError(null);
    try {
      await attendanceService.saveBulkPresence(
        cours.id,
        etudiants.map((e) => ({ etudiantId: e.id, statut: statuts[e.id] ?? "PRESENT" }))
      );
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  const presentsCount = Object.values(statuts).filter((s) => s === "PRESENT").length;
  const absentsCount = Object.values(statuts).filter((s) => s === "ABSENT").length;
  const retardsCount = Object.values(statuts).filter((s) => s === "RETARD").length;

  const statusButtons: { statut: StatutPresence; label: string }[] = [
    { statut: "PRESENT", label: "Présent" },
    { statut: "RETARD", label: "Retard" },
    { statut: "ABSENT", label: "Absent" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Gestion quotidienne</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Enregistrement des Présences</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Sélectionnez la classe et la séance, puis marquez la présence de chaque étudiant. Assurez-vous de sauvegarder avant de quitter la page.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-right">
          <p className="text-xs font-semibold uppercase text-slate-400">Date du jour</p>
          <p className="text-sm font-semibold text-slate-700">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Classe</label>
          <select
            value={classeId}
            onChange={(e) => {
              setClasseId(e.target.value);
              setMatiereId("");
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="">Sélectionner une classe</option>
            {classesOptions.map(([id, nom]) => (
              <option key={id} value={id}>
                {nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Matière</label>
          <select
            value={matiereId}
            onChange={(e) => setMatiereId(e.target.value)}
            disabled={!classeId}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">Sélectionner une matière</option>
            {matiereOptions.map((a) => (
              <option key={a.id} value={a.matiereId}>
                {a.matiere?.nomMatiere}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Séance / Heure</label>
          <select
            value={slotIndex}
            onChange={(e) => setSlotIndex(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="">Choisir un horaire</option>
            {TIME_SLOTS.map((s, i) => (
              <option key={s.label} value={i}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Salle</label>
          <input
            type="text"
            value={salle}
            onChange={(e) => setSalle(e.target.value)}
            onBlur={handleSalleBlur}
            placeholder="Amphi A"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
      {success && <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">Présences enregistrées avec succès.</p>}

      {loading && <p className="text-sm text-slate-500">Chargement de la séance...</p>}

      {!loading && cours && (
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="flex items-center gap-3 text-lg font-semibold text-slate-800">
              Liste des Étudiants
              <span className="rounded-full bg-primary-900 px-3 py-1 text-xs font-semibold text-white">
                {etudiants.length} Inscrits
              </span>
              {cours?.salle && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Salle {cours.salle}
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={setAllPresent}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Tous Présents
              </button>
              <button
                onClick={reset}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Nom complet</th>
                <th className="px-6 py-3">Matricule</th>
                <th className="px-6 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {etudiants.map((e, i) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-6 py-3 text-slate-500">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-6 py-3 font-medium text-slate-800">
                    {e.prenom} {e.nom}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 font-mono text-xs text-slate-500">{e.matricule}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      {statusButtons.map((btn) => {
                        const active = statuts[e.id] === btn.statut;
                        return (
                          <button
                            key={btn.statut}
                            onClick={() => setStatuts((prev) => ({ ...prev, [e.id]: btn.statut }))}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              active
                                ? btn.statut === "PRESENT"
                                  ? "bg-primary-900 text-white"
                                  : btn.statut === "RETARD"
                                  ? "bg-amber-500 text-white"
                                  : "bg-red-600 text-white"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            {btn.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <div className="flex gap-6 text-sm">
              <span className="text-slate-500">
                Présents <span className="font-bold text-primary-800">{presentsCount}</span>
              </span>
              <span className="text-slate-500">
                Absents <span className="font-bold text-red-600">{absentsCount}</span>
              </span>
              <span className="text-slate-500">
                Retards <span className="font-bold text-amber-600">{retardsCount}</span>
              </span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer les présences"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
