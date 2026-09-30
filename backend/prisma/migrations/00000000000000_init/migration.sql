-- CreateTable
CREATE TABLE `utilisateurs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mot_de_passe` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'ENSEIGNANT', 'ETUDIANT') NOT NULL,
    `fonction` VARCHAR(191) NULL,
    `departement` VARCHAR(191) NULL,
    `photo_url` VARCHAR(191) NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `utilisateurs_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `filieres` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_filiere` VARCHAR(191) NOT NULL,
    `departement` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_classe` VARCHAR(191) NOT NULL,
    `niveau` VARCHAR(191) NOT NULL,
    `filiere_id` INTEGER NOT NULL,
    `effectif_max` INTEGER NULL,
    `enseignant_responsable_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `etudiants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `utilisateur_id` INTEGER NULL,
    `matricule` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `date_naissance` DATETIME(3) NULL,
    `sexe` ENUM('M', 'F') NULL,
    `email` VARCHAR(191) NULL,
    `classe_id` INTEGER NOT NULL,
    `statut` ENUM('ACTIF', 'INACTIF') NOT NULL DEFAULT 'ACTIF',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `etudiants_utilisateur_id_key`(`utilisateur_id`),
    UNIQUE INDEX `etudiants_matricule_key`(`matricule`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enseignants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `utilisateur_id` INTEGER NULL,
    `matricule_ens` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `specialite` VARCHAR(191) NULL,
    `statut` ENUM('ACTIF', 'EN_CONGE') NOT NULL DEFAULT 'ACTIF',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `enseignants_utilisateur_id_key`(`utilisateur_id`),
    UNIQUE INDEX `enseignants_matricule_ens_key`(`matricule_ens`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matieres` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `nom_matiere` VARCHAR(191) NOT NULL,
    `coefficient` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `matieres_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `affectations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `matiere_id` INTEGER NOT NULL,
    `enseignant_id` INTEGER NOT NULL,
    `classe_id` INTEGER NOT NULL,

    UNIQUE INDEX `affectations_matiere_id_classe_id_key`(`matiere_id`, `classe_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cours` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `affectation_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `heure_debut` VARCHAR(191) NOT NULL,
    `heure_fin` VARCHAR(191) NULL,
    `salle` VARCHAR(191) NULL,
    `statut` ENUM('PLANIFIE', 'REALISE', 'ANNULE') NOT NULL DEFAULT 'PLANIFIE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cours_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `presences` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `etudiant_id` INTEGER NOT NULL,
    `cours_id` INTEGER NOT NULL,
    `statut` ENUM('PRESENT', 'ABSENT', 'RETARD', 'ABSENCE_JUSTIFIEE') NOT NULL,
    `heure_enregistrement` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `enregistre_par_id` INTEGER NULL,

    UNIQUE INDEX `presences_etudiant_id_cours_id_key`(`etudiant_id`, `cours_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `justificatifs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `etudiant_id` INTEGER NOT NULL,
    `presence_id` INTEGER NOT NULL,
    `motif` TEXT NOT NULL,
    `document_url` VARCHAR(191) NULL,
    `statut` ENUM('EN_ATTENTE', 'ACCEPTE', 'REFUSE') NOT NULL DEFAULT 'EN_ATTENTE',
    `traite_par_id` INTEGER NULL,
    `date_soumission` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_traitement` DATETIME(3) NULL,

    UNIQUE INDEX `justificatifs_presence_id_key`(`presence_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `classes` ADD CONSTRAINT `classes_filiere_id_fkey` FOREIGN KEY (`filiere_id`) REFERENCES `filieres`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classes` ADD CONSTRAINT `classes_enseignant_responsable_id_fkey` FOREIGN KEY (`enseignant_responsable_id`) REFERENCES `enseignants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `etudiants` ADD CONSTRAINT `etudiants_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `etudiants` ADD CONSTRAINT `etudiants_classe_id_fkey` FOREIGN KEY (`classe_id`) REFERENCES `classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enseignants` ADD CONSTRAINT `enseignants_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affectations` ADD CONSTRAINT `affectations_matiere_id_fkey` FOREIGN KEY (`matiere_id`) REFERENCES `matieres`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affectations` ADD CONSTRAINT `affectations_enseignant_id_fkey` FOREIGN KEY (`enseignant_id`) REFERENCES `enseignants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affectations` ADD CONSTRAINT `affectations_classe_id_fkey` FOREIGN KEY (`classe_id`) REFERENCES `classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cours` ADD CONSTRAINT `cours_affectation_id_fkey` FOREIGN KEY (`affectation_id`) REFERENCES `affectations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `presences` ADD CONSTRAINT `presences_etudiant_id_fkey` FOREIGN KEY (`etudiant_id`) REFERENCES `etudiants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `presences` ADD CONSTRAINT `presences_cours_id_fkey` FOREIGN KEY (`cours_id`) REFERENCES `cours`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `presences` ADD CONSTRAINT `presences_enregistre_par_id_fkey` FOREIGN KEY (`enregistre_par_id`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `justificatifs` ADD CONSTRAINT `justificatifs_etudiant_id_fkey` FOREIGN KEY (`etudiant_id`) REFERENCES `etudiants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `justificatifs` ADD CONSTRAINT `justificatifs_presence_id_fkey` FOREIGN KEY (`presence_id`) REFERENCES `presences`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `justificatifs` ADD CONSTRAINT `justificatifs_traite_par_id_fkey` FOREIGN KEY (`traite_par_id`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

