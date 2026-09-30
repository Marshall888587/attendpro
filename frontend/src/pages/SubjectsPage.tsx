import { FormEvent, useEffect, useState } from "react";
import { Modal } from "../components/Modal";
import { StatCard } from "../components/StatCard";
import { IconBook, IconPlus, IconWarning } from "../components/Icons";
import * as subjectService from "../services/subject.service";
import * as classService from "../services/class.service";
import * as teacherService from "../services/teacher.service";
import { Classe, Enseignant, Matiere } from "../types";
import { SubjectStats } from "../services/subject.service";

export function SubjectsPage() {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [stats, setStats] = useState<SubjectStats | null>(null);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assocSaving, setAssocSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [assocError, setAssocError] = useState<string | null>(null);

  function load() {
    subjectService.listMatieres().then(setMatieres);
    subjectService.getSubjectStats().then(setStats);
  }

  useEffect(() => {
    load();
    classService.listClasses({ pageSize: 100 }).then((res) => setClasses(res.data));
    teacherService.listTeachers({ pageSize: 100 }).then((res) => setEnseignants(res.data));
  }, []);

  async function handleCreateMatiere(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      await subjectService.createMatiere({
        code: String(form.get("code")),
        nomMatiere: String(form.get("nomMatiere")),
        coefficient: Number(form.get("coefficient")) || 1,
      });
      setShowModal(false);
      load();
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Erreur lors de la création.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMatiere(id: number) {
    if (!window.confirm("Supprimer définitivement cette matière ?")) return;
    await subjectService.deleteMatiere(id);
    load();
  }

  async function handleDeleteAffectation(id: number) {
    if (!window.confirm("Retirer cette association ?")) return;
    await subjectService.deleteAffectation(id);
    load();
  }

  async function handleCreateAssociation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAssocError(null);
    setAssocSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      await subjectService.createAffectation({
        matiereId: Number(form.get("matiereId")),
        enseignantId: Number(form.get("enseignantId")),
        classeId: Number(form.get("classeId")),
      });
      (e.target as HTMLFormElement).reset();
      load();
    } catch (err: any) {
      setAssocError(err.response?.data?.message ?? "Erreur lors de l'association.");
    } finally {
      setAssocSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des matières</h1>
          <p className="mt-1 text-sm text-slate-500">
            Configurez le catalogue d'enseignement et associez matières, enseignants et classes.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
        >
          <IconPlus className="h-4 w-4" /> Nouvelle Matière
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total matières" value={stats?.totalMatieres ?? "—"} icon={<IconBook />} />
        <StatCard label="Assoc. actives" value={stats?.assocActives ?? "—"} />
        <StatCard
          label="Matières orphelines"
          value={stats?.matieresOrphelines ?? "—"}
          hint="Sans enseignant"
          icon={<IconWarning />}
        />
        <StatCard label="Couverture des cours" value={`${stats?.couverture ?? 0}%`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
            <IconPlus className="h-4 w-4" /> Nouvelle Association
          </h2>
          <form onSubmit={handleCreateAssociation} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Matière</label>
              <select name="matiereId" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="">Sélectionner une matière...</option>
                {matieres.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nomMatiere}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Enseignant</label>
              <select name="enseignantId" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="">Assigner un enseignant...</option>
                {enseignants.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.prenom} {e.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Classe</label>
              <select name="classeId" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="">Choisir la classe...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nomClasse}
                  </option>
                ))}
              </select>
            </div>
            {assocError && <p className="text-sm text-red-600">{assocError}</p>}
            <button
              type="submit"
              disabled={assocSaving}
              className="w-full rounded-lg bg-primary-900 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
            >
              {assocSaving ? "Création..." : "Créer le lien"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-800">Catalogue & Affectations</h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Matière</th>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Affectations</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {matieres.map((m) => (
                <tr key={m.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">{m.nomMatiere}</p>
                    <p className="text-xs text-slate-400">Coefficient : {m.coefficient}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">{m.code}</span>
                  </td>
                  <td className="px-5 py-3">
                    {m.affectations && m.affectations.length > 0 ? (
                      <div className="space-y-1">
                        {m.affectations.map((a) => (
                          <p key={a.id} className="flex items-center gap-2 text-xs text-slate-600">
                            {a.enseignant?.prenom} {a.enseignant?.nom} : {a.classe?.nomClasse}
                            <button
                              onClick={() => handleDeleteAffectation(a.id)}
                              className="rounded-md px-1.5 py-0.5 text-red-500 transition-colors hover:bg-red-50"
                            >
                              retirer
                            </button>
                          </p>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-red-500">Non assigné</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDeleteMatiere(m.id)}
                      className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {matieres.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    Aucune matière.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal title="Nouvelle Matière" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreateMatiere} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Code</label>
                <input name="code" required placeholder="MAT-301" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Coefficient</label>
                <input name="coefficient" type="number" min={1} max={10} defaultValue={1} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nom de la matière</label>
              <input name="nomMatiere" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
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
    </div>
  );
}
