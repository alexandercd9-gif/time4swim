-- CreateTable
CREATE TABLE `SystemConfig` (
    `id` VARCHAR(191) NOT NULL,
    `activePaymentProcessor` VARCHAR(191) NOT NULL DEFAULT 'culqi',
    `mercadopagoPublicKey` VARCHAR(191) NULL,
    `mercadopagoAccessToken` TEXT NULL,
    `mercadopagoMode` VARCHAR(191) NULL DEFAULT 'test',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
