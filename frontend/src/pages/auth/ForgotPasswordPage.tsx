import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import * as authService from "../../services/auth.service";

export function ForgotPasswordPage() {
  const [identifiant, setIdentifiant] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await authService.requestPasswordReset(identifiant);
      setSubmitted(true);
      if (token) {
        setResetLink(`${window.location.origin}/reset-password?token=${token}`);
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-800">Mot de passe oublié</h1>
        <p className="mt-2 text-sm text-slate-500">
          Saisissez l'email ou le numéro de téléphone associé à votre compte. Un lien de réinitialisation sera généré.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email ou téléphone</label>
              <input
                type="text"
                required
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="nom@etablissement.edu ou +225..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-900 py-3 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
            >
              {loading ? "Envoi..." : "Générer le lien de réinitialisation"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
              Si un compte correspond, un lien de réinitialisation a été généré.
            </p>
            {resetLink ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Aucun service d'email/SMS n'est configuré sur ce serveur : voici votre lien (valable 30 minutes).
                </p>
                <a href={resetLink} className="mt-2 block break-all text-sm font-medium text-primary-700 transition-colors hover:text-primary-900">
                  {resetLink}
                </a>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Aucun compte actif ne correspond à cette information, ou aucun service d'envoi n'est configuré.
              </p>
            )}
          </div>
        )}

        <Link to="/login" className="mt-6 block text-center text-sm font-medium text-primary-700 transition-colors hover:text-primary-900">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
