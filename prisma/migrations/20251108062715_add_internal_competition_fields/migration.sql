-- AlterTable
ALTER TABLE `event` ADD COLUMN `distance` INTEGER NULL,
    ADD COLUMN `isInternalCompetition` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lanes` INTEGER NULL,
    ADD COLUMN `style` ENUM('FREESTYLE', 'BACKSTROKE', 'BREASTSTROKE', 'BUTTERFLY', 'INDIVIDUAL_MEDLEY', 'MEDLEY_RELAY', 'OPEN_WATER') NULL;

-- CreateTable
CREATE TABLE `HeatLane` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `lane` INTEGER NOT NULL,
    `heatNumber` INTEGER NOT NULL DEFAULT 1,
    `swimmerId` VARCHAR(191) NOT NULL,
    `coachId` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NULL,
    `endTime` DATETIME(3) NULL,
    `finalTime` DOUBLE NULL,
    `isValidated` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `HeatLane_eventId_idx`(`eventId`),
    INDEX `HeatLane_swimmerId_idx`(`swimmerId`),
    INDEX `HeatLane_coachId_idx`(`coachId`),
    UNIQUE INDEX `HeatLane_eventId_lane_heatNumber_swimmerId_key`(`eventId`, `lane`, `heatNumber`, `swimmerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Event_isInternalCompetition_idx` ON `Event`(`isInternalCompetition`);

-- AddForeignKey
ALTER TABLE `HeatLane` ADD CONSTRAINT `HeatLane_swimmerId_fkey` FOREIGN KEY (`swimmerId`) REFERENCES `Child`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HeatLane` ADD CONSTRAINT `HeatLane_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HeatLane` ADD CONSTRAINT `HeatLane_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
