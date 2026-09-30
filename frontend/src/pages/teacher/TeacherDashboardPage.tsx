import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import * as attendanceService from "../../services/attendance.service";
import { Affectation } from "../../types";

export function TeacherDashboardPage() {
  const { user } = useAuth();
  const [affectations, setAffectations] = useState<Affectation[]>([]);

  useEffect(() => {
    attendanceService.listAffectations().then(setAffectations);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Bonjour {user?.prenom}</h1>
        <p className="mt-1 text-sm text-slate-500">Voici vos classes et matières assignées.</p>
      </div>

      <Link
        to="/presences"
        className="block rounded-xl bg-primary-900 p-6 text-white transition-colors hover:bg-primary-800"
      >
        <p className="text-sm font-medium text-primary-100">Action rapide</p>
        <p className="mt-1 text-xl font-semibold">Enregistrer les présences d'une séance →</p>
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Mes affectations</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Classe</th>
              <th className="px-6 py-3">Matière</th>
            </tr>
          </thead>
          <tbody>
            {affectations.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="px-6 py-3 font-medium text-slate-800">{a.classe?.nomClasse}</td>
                <td className="px-6 py-3 text-slate-600">{a.matiere?.nomMatiere}</td>
              </tr>
            ))}
            {affectations.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-slate-400">
                  Aucune affectation pour le moment.
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
