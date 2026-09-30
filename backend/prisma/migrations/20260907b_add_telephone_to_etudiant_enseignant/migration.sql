-- AlterTable
ALTER TABLE `enseignants` ADD COLUMN `telephone` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `etudiants` ADD COLUMN `telephone` VARCHAR(191) NULL;

