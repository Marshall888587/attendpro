import { SVGProps } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  IconBook,
  IconChart,
  IconCheck,
  IconClasses,
  IconDashboard,
  IconGraduate,
  IconHistory,
  IconLogout,
  IconSettings,
  IconShield,
  IconUsers,
} from "./Icons";

interface NavItem {
  to: string;
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
}

const adminNav: NavItem[] = [
  { to: "/", label: "Tableau de bord", icon: IconDashboard },
  { to: "/utilisateurs", label: "Gestion des utilisateurs", icon: IconShield },
  { to: "/etudiants", label: "Gestion des étudiants", icon: IconUsers },
  { to: "/enseignants", label: "Gestion des enseignants", icon: IconGraduate },
  { to: "/classes", label: "Gestion des classes", icon: IconClasses },
  { to: "/matieres", label: "Gestion des matières", icon: IconBook },
  { to: "/presences", label: "Enregistrement des présences", icon: IconCheck },
  { to: "/historique", label: "Historique des présences", icon: IconHistory },
  { to: "/justificatifs", label: "Justificatifs", icon: IconBook },
  { to: "/rapports", label: "Rapports", icon: IconChart },
  { to: "/parametres", label: "Paramètres", icon: IconSettings },
];

const enseignantNav: NavItem[] = [
  { to: "/", label: "Tableau de bord", icon: IconDashboard },
  { to: "/presences", label: "Enregistrement des présences", icon: IconCheck },
  { to: "/historique", label: "Historique des présences", icon: IconHistory },
  { to: "/parametres", label: "Paramètres", icon: IconSettings },
];

const etudiantNav: NavItem[] = [
  { to: "/", label: "Mon espace", icon: IconDashboard },
  { to: "/historique", label: "Mon historique", icon: IconHistory },
  { to: "/justificatifs", label: "Mes justificatifs", icon: IconBook },
  { to: "/parametres", label: "Paramètres", icon: IconSettings },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const nav = user?.role === "ADMIN" ? adminNav : user?.role === "ENSEIGNANT" ? enseignantNav : etudiantNav;

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-800 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 8l10-4.5L22 8l-10 4.5L2 8z" />
              <path d="M6 10.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5" />
            </svg>
          </div>
          <span className="text-lg font-bold text-primary-900">
            ATTEND<span className="text-primary-500">PRO</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-primary-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <IconLogout className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
