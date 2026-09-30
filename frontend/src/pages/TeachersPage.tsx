import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Modal } from "../components/Modal";
import { Pagination } from "../components/Pagination";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { SortableTh } from "../components/SortableTh";
import { IconGraduate, IconPlus, IconSearch } from "../components/Icons";
import * as teacherService from "../services/teacher.service";
import { Enseignant } from "../types";
import { initials, tagColorClass } from "../utils/display";

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Enseignant[]>([]);
  const [stats, setStats] = useState<{ totalActifs: number; affectationsActives: number } | null>(null);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Enseignant | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<{ teacher: Enseignant; password: string } | null>(null);
  const [createdTeacher, setCreatedTeacher] = useState<Enseignant | null>(null);
  const [sortBy, setSortBy] = useState("nom");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    teacherService.getTeacherStats().then(setStats);
  }, []);

  useEffect(() => {
    load();
  }, [search, page, sortBy, sortOrder]);

  function load() {
    teacherService.listTeachers({ page, search: search || undefined, sortBy, sortOrder }).then((res) => {
      setTeachers(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    });
  }

  function handleSort(field: string) {
    if (field === sortBy) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  }

  function openCreateModal() {
    setEditingTeacher(null);
    setFormError(null);
    setShowModal(true);
  }

  function openEditModal(teacher: Enseignant) {
    setEditingTeacher(teacher);
    setFormError(null);
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      if (editingTeacher) {
        await teacherService.updateTeacher(editingTeacher.id, {
          nom: String(form.get("nom")),
          prenom: String(form.get("prenom")),
          email: String(form.get("email")) || undefined,
          telephone: String(form.get("telephone")) || undefined,
          specialite: String(form.get("specialite")) || undefined,
        });
      } else {
        const created = await teacherService.createTeacher({
          nom: String(form.get("nom")),
          prenom: String(form.get("prenom")),
          email: String(form.get("email")) || undefined,
          telephone: String(form.get("telephone")) || undefined,
          specialite: String(form.get("specialite")) || undefined,
        });
        setCreatedTeacher(created);
      }
      setShowModal(false);
      load();
      teacherService.getTeacherStats().then(setStats);
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(teacher: Enseignant) {
    await teacherService.updateTeacher(teacher.id, {
      statut: teacher.statut === "ACTIF" ? "EN_CONGE" : "ACTIF",
    });
    load();
  }

  async function handleDelete(teacher: Enseignant) {
    if (!window.confirm(`Supprimer définitivement ${teacher.prenom} ${teacher.nom} ?`)) return;
    await teacherService.deleteTeacher(teacher.id);
    load();
    teacherService.getTeacherStats().then(setStats);
  }

  async function handleResetPassword(teacher: Enseignant) {
    if (!window.confirm(`Générer un nouveau mot de passe temporaire pour ${teacher.prenom} ${teacher.nom} ?`)) return;
    try {
      const password = await teacherService.resetTeacherPassword(teacher.id);
      setResetPasswordResult({ teacher, password });
    } catch (err: any) {
      window.alert(err.response?.data?.message ?? "Erreur lors de la réinitialisation.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des enseignants</h1>
          <p className="mt-1 text-sm text-slate-500">Gérez le corps professoral, leurs affectations et statuts.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
        >
          <IconPlus className="h-4 w-4" /> Ajouter un enseignant
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <StatCard label="Total" value={stats?.totalActifs ?? "—"} hint="Enseignants actifs" icon={<IconGraduate />} />
        <StatCard label="Affectations" value={stats?.affectationsActives ?? "—"} hint="Associations actives" icon={<IconGraduate />} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative max-w-sm flex-1 min-w-[200px]">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Rechercher par nom, matière..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <span className="whitespace-nowrap text-xs font-medium text-slate-400">
            {total} enseignant{total > 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              <SortableTh label="Nom et prénom" field="nom" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Spécialité</th>
              <th className="px-6 py-3">Classes attribuées</th>
              <SortableTh label="Statut" field="statut" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teachers.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                      {initials(t.prenom, t.nom)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {t.prenom} {t.nom}
                      </p>
                      <p className="whitespace-nowrap font-mono text-xs text-slate-400">{t.matriculeEns}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-slate-600">{t.email ?? t.telephone ?? "—"}</td>
                <td className="px-6 py-3">
                  {t.specialite ? (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tagColorClass(t.specialite)}`}>
                      {t.specialite}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-6 py-3">
                  {t.affectations && t.affectations.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {t.affectations.map((a) => (
                        <span key={a.id} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {a.classe?.nomClasse}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">Aucune</span>
                  )}
                </td>
                <td className="px-6 py-3">
                  <StatusBadge status={t.statut} />
                </td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-1 text-xs font-semibold">
                    <button
                      onClick={() => openEditModal(t)}
                      className="rounded-md px-2 py-1 text-primary-700 transition-colors hover:bg-primary-50"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleToggleStatus(t)}
                      className="rounded-md px-2 py-1 text-amber-600 transition-colors hover:bg-amber-50"
                    >
                      {t.statut === "ACTIF" ? "Mettre en congé" : "Réactiver"}
                    </button>
                    <button
                      onClick={() => handleResetPassword(t)}
                      className="rounded-md px-2 py-1 text-slate-500 transition-colors hover:bg-slate-100"
                    >
                      Mot de passe
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      className="rounded-md px-2 py-1 text-red-600 transition-colors hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <IconGraduate className="h-8 w-8" />
                    <p className="font-medium text-slate-500">Aucun enseignant trouvé</p>
                    <p className="text-xs">Essayez de modifier votre recherche.</p>
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
        <Modal title={editingTeacher ? "Modifier l'enseignant" : "Ajouter un enseignant"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {editingTeacher ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Matricule</label>
                  <input
                    name="matriculeEns"
                    disabled
                    defaultValue={editingTeacher.matriculeEns}
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Matricule</label>
                  <div className="flex h-[38px] items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-sm text-slate-400">
                    Attribué automatiquement
                  </div>
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Spécialité</label>
                <input
                  name="specialite"
                  defaultValue={editingTeacher?.specialite ?? ""}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Prénom</label>
                <input
                  name="prenom"
                  required
                  defaultValue={editingTeacher?.prenom}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nom</label>
                <input
                  name="nom"
                  required
                  defaultValue={editingTeacher?.nom}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingTeacher?.email ?? ""}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Téléphone</label>
                <input
                  name="telephone"
                  type="tel"
                  defaultValue={editingTeacher?.telephone ?? ""}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">Un email ou un numéro de téléphone est requis.</p>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary-900 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </Modal>
      )}

      {createdTeacher && (
        <Modal title="Enseignant créé" onClose={() => setCreatedTeacher(null)}>
          <p className="text-sm text-slate-600">
            <strong>{createdTeacher.prenom} {createdTeacher.nom}</strong> a été ajouté(e) avec le matricule :
          </p>
          <p className="mt-3 rounded-lg bg-slate-100 px-4 py-3 text-center font-mono text-lg font-semibold tracking-wide text-slate-800">
            {createdTeacher.matriculeEns}
          </p>
        </Modal>
      )}

      {resetPasswordResult && (
        <Modal title="Mot de passe réinitialisé" onClose={() => setResetPasswordResult(null)}>
          <p className="text-sm text-slate-600">
            Nouveau mot de passe temporaire pour <strong>{resetPasswordResult.teacher.prenom} {resetPasswordResult.teacher.nom}</strong> :
          </p>
          <p className="mt-3 rounded-lg bg-slate-100 px-4 py-3 text-center font-mono text-lg font-semibold tracking-wide text-slate-800">
            {resetPasswordResult.password}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Communiquez-le à l'enseignant en personne — il ne sera plus affiché après fermeture de cette fenêtre.
          </p>
        </Modal>
      )}
    </div>
  );
}
