import { FormEvent, useEffect, useState } from "react";
import { Modal } from "./Modal";
import * as classService from "../services/class.service";
import { Filiere } from "../types";

interface FiliereManagerModalProps {
  onClose: () => void;
  onChanged: () => void;
}

export function FiliereManagerModal({ onClose, onChanged }: FiliereManagerModalProps) {
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nomFiliere, setNomFiliere] = useState("");
  const [departement, setDepartement] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    classService.listFilieres().then(setFilieres);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setNomFiliere("");
    setDepartement("");
    setError(null);
  }

  function startEdit(filiere: Filiere) {
    setEditingId(filiere.id);
    setNomFiliere(filiere.nomFiliere);
    setDepartement(filiere.departement ?? "");
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editingId) {
        await classService.updateFiliere(editingId, { nomFiliere, departement: departement || undefined });
      } else {
        await classService.createFiliere({ nomFiliere, departement: departement || undefined });
      }
      resetForm();
      load();
      onChanged();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(filiere: Filiere) {
    if (!window.confirm(`Supprimer la filière "${filiere.nomFiliere}" ? Impossible si des classes y sont rattachées.`)) return;
    try {
      await classService.deleteFiliere(filiere.id);
      load();
      onChanged();
    } catch (err: any) {
      window.alert(err.response?.data?.message ?? "Suppression impossible.");
    }
  }

  return (
    <Modal title="Gérer les filières" onClose={onClose}>
      <form onSubmit={handleSubmit} className="mb-5 space-y-3 border-b border-slate-100 pb-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nom de la filière</label>
            <input
              value={nomFiliere}
              onChange={(e) => setNomFiliere(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Département</label>
            <input
              value={departement}
              onChange={(e) => setDepartement(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-primary-900 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
          >
            {editingId ? "Mettre à jour" : "Ajouter la filière"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="max-h-64 space-y-2 overflow-y-auto">
        {filieres.map((f) => (
          <div key={f.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-slate-800">{f.nomFiliere}</p>
              {f.departement && <p className="text-xs text-slate-400">{f.departement}</p>}
            </div>
            <div className="flex gap-1 text-xs font-semibold">
              <button
                onClick={() => startEdit(f)}
                className="rounded-md px-2 py-1 text-primary-700 transition-colors hover:bg-primary-50"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(f)}
                className="rounded-md px-2 py-1 text-red-600 transition-colors hover:bg-red-50"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {filieres.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Aucune filière.</p>}
      </div>
    </Modal>
  );
}
