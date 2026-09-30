import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatCard } from "../components/StatCard";
import { SimpleBarChart } from "../components/charts";
import { IconCheck, IconClasses, IconGraduate, IconUsers } from "../components/Icons";
import * as statsService from "../services/stats.service";
import { DashboardStats } from "../services/stats.service";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsService
      .getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Chargement...</p>;
  if (!stats) return <p className="text-slate-500">Impossible de charger les statistiques.</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-500">Aperçu global des effectifs et statistiques de présence.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/etudiants" className="block">
          <StatCard label="Total étudiants" value={stats.totalEtudiants} icon={<IconUsers />} />
        </Link>
        <Link to="/enseignants" className="block">
          <StatCard label="Enseignants" value={stats.totalEnseignants} hint="Actifs" icon={<IconGraduate />} />
        </Link>
        <Link to="/classes" className="block">
          <StatCard label="Classes" value={stats.totalClasses} icon={<IconClasses />} />
        </Link>
        <StatCard
          label="Taux de présence"
          value={`${stats.tauxPresence}%`}
          hint="Moyenne globale"
          icon={<IconCheck />}
          highlighted
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Présence par classe</h2>
        <SimpleBarChart data={stats.presenceParClasse.map((c) => ({ label: c.classe, value: c.taux }))} />
      </div>
    </div>
  );
}
