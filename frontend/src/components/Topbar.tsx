import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { resolveFileUrl } from "../services/api";
import * as studentService from "../services/student.service";
import * as teacherService from "../services/teacher.service";
import * as userService from "../services/user.service";
import { Etudiant, Enseignant, UserAccount } from "../types";
import { IconBell, IconMenu, IconSearch } from "./Icons";
import { NotificationDropdown } from "./NotificationDropdown";

interface GlobalSearchResults {
  etudiants: Etudiant[];
  enseignants: Enseignant[];
  comptes: UserAccount[];
}

const EMPTY_RESULTS: GlobalSearchResults = { etudiants: [], enseignants: [], comptes: [] };

function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResults>(EMPTY_RESULTS);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length < 2) {
      setResults(EMPTY_RESULTS);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      Promise.all([
        studentService.listStudents({ search: trimmed, pageSize: 5 }),
        teacherService.listTeachers({ search: trimmed, pageSize: 5 }),
        userService.listAccounts({ search: trimmed, pageSize: 5 }),
      ])
        .then(([students, teachers, accounts]) => {
          setResults({ etudiants: students.data, enseignants: teachers.data, comptes: accounts.data });
        })
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [trimmed]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToList(path: string, q: string) {
    navigate(`${path}?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "Enter" && trimmed.length >= 2) {
      if (results.etudiants.length > 0) goToList("/etudiants", trimmed);
      else if (results.enseignants.length > 0) goToList("/enseignants", trimmed);
      else if (results.comptes.length > 0) goToList("/utilisateurs", trimmed);
    }
  }

  const hasResults = results.etudiants.length > 0 || results.enseignants.length > 0 || results.comptes.length > 0;
  const showDropdown = open && trimmed.length >= 2;

  return (
    <div ref={containerRef} className="relative hidden w-full max-w-md sm:block">
      <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Rechercher un étudiant, un enseignant, un compte..."
        className="w-full rounded-lg border-none bg-slate-100 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-300"
      />
      {showDropdown && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[20rem] rounded-xl border border-slate-200 bg-white shadow-lg">
          {searching ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">Recherche...</p>
          ) : !hasResults ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">Aucun résultat pour « {trimmed} ».</p>
          ) : (
            <div className="max-h-96 overflow-y-auto py-2">
              {results.etudiants.length > 0 && (
                <div>
                  <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase text-slate-400">Étudiants</p>
                  {results.etudiants.map((s) => (
                    <button
                      key={`etu-${s.id}`}
                      onClick={() => goToList("/etudiants", s.matricule)}
                      className="flex w-full flex-col px-4 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-800">
                        {s.prenom} {s.nom}
                      </span>
                      <span className="text-xs text-slate-500">{s.matricule}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.enseignants.length > 0 && (
                <div>
                  <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase text-slate-400">Enseignants</p>
                  {results.enseignants.map((t) => (
                    <button
                      key={`ens-${t.id}`}
                      onClick={() => goToList("/enseignants", t.email || `${t.prenom} ${t.nom}`)}
                      className="flex w-full flex-col px-4 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-800">
                        {t.prenom} {t.nom}
                      </span>
                      <span className="text-xs text-slate-500">{t.specialite || t.email}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.comptes.length > 0 && (
                <div>
                  <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase text-slate-400">Comptes</p>
                  {results.comptes.map((u) => (
                    <button
                      key={`usr-${u.id}`}
                      onClick={() => goToList("/utilisateurs", u.email || `${u.prenom} ${u.nom}`)}
                      className="flex w-full flex-col px-4 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-800">
                        {u.prenom} {u.nom}
                      </span>
                      <span className="text-xs text-slate-500">{u.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const roleLabel = user?.role === "ADMIN" ? "Directeur" : user?.role === "ENSEIGNANT" ? "Enseignant" : "Étudiant";
  const initials = `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <IconMenu className="h-5 w-5" />
        </button>
        {user?.role === "ADMIN" && <GlobalSearch />}
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="relative" ref={bellRef}>
          <button
            className="relative text-slate-500 hover:text-slate-700"
            onClick={() => setShowNotifications((v) => !v)}
            aria-label="Notifications"
          >
            <IconBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <NotificationDropdown onClose={() => setShowNotifications(false)} />
            </>
          )}
        </div>
        <Link to="/parametres" className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-slate-50">
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-xs text-slate-500">{roleLabel}</p>
          </div>
          {user?.photoUrl ? (
            <img src={resolveFileUrl(user.photoUrl)} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-800 text-xs font-semibold text-white">
              {initials || "U"}
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
