/*
  Warnings:

  - You are about to drop the column `userId` on the `child` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `child` DROP FOREIGN KEY `Child_userId_fkey`;

-- DropIndex
DROP INDEX `Child_userId_fkey` ON `child`;

-- AlterTable
ALTER TABLE `child` DROP COLUMN `userId`,
    ADD COLUMN `fdpnAffiliateCode` VARCHAR(191) NULL,
    ADD COLUMN `fdpnData` LONGTEXT NULL,
    ADD COLUMN `fdpnLastSync` DATETIME(3) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `training` ADD COLUMN `laps` JSON NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `accountStatus` ENUM('TRIAL', 'ACTIVE', 'EXPIRED', 'SUSPENDED') NOT NULL DEFAULT 'TRIAL',
    ADD COLUMN `isTrialAccount` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `parentType` ENUM('PADRE', 'MADRE', 'TUTOR', 'ABUELO', 'ABUELA', 'OTRO') NULL,
    ADD COLUMN `trialExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `trialExtendedAt` DATETIME(3) NULL,
    ADD COLUMN `trialExtendedBy` VARCHAR(191) NULL,
    MODIFY `role` ENUM('ADMIN', 'PARENT', 'TEACHER', 'CLUB') NOT NULL DEFAULT 'PARENT';

-- CreateTable
CREATE TABLE `UserChild` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `childId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserChild_userId_childId_key`(`userId`, `childId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `location` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `eligibleCategories` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `clubId` VARCHAR(191) NOT NULL,

    INDEX `Event_clubId_idx`(`clubId`),
    INDEX `Event_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventParticipation` (
    `id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'INVITED',
    `respondedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `childId` VARCHAR(191) NOT NULL,

    INDEX `EventParticipation_eventId_idx`(`eventId`),
    INDEX `EventParticipation_childId_idx`(`childId`),
    INDEX `EventParticipation_status_idx`(`status`),
    UNIQUE INDEX `EventParticipation_eventId_childId_key`(`eventId`, `childId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Child_fdpnAffiliateCode_idx` ON `Child`(`fdpnAffiliateCode`);

-- AddForeignKey
ALTER TABLE `UserChild` ADD CONSTRAINT `UserChild_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserChild` ADD CONSTRAINT `UserChild_childId_fkey` FOREIGN KEY (`childId`) REFERENCES `Child`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_clubId_fkey` FOREIGN KEY (`clubId`) REFERENCES `Club`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventParticipation` ADD CONSTRAINT `EventParticipation_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventParticipation` ADD CONSTRAINT `EventParticipation_childId_fkey` FOREIGN KEY (`childId`) REFERENCES `Child`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
