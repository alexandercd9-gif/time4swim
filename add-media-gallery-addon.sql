-- =====================================================
-- Script: Agregar Add-on de Galería de Medios
-- Fecha: 2025-11-19
-- Descripción: Agrega columnas para el add-on de fotos/videos
-- Costo adicional: S/15 mensuales
-- =====================================================

USE time4swim;

-- 1. Agregar columna en la tabla de suscripciones para el add-on
ALTER TABLE Subscription 
ADD COLUMN mediaGalleryAddon BOOLEAN DEFAULT FALSE COMMENT 'Add-on activo: Galería de fotos/videos (+S/15/mes)',
ADD COLUMN addonsAmount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Monto total de add-ons activos';

-- 2. Agregar columnas en Record para almacenar medios
ALTER TABLE Record
ADD COLUMN mediaUrls JSON COMMENT 'URLs de fotos/videos subidos (array de objetos)',
ADD COLUMN mediaCount INT DEFAULT 0 COMMENT 'Contador de archivos multimedia',
ADD COLUMN hasMedia BOOLEAN DEFAULT FALSE COMMENT 'Indica si tiene archivos adjuntos';

-- 3. Crear índice para búsquedas rápidas
CREATE INDEX idx_record_has_media ON Record(hasMedia);
CREATE INDEX idx_subscription_media_addon ON Subscription(mediaGalleryAddon);

-- 4. Actualizar suscripciones existentes (opcional - solo si quieres migrar datos)
-- UPDATE Subscription 
-- SET addonsAmount = 0.00, mediaGalleryAddon = FALSE
-- WHERE mediaGalleryAddon IS NULL;

-- 5. Verificar los cambios
SELECT 'Columnas agregadas correctamente' AS status;

DESCRIBE Subscription;
DESCRIBE Record;

-- =====================================================
-- Consultas útiles para administrar el add-on:
-- =====================================================

-- Ver usuarios con el add-on activo:
-- SELECT u.email, s.planType, s.amount, s.addonsAmount, s.mediaGalleryAddon
-- FROM User u
-- JOIN Subscription s ON u.id = s.userId
-- WHERE s.mediaGalleryAddon = TRUE;

-- Ver records con medios:
-- SELECT r.id, r.competition, r.date, r.mediaCount, ch.name as swimmer
-- FROM Record r
-- JOIN Child ch ON r.childId = ch.id
-- WHERE r.hasMedia = TRUE;

-- Calcular monto total de una suscripción (plan + add-ons):
-- SELECT 
--   u.email,
--   s.planType,
--   s.amount as basePlan,
--   s.addonsAmount,
--   (s.amount + s.addonsAmount) as totalAmount,
--   s.mediaGalleryAddon
-- FROM User u
-- JOIN Subscription s ON u.id = s.userId
-- WHERE s.status = 'ACTIVE';
