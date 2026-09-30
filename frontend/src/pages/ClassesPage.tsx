import { FormEvent, useEffect, useState } from "react";
import { Modal } from "../components/Modal";
import { FiliereManagerModal } from "../components/FiliereManagerModal";
import { Pagination } from "../components/Pagination";
import { StatCard } from "../components/StatCard";
import { SortableTh } from "../components/SortableTh";
import { IconClasses, IconPlus, IconWarning } from "../components/Icons";
import * as classService from "../services/class.service";
import { Classe, Filiere } from "../types";
import { ClassStats } from "../services/class.service";
import { initials, tagColorClass } from "../utils/display";

export function ClassesPage() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingClasse, setEditingClasse] = useState<Classe | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showFiliereManager, setShowFiliereManager] = useState(false);
  const [sortBy, setSortBy] = useState("nomClasse");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    classService.listFilieres().then(setFilieres);
    classService.getClassStats().then(setStats);
  }, []);

  useEffect(() => {
    load();
  }, [page, sortBy, sortOrder]);

  function load() {
    classService.listClasses({ page, sortBy, sortOrder }).then((res) => {
      setClasses(res.data);
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
    setEditingClasse(null);
    setFormError(null);
    setShowModal(true);
  }

  function openEditModal(classe: Classe) {
    setEditingClasse(classe);
    setFormError(null);
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      nomClasse: String(form.get("nomClasse")),
      niveau: String(form.get("niveau")),
      filiereId: Number(form.get("filiereId")),
      effectifMax: form.get("effectifMax") ? Number(form.get("effectifMax")) : undefined,
    };
    try {
      if (editingClasse) {
        await classService.updateClasse(editingClasse.id, payload);
      } else {
        await classService.createClasse(payload);
      }
      setShowModal(false);
      load();
      classService.getClassStats().then(setStats);
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(classe: Classe) {
    if (!window.confirm(`Supprimer définitivement la classe ${classe.nomClasse} ?`)) return;
    await classService.deleteClasse(classe.id);
    load();
    classService.getClassStats().then(setStats);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des classes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Supervisez et organisez l'ensemble des groupes d'étudiants.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFiliereManager(true)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Gérer les filières
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
          >
            <IconPlus className="h-4 w-4" /> Nouvelle Classe
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total classes" value={stats?.totalClasses ?? "—"} icon={<IconClasses />} />
        <StatCard label="Effectif moyen" value={stats?.effectifMoyen ?? "—"} hint="Étudiants / classe" />
        <StatCard
          label="Classes surchargées"
          value={stats?.classesSurchargees ?? "—"}
          hint="> effectif max"
          icon={<IconWarning />}
        />
        <StatCard label="Filières actives" value={stats?.filieresActives ?? "—"} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              <SortableTh label="Nom de la classe" field="nomClasse" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <th className="px-6 py-3">Filière</th>
              <SortableTh label="Niveau" field="niveau" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <SortableTh label="Effectif" field="effectif" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              <th className="px-6 py-3">Enseignant responsable</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classes.map((c) => {
              const effectif = c._count?.etudiants ?? 0;
              const max = c.effectifMax ?? null;
              const pct = max ? Math.min(100, Math.round((effectif / max) * 100)) : null;
              const overCapacity = max != null && effectif > max;
              const barColor = overCapacity ? "bg-red-500" : pct !== null && pct >= 85 ? "bg-amber-500" : "bg-emerald-500";
              return (
                <tr key={c.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                        <IconClasses className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-slate-800">{c.nomClasse}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    {c.filiere ? (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tagColorClass(c.filiere.id)}`}>
                        {c.filiere.nomFiliere}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{c.niveau}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-sm ${overCapacity ? "font-semibold text-red-600" : "font-medium text-slate-700"}`}>
                      {effectif}
                      {max ? ` / ${max}` : ""}
                    </span>
                    {max && (
                      <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {c.enseignantResponsable ? (
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                          {initials(c.enseignantResponsable.prenom, c.enseignantResponsable.nom)}
                        </div>
                        <span className="text-slate-600">
                          {c.enseignantResponsable.prenom} {c.enseignantResponsable.nom}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Non assigné</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-1 text-xs font-semibold">
                      <button
                        onClick={() => openEditModal(c)}
                        className="rounded-md px-2 py-1 text-primary-700 transition-colors hover:bg-primary-50"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="rounded-md px-2 py-1 text-red-600 transition-colors hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {classes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <IconClasses className="h-8 w-8" />
                    <p className="font-medium text-slate-500">Aucune classe trouvée</p>
                    <p className="text-xs">Créez une nouvelle classe pour commencer.</p>
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
        <Modal title={editingClasse ? "Modifier la classe" : "Nouvelle Classe"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nom de la classe</label>
              <input
                name="nomClasse"
                required
                defaultValue={editingClasse?.nomClasse}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Niveau</label>
                <input
                  name="niveau"
                  required
                  placeholder="Licence 1"
                  defaultValue={editingClasse?.niveau}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Effectif max</label>
                <input
                  name="effectifMax"
                  type="number"
                  defaultValue={editingClasse?.effectifMax ?? undefined}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Filière</label>
              <select
                name="filiereId"
                required
                defaultValue={editingClasse?.filiereId}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Sélectionner...</option>
                {filieres.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nomFiliere}
                  </option>
                ))}
              </select>
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

      {showFiliereManager && (
        <FiliereManagerModal
          onClose={() => setShowFiliereManager(false)}
          onChanged={() => {
            classService.listFilieres().then(setFilieres);
            classService.getClassStats().then(setStats);
            load();
          }}
        />
      )}
    </div>
  );
}
