export type Role = "ADMIN" | "ENSEIGNANT" | "ETUDIANT";
export type StatutActif = "ACTIF" | "INACTIF";
export type StatutEnseignant = "ACTIF" | "EN_CONGE";
export type StatutCours = "PLANIFIE" | "REALISE" | "ANNULE";
export type StatutPresence = "PRESENT" | "ABSENT" | "RETARD" | "ABSENCE_JUSTIFIEE";
export type StatutJustificatif = "EN_ATTENTE" | "ACCEPTE" | "REFUSE";

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  role: Role;
  fonction?: string | null;
  departement?: string | null;
  photoUrl?: string | null;
  actif: boolean;
  etudiant?: Etudiant | null;
  enseignant?: Enseignant | null;
}

export interface UserAccount {
  id: number;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  role: Role;
  actif: boolean;
  createdAt: string;
  hasProfile: boolean;
}

export interface Filiere {
  id: number;
  nomFiliere: string;
  departement?: string | null;
}

export interface Classe {
  id: number;
  nomClasse: string;
  niveau: string;
  filiereId: number;
  filiere?: Filiere;
  effectifMax?: number | null;
  enseignantResponsableId?: number | null;
  enseignantResponsable?: Enseignant | null;
  _count?: { etudiants: number };
}

export interface Etudiant {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  dateNaissance?: string | null;
  sexe?: "M" | "F" | null;
  classeId: number;
  classe?: Classe;
  statut: StatutActif;
}

export interface Enseignant {
  id: number;
  matriculeEns: string;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  specialite?: string | null;
  statut: StatutEnseignant;
  affectations?: Affectation[];
}

export interface Matiere {
  id: number;
  code: string;
  nomMatiere: string;
  coefficient: number;
  affectations?: Affectation[];
}

export interface Affectation {
  id: number;
  matiereId: number;
  enseignantId: number;
  classeId: number;
  matiere?: Matiere;
  enseignant?: Enseignant;
  classe?: Classe;
}

export interface Cours {
  id: number;
  affectationId: number;
  date: string;
  heureDebut: string;
  heureFin?: string | null;
  salle?: string | null;
  statut: StatutCours;
  affectation?: Affectation;
}

export interface Presence {
  id: number;
  etudiantId: number;
  coursId: number;
  statut: StatutPresence;
  heureEnregistrement: string;
  etudiant?: Etudiant;
}

export interface EtudiantWithPresence extends Etudiant {
  presence: Presence | null;
}

export interface Justificatif {
  id: number;
  etudiantId: number;
  presenceId: number;
  motif: string;
  documentUrl?: string | null;
  statut: StatutJustificatif;
  dateSoumission: string;
  dateTraitement?: string | null;
  etudiant?: Etudiant;
  presence?: Presence & { cours?: Cours };
}

export type NotificationType =
  | "ABSENCE"
  | "RETARD"
  | "PLANNING_MODIFIE"
  | "JUSTIFICATIF"
  | "NOUVEAU_COMPTE"
  | "CHANGEMENT_STATUT"
  | "INFO_ADMIN";

export interface AppNotification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
