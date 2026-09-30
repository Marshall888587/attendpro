import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Modal } from "../components/Modal";
import { Pagination } from "../components/Pagination";
import { StatusBadge } from "../components/StatusBadge";
import { SortableTh } from "../components/SortableTh";
import { IconPlus, IconSearch, IconUsers } from "../components/Icons";
import * as studentService from "../services/student.service";
import * as classService from "../services/class.service";
import { Classe, Etudiant, Filiere } from "../types";
import { initials, tagColorClass } from "../utils/display";

export function StudentsPage() {
  const [students, setStudents] = useState<Etudiant[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [classeId, setClasseId] = useState("");
  const [filiereId, setFiliereId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Etudiant | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<{ student: Etudiant; password: string } | null>(null);
  const [createdStudent, setCreatedStudent] = useState<Etudiant | null>(null);
  const [sortBy, setSortBy] = useState("nom");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    classService.listClasses({ pageSize: 100 }).then((res) => setClasses(res.data));
    classService.listFilieres().then(setFilieres);
  }, []);

  useEffect(() => {
    load();
  }, [search, classeId, filiereId, page, sortBy, sortOrder]);

  function load() {
    studentService
      .listStudents({
        page,
        search: search || undefined,
        classeId: classeId ? Number(classeId) : undefined,
        filiereId: filiereId ? Number(filiereId) : undefined,
        sortBy,
        sortOrder,
      })
      .then((res) => {
        setStudents(res.data);
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
    setEditingStudent(null);
    setFormError(null);
    setShowModal(true);
  }

  function openEditModal(student: Etudiant) {
    setEditingStudent(student);
    setFormError(null);
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      if (editingStudent) {
        await studentService.updateStudent(editingStudent.id, {
          nom: String(form.get("nom")),
          prenom: String(form.get("prenom")),
          email: String(form.get("email")) || undefined,
          telephone: String(form.get("telephone")) || undefined,
          classeId: Number(form.get("classeId")),
          dateNaissance: String(form.get("dateNaissance")) || undefined,
          sexe: (String(form.get("sexe")) || undefined) as "M" | "F" | undefined,
        });
      } else {
        const created = await studentService.createStudent({
          nom: String(form.get("nom")),
          prenom: String(form.get("prenom")),
          email: String(form.get("email")) || undefined,
          telephone: String(form.get("telephone")) || undefined,
          classeId: Number(form.get("classeId")),
          dateNaissance: String(form.get("dateNaissance")) || undefined,
          sexe: (String(form.get("sexe")) || undefined) as "M" | "F" | undefined,
        });
        setCreatedStudent(created);
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(student: Etudiant) {
    await studentService.updateStudent(student.id, {
      statut: student.statut === "ACTIF" ? "INACTIF" : "ACTIF",
    });
    load();
  }

  async function handleDelete(student: Etudiant) {
    if (!window.confirm(`Supprimer définitivement ${student.prenom} ${student.nom} ?`)) return;
    await studentService.deleteStudent(student.id);
    load();
  }

  async function handleResetPassword(student: Etudiant) {
    if (!window.confirm(`Générer un nouveau mot de passe temporaire pour ${student.prenom} ${student.nom} ?`)) return;
    try {
      const password = await studentService.resetStudentPassword(student.id);
      setResetPasswordResult({ student, password });
    } catch (err: any) {
      window.alert(err.response?.data?.message ?? "Erreur lors de la réinitialisation.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des étudiants</h1>
          <p className="mt-1 text-sm text-slate-500">Consultez et gérez l'ensemble des étudiants inscrits.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
        >
          <IconPlus className="h-4 w-4" /> Ajouter un étudiant
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
              placeholder="Rechercher par nom, matricule..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <select
            value={classeId}
            onChange={(e) => {
              setPage(1);
              setClasseId(e.target.value);
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="">Toutes les classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nomClasse}
              </option>
            ))}
          </select>
          <select
            value={filiereId}
            onChange={(e) => {
              setPage(1);
              setFiliereId(e.target.value);
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="">Toutes les filières</option>
            {filieres.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nomFiliere}
              </option>
            ))}
          </select>
          <span className="whitespace-nowrap text-xs font-medium text-slate-400">
            {total} étudiant{total > 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              <SortableTh label="Matricule" field="matricule" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <SortableTh label="Nom et prénom" field="nom" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Classe</th>
              <th className="px-6 py-3">Filière</th>
              <SortableTh label="Statut" field="statut" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-3">
                  <span className="inline-block whitespace-nowrap rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">
                    {s.matricule}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                      {initials(s.prenom, s.nom)}
                    </div>
                    <span className="font-medium text-slate-800">
                      {s.prenom} {s.nom}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3 text-slate-600">{s.email ?? s.telephone ?? "—"}</td>
                <td className="px-6 py-3 text-slate-600">{s.classe?.nomClasse ?? "—"}</td>
                <td className="px-6 py-3">
                  {s.classe?.filiere ? (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tagColorClass(s.classe.filiere.id)}`}>
                      {s.classe.filiere.nomFiliere}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-6 py-3">
                  <StatusBadge status={s.statut} />
                </td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-1 text-xs font-semibold">
                    <button
                      onClick={() => openEditModal(s)}
                      className="rounded-md px-2 py-1 text-primary-700 transition-colors hover:bg-primary-50"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleToggleStatus(s)}
                      className="rounded-md px-2 py-1 text-amber-600 transition-colors hover:bg-amber-50"
                    >
                      {s.statut === "ACTIF" ? "Désactiver" : "Activer"}
                    </button>
                    <button
                      onClick={() => handleResetPassword(s)}
                      className="rounded-md px-2 py-1 text-slate-500 transition-colors hover:bg-slate-100"
                    >
                      Mot de passe
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      className="rounded-md px-2 py-1 text-red-600 transition-colors hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <IconUsers className="h-8 w-8" />
                    <p className="font-medium text-slate-500">Aucun étudiant trouvé</p>
                    <p className="text-xs">Essayez de modifier votre recherche ou vos filtres.</p>
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
        <Modal title={editingStudent ? "Modifier l'étudiant" : "Ajouter un étudiant"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {editingStudent ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Matricule</label>
                  <input
                    name="matricule"
                    disabled
                    defaultValue={editingStudent.matricule}
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
                <label className="mb-1 block text-sm font-medium text-slate-700">Classe</label>
                <select
                  name="classeId"
                  required
                  defaultValue={editingStudent?.classeId}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nomClasse}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Prénom</label>
                <input
                  name="prenom"
                  required
                  defaultValue={editingStudent?.prenom}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nom</label>
                <input
                  name="nom"
                  required
                  defaultValue={editingStudent?.nom}
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
                  defaultValue={editingStudent?.email ?? ""}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Téléphone</label>
                <input
                  name="telephone"
                  type="tel"
                  defaultValue={editingStudent?.telephone ?? ""}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">Un email ou un numéro de téléphone permet de créer un compte de connexion.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Date de naissance</label>
                <input
                  name="dateNaissance"
                  type="date"
                  defaultValue={editingStudent?.dateNaissance ? editingStudent.dateNaissance.slice(0, 10) : ""}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Sexe</label>
                <select
                  name="sexe"
                  defaultValue={editingStudent?.sexe ?? ""}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Non précisé</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
            </div>
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

      {createdStudent && (
        <Modal title="Étudiant créé" onClose={() => setCreatedStudent(null)}>
          <p className="text-sm text-slate-600">
            <strong>{createdStudent.prenom} {createdStudent.nom}</strong> a été ajouté(e) avec le matricule :
          </p>
          <p className="mt-3 rounded-lg bg-slate-100 px-4 py-3 text-center font-mono text-lg font-semibold tracking-wide text-slate-800">
            {createdStudent.matricule}
          </p>
        </Modal>
      )}

      {resetPasswordResult && (
        <Modal title="Mot de passe réinitialisé" onClose={() => setResetPasswordResult(null)}>
          <p className="text-sm text-slate-600">
            Nouveau mot de passe temporaire pour <strong>{resetPasswordResult.student.prenom} {resetPasswordResult.student.nom}</strong> :
          </p>
          <p className="mt-3 rounded-lg bg-slate-100 px-4 py-3 text-center font-mono text-lg font-semibold tracking-wide text-slate-800">
            {resetPasswordResult.password}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Communiquez-le à l'étudiant en personne — il ne sera plus affiché après fermeture de cette fenêtre.
          </p>
        </Modal>
      )}
    </div>
  );
}
