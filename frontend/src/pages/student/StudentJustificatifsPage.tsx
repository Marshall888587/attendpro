import { useEffect, useState } from "react";
import { StatusBadge } from "../../components/StatusBadge";
import * as justificatifService from "../../services/justificatif.service";
import { documentAbsoluteUrl } from "../../services/justificatif.service";
import { Justificatif } from "../../types";

export function StudentJustificatifsPage() {
  const [justificatifs, setJustificatifs] = useState<Justificatif[]>([]);

  useEffect(() => {
    justificatifService.listJustificatifs().then((res) => setJustificatifs(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mes justificatifs</h1>
        <p className="mt-1 text-sm text-slate-500">Suivez l'état de vos justificatifs d'absence.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Date de soumission</th>
              <th className="px-6 py-3">Séance concernée</th>
              <th className="px-6 py-3">Motif</th>
              <th className="px-6 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {justificatifs.map((j) => (
              <tr key={j.id} className="border-t border-slate-100">
                <td className="px-6 py-3 text-slate-600">{new Date(j.dateSoumission).toLocaleDateString("fr-FR")}</td>
                <td className="px-6 py-3 text-slate-600">
                  {j.presence?.cours ? new Date(j.presence.cours.date).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="px-6 py-3 max-w-xs text-slate-600">
                  <p className="truncate">{j.motif}</p>
                  {j.documentUrl && (
                    <a
                      href={documentAbsoluteUrl(j.documentUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-primary-700 transition-colors hover:text-primary-900"
                    >
                      Voir la pièce jointe
                    </a>
                  )}
                </td>
                <td className="px-6 py-3">
                  <StatusBadge status={j.statut} />
                </td>
              </tr>
            ))}
            {justificatifs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  Aucun justificatif soumis.
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
