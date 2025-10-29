/*
  Warnings:

  - You are about to drop the column `club` on the `child` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `child` DROP COLUMN `club`,
    ADD COLUMN `clubId` VARCHAR(191) NULL,
    MODIFY `photo` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `record` ADD COLUMN `medal` ENUM('GOLD', 'SILVER', 'BRONZE') NULL,
    MODIFY `style` ENUM('FREESTYLE', 'BACKSTROKE', 'BREASTSTROKE', 'BUTTERFLY', 'INDIVIDUAL_MEDLEY', 'MEDLEY_RELAY', 'OPEN_WATER') NOT NULL,
    MODIFY `poolSize` ENUM('SHORT_25M', 'LONG_50M', 'OPEN_WATER') NOT NULL;

-- AlterTable
ALTER TABLE `training` MODIFY `style` ENUM('FREESTYLE', 'BACKSTROKE', 'BREASTSTROKE', 'BUTTERFLY', 'INDIVIDUAL_MEDLEY', 'MEDLEY_RELAY', 'OPEN_WATER') NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'PARENT', 'TEACHER') NOT NULL DEFAULT 'PARENT';

-- CreateTable
CREATE TABLE `SwimStyleConfig` (
    `id` VARCHAR(191) NOT NULL,
    `style` ENUM('FREESTYLE', 'BACKSTROKE', 'BREASTSTROKE', 'BUTTERFLY', 'INDIVIDUAL_MEDLEY', 'MEDLEY_RELAY', 'OPEN_WATER') NOT NULL,
    `nameEs` VARCHAR(191) NOT NULL,
    `nameEn` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SwimStyleConfig_style_key`(`style`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PoolTypeConfig` (
    `id` VARCHAR(191) NOT NULL,
    `poolSize` ENUM('SHORT_25M', 'LONG_50M', 'OPEN_WATER') NOT NULL,
    `nameEs` VARCHAR(191) NOT NULL,
    `nameEn` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PoolTypeConfig_poolSize_key`(`poolSize`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Club` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Club_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserClub` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `clubId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserClub_userId_clubId_key`(`userId`, `clubId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserClub` ADD CONSTRAINT `UserClub_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserClub` ADD CONSTRAINT `UserClub_clubId_fkey` FOREIGN KEY (`clubId`) REFERENCES `Club`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Child` ADD CONSTRAINT `Child_clubId_fkey` FOREIGN KEY (`clubId`) REFERENCES `Club`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
