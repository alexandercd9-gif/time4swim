-- DropIndex
DROP INDEX `HeatLane_eventId_lane_heatNumber_swimmerId_key` ON `heatlane`;

-- AlterTable
ALTER TABLE `club` ADD COLUMN `customColors` VARCHAR(191) NULL,
    ADD COLUMN `customDomain` VARCHAR(191) NULL,
    ADD COLUMN `customLogo` LONGTEXT NULL,
    ADD COLUMN `hasUnreadNews` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isProActive` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isProTrial` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastNewsReadAt` DATETIME(3) NULL,
    ADD COLUMN `proActivatedAt` DATETIME(3) NULL,
    ADD COLUMN `proTrialExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `proTrialStartedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `event` ADD COLUMN `categoryDistances` TEXT NULL,
    ADD COLUMN `isCompleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `heatlane` MODIFY `swimmerId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `training` ADD COLUMN `poolType` ENUM('SHORT_25M', 'LONG_50M', 'OPEN_WATER') NOT NULL DEFAULT 'SHORT_25M';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `profilePhoto` LONGTEXT NULL;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `clubId` VARCHAR(191) NULL,
    `plan` ENUM('TRIAL', 'PARENT_BASIC', 'PARENT_FAMILY', 'PARENT_PREMIUM', 'CLUB_FREE', 'CLUB_PRO_TRIAL', 'CLUB_PRO') NOT NULL,
    `status` ENUM('ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'TRIALING') NOT NULL DEFAULT 'ACTIVE',
    `currentPrice` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'PEN',
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `currentPeriodStart` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `currentPeriodEnd` DATETIME(3) NOT NULL,
    `canceledAt` DATETIME(3) NULL,
    `culqiCustomerId` VARCHAR(191) NULL,
    `culqiSubscriptionId` VARCHAR(191) NULL,
    `culqiCardId` VARCHAR(191) NULL,
    `maxChildren` INTEGER NOT NULL DEFAULT 1,
    `maxTeachers` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subscription_userId_key`(`userId`),
    UNIQUE INDEX `Subscription_clubId_key`(`clubId`),
    UNIQUE INDEX `Subscription_culqiSubscriptionId_key`(`culqiSubscriptionId`),
    INDEX `Subscription_status_idx`(`status`),
    INDEX `Subscription_culqiCustomerId_idx`(`culqiCustomerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `subscriptionId` VARCHAR(191) NOT NULL,
    `culqiChargeId` VARCHAR(191) NOT NULL,
    `culqiOrderId` VARCHAR(191) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'PEN',
    `paymentMethod` ENUM('CARD', 'YAPE', 'PLIN') NOT NULL,
    `cardBrand` VARCHAR(191) NULL,
    `cardLastFour` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `paidAt` DATETIME(3) NULL,
    `failedReason` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `receiptUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_culqiChargeId_key`(`culqiChargeId`),
    INDEX `Payment_subscriptionId_idx`(`subscriptionId`),
    INDEX `Payment_status_idx`(`status`),
    INDEX `Payment_paidAt_idx`(`paidAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemConfig` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SystemConfig_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_clubId_fkey` FOREIGN KEY (`clubId`) REFERENCES `Club`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
