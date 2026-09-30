import { FormEvent, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { resolveFileUrl } from "../services/api";
import * as userService from "../services/user.service";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<"profil" | "securite">("profil");

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(resolveFileUrl(user?.photoUrl) ?? null);

  const [pwMethod, setPwMethod] = useState<"current" | "code">("current");

  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  const [codeSending, setCodeSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeDisplay, setCodeDisplay] = useState<string | null>(null);
  const [codeInfo, setCodeInfo] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSaving, setCodeSaving] = useState(false);
  const [codeMessage, setCodeMessage] = useState<string | null>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Image trop volumineuse (max 2 Mo).");
      return;
    }
    setPhotoUploading(true);
    try {
      const updated = await userService.uploadPhoto(file);
      setPhotoPreview(resolveFileUrl(updated.photoUrl) ?? null);
      await refreshUser();
    } catch (err: any) {
      setPhotoError(err.response?.data?.message ?? "Erreur lors de l'envoi de la photo.");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileMessage(null);
    setProfileError(null);
    setProfileSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      await userService.updateProfile({
        prenom: String(form.get("prenom")),
        nom: String(form.get("nom")),
        email: String(form.get("email") ?? ""),
        telephone: String(form.get("telephone") ?? ""),
        fonction: String(form.get("fonction")) || undefined,
        departement: String(form.get("departement")) || undefined,
      });
      await refreshUser();
      setProfileMessage("Profil mis à jour avec succès.");
    } catch (err: any) {
      setProfileError(err.response?.data?.message ?? "Erreur lors de la mise à jour.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwMessage(null);
    setPwError(null);
    setPwSaving(true);
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("newPassword"));
    const confirm = String(form.get("confirmPassword"));
    if (newPassword !== confirm) {
      setPwError("Les mots de passe ne correspondent pas.");
      setPwSaving(false);
      return;
    }
    try {
      await userService.changePassword(String(form.get("currentPassword")), newPassword);
      setPwMessage("Mot de passe modifié avec succès.");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setPwError(err.response?.data?.message ?? "Erreur lors du changement de mot de passe.");
    } finally {
      setPwSaving(false);
    }
  }

  async function handleRequestCode() {
    setCodeError(null);
    setCodeMessage(null);
    setCodeSending(true);
    try {
      const { message, code } = await userService.requestPasswordCode();
      setCodeInfo(message);
      setCodeDisplay(code);
      setCodeSent(true);
    } catch (err: any) {
      setCodeError(err.response?.data?.message ?? "Erreur lors de l'envoi du code.");
    } finally {
      setCodeSending(false);
    }
  }

  async function handleCodeSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCodeMessage(null);
    setCodeError(null);
    setCodeSaving(true);
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("newPassword"));
    const confirm = String(form.get("confirmPassword"));
    if (newPassword !== confirm) {
      setCodeError("Les mots de passe ne correspondent pas.");
      setCodeSaving(false);
      return;
    }
    try {
      await userService.changePasswordWithCode(String(form.get("code")), newPassword);
      setCodeMessage("Mot de passe modifié avec succès.");
      setCodeSent(false);
      setCodeDisplay(null);
      setCodeInfo(null);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setCodeError(err.response?.data?.message ?? "Erreur lors du changement de mot de passe.");
    } finally {
      setCodeSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Paramètres du compte</h1>
        <p className="mt-1 text-sm text-slate-500">Gérez vos informations personnelles et vos préférences de sécurité.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <div className="space-y-1">
          <button
            onClick={() => setTab("profil")}
            className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold ${
              tab === "profil" ? "bg-primary-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setTab("securite")}
            className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold ${
              tab === "securite" ? "bg-primary-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Sécurité
          </button>
        </div>

        {tab === "profil" && (
          <div className="space-y-6">
            <div className="flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:gap-6">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-800 text-xl font-semibold text-white">
                  {user?.prenom?.[0]}
                  {user?.nom?.[0]}
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-800">Photo de profil</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      user?.actif ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {user?.actif ? "Compte actif" : "Compte inactif"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Image carrée recommandée, JPG ou PNG, max 2 Mo.</p>
                <label className="mt-2 inline-block cursor-pointer rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800">
                  {photoUploading ? "Envoi..." : "Changer"}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={photoUploading} />
                </label>
                {photoError && <p className="mt-2 text-xs text-red-600">{photoError}</p>}
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-semibold text-slate-800">Informations personnelles</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Prénom</label>
                  <input
                    name="prenom"
                    defaultValue={user?.prenom}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nom</label>
                  <input
                    name="nom"
                    defaultValue={user?.nom}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Adresse Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={user?.email ?? ""}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Téléphone</label>
                  <input
                    name="telephone"
                    type="tel"
                    defaultValue={user?.telephone ?? ""}
                    placeholder="+225 0700000000"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">Au moins un email ou un numéro de téléphone est requis.</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Titre / Fonction</label>
                  <input
                    name="fonction"
                    defaultValue={user?.fonction ?? ""}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Département</label>
                  <input
                    name="departement"
                    defaultValue={user?.departement ?? ""}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              {profileError && <p className="text-sm text-red-600">{profileError}</p>}
              {profileMessage && <p className="text-sm text-emerald-600">{profileMessage}</p>}
              <button
                type="submit"
                disabled={profileSaving}
                className="rounded-lg bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
              >
                {profileSaving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </form>
          </div>
        )}

        {tab === "securite" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-semibold text-slate-800">Changer le mot de passe</h3>
              <p className="mt-1 text-sm text-slate-500">Choisissez comment vous souhaitez confirmer ce changement.</p>
              <div className="mt-4 inline-flex rounded-lg bg-slate-100 p-1 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => setPwMethod("current")}
                  className={`rounded-md px-4 py-1.5 ${pwMethod === "current" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
                >
                  Avec mon mot de passe actuel
                </button>
                <button
                  type="button"
                  onClick={() => setPwMethod("code")}
                  className={`rounded-md px-4 py-1.5 ${pwMethod === "code" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
                >
                  Avec un code de vérification
                </button>
              </div>
            </div>

            {pwMethod === "current" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Mot de passe actuel</label>
                  <input
                    name="currentPassword"
                    type="password"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
                    <input
                      name="newPassword"
                      type="password"
                      required
                      minLength={8}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Confirmer</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={8}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">Au moins 8 caractères, avec au moins une lettre et un chiffre.</p>
                {pwError && <p className="text-sm text-red-600">{pwError}</p>}
                {pwMessage && <p className="text-sm text-emerald-600">{pwMessage}</p>}
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="rounded-lg bg-primary-900 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
                >
                  {pwSaving ? "Enregistrement..." : "Mettre à jour le mot de passe"}
                </button>
              </form>
            )}

            {pwMethod === "code" && (
              <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                {!codeSent ? (
                  <>
                    <p className="text-sm text-slate-600">
                      Un code de vérification à usage unique sera envoyé à votre email ou numéro de téléphone
                      enregistré ({user?.email ?? user?.telephone ?? "aucun contact renseigné"}). Aucune saisie de
                      votre mot de passe actuel n'est nécessaire.
                    </p>
                    {codeError && <p className="text-sm text-red-600">{codeError}</p>}
                    <button
                      type="button"
                      onClick={handleRequestCode}
                      disabled={codeSending || (!user?.email && !user?.telephone)}
                      className="rounded-lg bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
                    >
                      {codeSending ? "Envoi..." : "Envoyer le code de vérification"}
                    </button>
                    {!user?.email && !user?.telephone && (
                      <p className="text-xs text-red-600">
                        Ajoutez un email ou un numéro de téléphone dans l'onglet Profil pour utiliser cette méthode.
                      </p>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleCodeSubmit} className="space-y-4">
                    {codeInfo && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{codeInfo}</p>}
                    {codeDisplay && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-500">
                          Aucun service d'email/SMS n'est configuré sur ce serveur : voici votre code (valable 10
                          minutes).
                        </p>
                        <p className="mt-2 text-center font-mono text-2xl font-bold tracking-widest text-slate-800">
                          {codeDisplay}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Code de vérification</label>
                      <input
                        name="code"
                        required
                        minLength={6}
                        maxLength={6}
                        inputMode="numeric"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm tracking-widest"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
                        <input
                          name="newPassword"
                          type="password"
                          required
                          minLength={8}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Confirmer</label>
                        <input
                          name="confirmPassword"
                          type="password"
                          required
                          minLength={8}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Au moins 8 caractères, avec au moins une lettre et un chiffre.</p>
                    {codeError && <p className="text-sm text-red-600">{codeError}</p>}
                    {codeMessage && <p className="text-sm text-emerald-600">{codeMessage}</p>}
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={codeSaving}
                        className="rounded-lg bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
                      >
                        {codeSaving ? "Enregistrement..." : "Mettre à jour le mot de passe"}
                      </button>
                      <button
                        type="button"
                        onClick={handleRequestCode}
                        disabled={codeSending}
                        className="text-sm font-medium text-primary-700 transition-colors hover:text-primary-900 disabled:opacity-60"
                      >
                        Renvoyer un code
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
