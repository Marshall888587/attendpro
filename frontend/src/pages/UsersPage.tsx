import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Modal } from "../components/Modal";
import { Pagination } from "../components/Pagination";
import { StatusBadge } from "../components/StatusBadge";
import { IconPlus, IconSearch, IconShield } from "../components/Icons";
import * as userService from "../services/user.service";
import { UserAccount } from "../types";
import { useAuth } from "../hooks/useAuth";
import { initials } from "../utils/display";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  ENSEIGNANT: "Enseignant",
  ETUDIANT: "Étudiant",
};

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdAccount, setCreatedAccount] = useState<{ user: UserAccount; password: string } | null>(null);

  useEffect(() => {
    load();
  }, [search, page]);

  function load() {
    userService.listAccounts({ page, search: search || undefined }).then((res) => {
      setAccounts(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      const result = await userService.createAdminAccount({
        nom: String(form.get("nom")),
        prenom: String(form.get("prenom")),
        email: String(form.get("email")) || undefined,
        telephone: String(form.get("telephone")) || undefined,
      });
      setCreatedAccount(result);
      setShowModal(false);
      load();
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Erreur lors de la création.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActif(account: UserAccount) {
    try {
      await userService.updateAccountStatus(account.id, { actif: !account.actif });
      load();
    } catch (err: any) {
      window.alert(err.response?.data?.message ?? "Erreur lors de la mise à jour.");
    }
  }

  async function handleDelete(account: UserAccount) {
    if (!window.confirm(`Supprimer définitivement le compte de ${account.prenom} ${account.nom} ?`)) return;
    try {
      await userService.deleteAccount(account.id);
      load();
    } catch (err: any) {
      window.alert(err.response?.data?.message ?? "Erreur lors de la suppression.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des utilisateurs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Consultez tous les comptes du système, activez/désactivez l'accès et créez des comptes administrateurs.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
        >
          <IconPlus className="h-4 w-4" /> Ajouter un administrateur
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Rechercher par nom, email..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <span className="whitespace-nowrap text-xs font-medium text-slate-400">
            {total} compte{total > 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Nom et prénom</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Rôle</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((a) => {
                const isSelf = a.id === currentUser?.id;
                return (
                  <tr key={a.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                          {initials(a.prenom, a.nom)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {a.prenom} {a.nom}
                            {isSelf && <span className="ml-2 text-xs font-normal text-slate-400">(vous)</span>}
                          </p>
                          {!a.hasProfile && a.role !== "ADMIN" && (
                            <p className="text-xs text-slate-400">Sans profil lié</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{a.email ?? a.telephone ?? "—"}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {ROLE_LABELS[a.role] ?? a.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={a.actif ? "ACTIF" : "INACTIF"} />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1 text-xs font-semibold">
                        <button
                          onClick={() => handleToggleActif(a)}
                          disabled={isSelf}
                          title={isSelf ? "Vous ne pouvez pas désactiver votre propre compte" : undefined}
                          className="rounded-md px-2 py-1 text-amber-600 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {a.actif ? "Désactiver" : "Activer"}
                        </button>
                        <button
                          onClick={() => handleDelete(a)}
                          disabled={isSelf || a.hasProfile}
                          title={
                            isSelf
                              ? "Vous ne pouvez pas supprimer votre propre compte"
                              : a.hasProfile
                              ? "Gérez ce compte depuis la page Étudiants/Enseignants"
                              : undefined
                          }
                          className="rounded-md px-2 py-1 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <IconShield className="h-8 w-8" />
                      <p className="font-medium text-slate-500">Aucun compte trouvé</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>

      {showModal && (
        <Modal title="Ajouter un administrateur" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Prénom</label>
                <input name="prenom" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nom</label>
                <input name="nom" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input name="email" type="email" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Téléphone</label>
                <input name="telephone" type="tel" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Un email ou un numéro de téléphone est requis. Un mot de passe temporaire sera généré automatiquement.
            </p>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary-900 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Créer le compte"}
            </button>
          </form>
        </Modal>
      )}

      {createdAccount && (
        <Modal title="Compte administrateur créé" onClose={() => setCreatedAccount(null)}>
          <p className="text-sm text-slate-600">
            <strong>
              {createdAccount.user.prenom} {createdAccount.user.nom}
            </strong>{" "}
            peut désormais se connecter avec le mot de passe temporaire :
          </p>
          <p className="mt-3 rounded-lg bg-slate-100 px-4 py-3 text-center font-mono text-lg font-semibold tracking-wide text-slate-800">
            {createdAccount.password}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Communiquez-le en personne — il ne sera plus affiché après fermeture de cette fenêtre.
          </p>
        </Modal>
      )}
    </div>
  );
}
