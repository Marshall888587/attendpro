import { ChangeEvent, useEffect, useState } from "react";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { Modal } from "../../components/Modal";
import { IconCheck, IconClasses, IconHistory, IconWarning } from "../../components/Icons";
import * as statsService from "../../services/stats.service";
import * as justificatifService from "../../services/justificatif.service";
import { MyStats } from "../../services/stats.service";

export function StudentDashboardPage() {
  const [stats, setStats] = useState<MyStats | null>(null);
  const [presences, setPresences] = useState<any[]>([]);
  const [justifiedPresenceIds, setJustifiedPresenceIds] = useState<Set<number>>(new Set());
  const [selectedPresenceId, setSelectedPresenceId] = useState<number | null>(null);
  const [motif, setMotif] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  const MAX_SIZE = 5 * 1024 * 1024;

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFileError(null);
    if (f && !ALLOWED_TYPES.includes(f.type)) {
      setFileError("Format non supporté (JPG, PNG, WEBP ou PDF uniquement).");
      setFile(null);
      return;
    }
    if (f && f.size > MAX_SIZE) {
      setFileError("Fichier trop volumineux (max 5 Mo).");
      setFile(null);
      return;
    }
    setFile(f);
  }

  function load() {
    statsService.getMyStats().then((res: any) => {
      setStats(res);
      setPresences(res.presences ?? []);
    });
    justificatifService.listJustificatifs({ pageSize: 100 }).then((res) => {
      setJustifiedPresenceIds(new Set(res.data.map((j) => j.presenceId)));
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmitJustificatif() {
    if (!selectedPresenceId) return;
    setSubmitting(true);
    setError(null);
    try {
      let documentUrl: string | undefined;
      if (file) {
        documentUrl = await justificatifService.uploadJustificatifDocument(file);
      }
      await justificatifService.createJustificatif({ presenceId: selectedPresenceId, motif, documentUrl });
      setSelectedPresenceId(null);
      setMotif("");
      setFile(null);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Erreur lors de la soumission.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!stats) return <p className="text-slate-500">Chargement...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mon espace</h1>
        <p className="mt-1 text-sm text-slate-500">Votre situation de présence.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Séances suivies" value={stats.totalSeances} icon={<IconClasses />} />
        <StatCard label="Présences" value={stats.presents} icon={<IconCheck />} />
        <StatCard label="Absences" value={stats.absents} icon={<IconWarning />} />
        <StatCard label="Taux de présence" value={`${stats.taux}%`} icon={<IconHistory />} highlighted />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Détail des séances</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Matière</th>
              <th className="px-6 py-3">Statut</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {presences.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-6 py-3 text-slate-600">{new Date(p.cours.date).toLocaleDateString("fr-FR")}</td>
                <td className="px-6 py-3 text-slate-600">{p.cours.affectation.matiere.nomMatiere}</td>
                <td className="px-6 py-3">
                  <StatusBadge status={p.statut} />
                </td>
                <td className="px-6 py-3">
                  {p.statut === "ABSENT" &&
                    (justifiedPresenceIds.has(p.id) ? (
                      <span className="text-xs font-medium text-slate-400">Justificatif envoyé</span>
                    ) : (
                      <button
                        onClick={() => setSelectedPresenceId(p.id)}
                        className="text-sm font-medium text-primary-700 transition-colors hover:text-primary-900"
                      >
                        Soumettre un justificatif
                      </button>
                    ))}
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

      {selectedPresenceId && (
        <Modal
          title="Soumettre un justificatif"
          onClose={() => {
            setSelectedPresenceId(null);
            setFile(null);
            setFileError(null);
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Motif</label>
              <textarea
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Expliquez la raison de votre absence..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Pièce jointe <span className="font-normal text-slate-400">(certificat médical, etc., optionnel)</span>
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
              />
              {file && <p className="mt-1 text-xs text-slate-500">{file.name}</p>}
              {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={handleSubmitJustificatif}
              disabled={submitting || motif.length < 5 || !!fileError}
              className="w-full rounded-lg bg-primary-900 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
            >
              {submitting ? "Envoi..." : "Envoyer le justificatif"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
