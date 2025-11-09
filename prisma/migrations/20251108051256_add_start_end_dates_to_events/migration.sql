/*
  Warnings:

  - You are about to drop the column `date` on the `event` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Event_date_idx` ON `event`;

-- AlterTable
ALTER TABLE `event` DROP COLUMN `date`,
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE INDEX `Event_startDate_idx` ON `Event`(`startDate`);
