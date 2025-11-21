-- Agregar campo para identificar si el add-on de media gallery es gratis
-- Este campo permite al admin dar acceso gratis sin cobrar

ALTER TABLE `Subscription` 
ADD COLUMN `mediaGalleryIsFree` BOOLEAN NOT NULL DEFAULT false AFTER `mediaGalleryAddon`;

-- Crear índice para búsquedas rápidas
CREATE INDEX `idx_subscription_free_addon` ON `Subscription`(`mediaGalleryIsFree`);

-- Comentario: 
-- mediaGalleryAddon = true -> El usuario tiene acceso
-- mediaGalleryIsFree = true -> Admin lo dio gratis (no cobrar)
-- mediaGalleryIsFree = false -> Usuario pagó S/15/mes (cobrar en addonsAmount)
