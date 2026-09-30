# ATTENDPRO

Système de gestion de la présence des étudiants — projet académique. Application web permettant à un établissement d'enseignement de centraliser la gestion des étudiants, enseignants, classes, matières, séances et présences, avec calcul automatique des statistiques d'assiduité.

Développé à partir du cahier des charges `Cahier_des_charges_Systeme_gestion_presence_etudiants-1.docx` et des maquettes Stitch fournies.

## Sommaire

- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Base de données](#base-de-données)
- [Lancement](#lancement)
- [Comptes de test](#comptes-de-test)
- [API principales](#api-principales)
- [Décisions techniques](#décisions-techniques)

## Architecture

```
ATTENDPRO/
├── backend/     API REST Node.js/Express/TypeScript + Prisma
├── frontend/    Application React/TypeScript/Vite/Tailwind
└── docs/
```

Le backend suit une architecture en couches : `routes → controllers → services → Prisma`, avec des middlewares dédiés (authentification JWT, contrôle de rôle, validation Zod, gestion centralisée des erreurs).

Le frontend est organisé par `pages / components / layouts / services / contexts / hooks / types`, avec un routage React Router protégé par rôle (ADMIN, ENSEIGNANT, ÉTUDIANT).

## Technologies

| Couche | Choix |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Node.js, TypeScript, Express |
| Base de données | MySQL + Prisma ORM |
| Authentification | JWT + bcrypt, contrôle d'accès par rôle |
| Validation | Zod |

Le back-end Node.js a été retenu parmi les options du cahier des charges (PHP, Python, Java, Node.js) pour partager les types TypeScript avec le frontend et simplifier la maintenance dans un contexte académique.

## Prérequis

- Node.js ≥ 18 et npm
- MySQL ≥ 8 (ou MariaDB compatible) — un serveur local (XAMPP, WAMP, MySQL Workbench, etc.) convient

## Installation

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Configuration

Copier les fichiers d'exemple et renseigner vos valeurs :

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env` :

```
DATABASE_URL="mysql://root:password@localhost:3306/attendpro"
PORT=4000
JWT_SECRET="change-me-to-a-long-random-string"
JWT_EXPIRES_IN="1d"
CORS_ORIGIN="http://localhost:5173"
```

`frontend/.env` :

```
VITE_API_URL=http://localhost:4000/api
```

Aucun secret réel n'est présent dans le dépôt — `.env` est ignoré par Git.

## Base de données

Créer la base (vide) correspondant à `DATABASE_URL`, par exemple :

```sql
CREATE DATABASE attendpro CHARACTER SET utf8mb4;
```

Puis, depuis `backend/` :

```bash
npm run prisma:migrate      # crée les tables (migration initiale)
npm run seed                # peuple la base avec des données de démonstration
```

`npm run prisma:studio` ouvre une interface graphique pour explorer les données.

## Lancement

Deux terminaux séparés :

```bash
cd backend
npm run dev        # API sur http://localhost:4000
```

```bash
cd frontend
npm run dev         # application sur http://localhost:5173
```

Build de production :

```bash
cd backend && npm run build && npm start
cd frontend && npm run build && npm run preview
```

## Comptes de test

Créés par le script de seed (`npm run seed`) :

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur (Directeur) | admin@attendpro.edu | admin123 |
| Enseignant | alain.dupont@attendpro.edu | prof123 |
| Étudiant | amadou.diallo@attendpro.edu | etu123 |

## API principales

Toutes les routes sont préfixées par `/api` et protégées par JWT (`Authorization: Bearer <token>`), sauf `/api/auth/login`.

| Ressource | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `GET /auth/me` |
| Utilisateurs | `GET /users`, `PATCH /users/:id/status`, `PATCH /users/me/profile`, `POST /users/me/change-password` |
| Étudiants | `GET/POST /students`, `GET/PATCH/DELETE /students/:id` |
| Enseignants | `GET/POST /teachers`, `GET /teachers/stats`, `PATCH/DELETE /teachers/:id` |
| Classes | `GET/POST /classes`, `GET /classes/stats`, `PATCH/DELETE /classes/:id` |
| Filières | `GET/POST /filieres`, `PATCH/DELETE /filieres/:id` |
| Matières | `GET/POST /subjects`, `GET /subjects/stats`, `PATCH/DELETE /subjects/:id` |
| Affectations | `POST /subjects/affectations`, `DELETE /subjects/affectations/:id` |
| Séances | `GET /cours/affectations`, `POST /cours/seances`, `GET /cours/seances/:id` |
| Présences | `POST /presences` (saisie groupée), `PATCH /presences/:id` (correction), `GET /presences/history`, `GET /presences/stats` |
| Justificatifs | `GET/POST /justificatifs`, `PATCH /justificatifs/:id` |
| Statistiques | `GET /stats/dashboard`, `GET /stats/reports`, `GET /stats/me` |

## Décisions techniques

Par rapport au schéma minimal du cahier des charges, quelques ajouts techniques ont été nécessaires pour rendre les fonctionnalités opérationnelles (validés avec le porteur du projet) :

- Table **Filiere** distincte (plutôt qu'un champ texte libre) pour fiabiliser les filtres.
- Table **Affectation** (matière ↔ enseignant ↔ classe) : association durable qui alimente automatiquement les séances (`Cours`).
- Champs `statut` sur `Cours` (planifié/réalisé/annulé), `Etudiant` et `Enseignant` (actif/inactif/en congé) pour les tableaux de bord.
- Champs `fonction`, `departement`, `photoUrl` sur `Utilisateur` pour la page Paramètres.
- Les onglets « Préférences » et « Notifications » visibles sur la maquette Paramètres n'ont pas été implémentés : aucune exigence fonctionnelle correspondante dans le cahier des charges, pour éviter d'introduire des réglages qui n'affecteraient rien réellement.
- Export « Excel » = CSV (ouvrable nativement dans Excel) ; export « PDF » = impression navigateur — évite d'ajouter des dépendances lourdes pour un besoin académique.
