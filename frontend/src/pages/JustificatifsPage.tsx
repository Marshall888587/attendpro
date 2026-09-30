import { useEffect, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { Pagination } from "../components/Pagination";
import * as justificatifService from "../services/justificatif.service";
import { documentAbsoluteUrl } from "../services/justificatif.service";
import { Justificatif } from "../types";

export function JustificatifsPage() {
  const [justificatifs, setJustificatifs] = useState<Justificatif[]>([]);
  const [statut, setStatut] = useState("EN_ATTENTE");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [processingId, setProcessingId] = useState<number | null>(null);

  function load() {
    justificatifService.listJustificatifs({ page, statut: statut || undefined }).then((res) => {
      setJustificatifs(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statut, page]);

  async function handleTreat(id: number, next: "ACCEPTE" | "REFUSE") {
    setProcessingId(id);
    try {
      await justificatifService.treatJustificatif(id, next);
      load();
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Justificatifs d'absence</h1>
        <p className="mt-1 text-sm text-slate-500">Validez ou refusez les justificatifs soumis par les étudiants.</p>
      </div>

      <div className="flex gap-2">
        {[
          { value: "EN_ATTENTE", label: "En attente" },
          { value: "ACCEPTE", label: "Acceptés" },
          { value: "REFUSE", label: "Refusés" },
          { value: "", label: "Tous" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setPage(1);
              setStatut(opt.value);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              statut === opt.value ? "bg-primary-900 text-white" : "border border-slate-200 text-slate-600"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Étudiant</th>
              <th className="px-6 py-3">Séance concernée</th>
              <th className="px-6 py-3">Motif</th>
              <th className="px-6 py-3">Statut</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {justificatifs.map((j) => (
              <tr key={j.id} className="border-t border-slate-100">
                <td className="px-6 py-3 font-medium text-slate-800">
                  {j.etudiant?.prenom} {j.etudiant?.nom}
                </td>
                <td className="px-6 py-3 text-slate-600">
                  {j.presence?.cours ? new Date(j.presence.cours.date).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="px-6 py-3 max-w-xs text-slate-600">
                  <p>{j.motif}</p>
                  {j.documentUrl && (
                    <a
                      href={documentAbsoluteUrl(j.documentUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs font-medium text-primary-700 transition-colors hover:text-primary-900"
                    >
                      Voir la pièce jointe
                    </a>
                  )}
                </td>
                <td className="px-6 py-3">
                  <StatusBadge status={j.statut} />
                </td>
                <td className="px-6 py-3">
                  {j.statut === "EN_ATTENTE" && (
                    <div className="flex gap-2">
                      <button
                        disabled={processingId === j.id}
                        onClick={() => handleTreat(j.id, "ACCEPTE")}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Accepter
                      </button>
                      <button
                        disabled={processingId === j.id}
                        onClick={() => handleTreat(j.id, "REFUSE")}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {justificatifs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  Aucun justificatif.
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
