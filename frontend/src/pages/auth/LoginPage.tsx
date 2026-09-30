import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, remember);
      navigate("/", { replace: true });
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-800 text-white">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 8l10-4.5L22 8l-10 4.5L2 8z" />
              <path d="M6 10.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Bienvenue sur ATTENDPRO</h1>
          <p className="mt-2 text-sm text-slate-500">Veuillez vous identifier pour accéder à votre espace de gestion.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email ou Identifiant</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </span>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@etablissement.edu"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Mot de passe</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 018 0v3" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Se souvenir de moi
            </label>
            <Link to="/forgot-password" className="font-medium text-primary-700 transition-colors hover:text-primary-900">
              Mot de passe oublié ?
            </Link>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-800 disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
            {!loading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs uppercase tracking-wide text-slate-400">
          Système de gestion académique sécurisé
        </p>
      </div>
    </div>
  );
}
