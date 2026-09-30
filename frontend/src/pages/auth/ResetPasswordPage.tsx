import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as authService from "../../services/auth.service";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Lien invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-800">Réinitialiser le mot de passe</h1>

        {!token ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            Lien de réinitialisation manquant ou invalide.
          </p>
        ) : success ? (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Mot de passe réinitialisé avec succès. Redirection vers la connexion...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <p className="text-xs text-slate-500">Au moins 8 caractères, avec au moins une lettre et un chiffre.</p>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-900 py-3 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
            >
              {loading ? "Enregistrement..." : "Réinitialiser le mot de passe"}
            </button>
          </form>
        )}

        <Link to="/login" className="mt-6 block text-center text-sm font-medium text-primary-700 transition-colors hover:text-primary-900">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
