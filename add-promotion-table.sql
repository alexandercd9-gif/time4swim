-- Create Promotion table
CREATE TABLE IF NOT EXISTS `Promotion` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `discountType` ENUM('PERCENTAGE', 'FIXED') NOT NULL,
    `discountValue` DECIMAL(10, 2) NOT NULL,
    `durationMonths` INTEGER NOT NULL DEFAULT 3,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `maxUses` INTEGER NULL,
    `currentUses` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Promotion_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add promotion fields to Subscription table
ALTER TABLE `Subscription` 
ADD COLUMN `promotionId` VARCHAR(191) NULL,
ADD COLUMN `promotionEndsAt` DATETIME(3) NULL;

-- Add foreign key
ALTER TABLE `Subscription` 
ADD CONSTRAINT `Subscription_promotionId_fkey` 
FOREIGN KEY (`promotionId`) REFERENCES `Promotion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index for faster queries
CREATE INDEX `Subscription_promotionId_idx` ON `Subscription`(`promotionId`);
