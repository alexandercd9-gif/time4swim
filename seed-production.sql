-- Script de seed para producción
-- Ejecutar en la base de datos MySQL de producción

-- 1. INSERTAR ESTILOS DE NATACIÓN
-- Primero limpiamos si hay datos existentes (opcional)
DELETE FROM `SwimStyleConfig`;

-- Insertar estilos
INSERT INTO `SwimStyleConfig` (`id`, `style`, `nameEs`, `nameEn`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
('swim_style_1', 'FREESTYLE', 'Libre', 'Freestyle', 'Estilo libre o crol', 1, NOW(), NOW()),
('swim_style_2', 'BACKSTROKE', 'Espalda', 'Backstroke', 'Estilo espalda', 1, NOW(), NOW()),
('swim_style_3', 'BREASTSTROKE', 'Pecho', 'Breaststroke', 'Estilo pecho o braza', 1, NOW(), NOW()),
('swim_style_4', 'BUTTERFLY', 'Mariposa', 'Butterfly', 'Estilo mariposa', 1, NOW(), NOW()),
('swim_style_5', 'MEDLEY_RELAY', '4 Estilos', 'Individual Medley', 'Combinado individual (mariposa, espalda, pecho, libre)', 1, NOW(), NOW());

-- 2. INSERTAR TIPOS DE PISCINA
-- Primero limpiamos si hay datos existentes (opcional)
DELETE FROM `PoolTypeConfig`;

-- Insertar tipos de piscina
INSERT INTO `PoolTypeConfig` (`id`, `poolSize`, `nameEs`, `nameEn`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
('pool_type_1', 'SHORT_25M', 'Piscina Corta (25m)', 'Short Course (25m)', 'Piscina de 25 metros', 1, NOW(), NOW()),
('pool_type_2', 'LONG_50M', 'Piscina Olímpica (50m)', 'Olympic Pool (50m)', 'Piscina de 50 metros', 1, NOW(), NOW()),
('pool_type_3', 'OPEN_WATER', 'Aguas Abiertas', 'Open Water', 'Competencias en aguas abiertas (mar, lago, río)', 1, NOW(), NOW());

-- Verificar los datos insertados
SELECT 'Estilos insertados:' as Info;
SELECT COUNT(*) as Total FROM `SwimStyleConfig`;
SELECT * FROM `SwimStyleConfig`;

SELECT 'Tipos de piscina insertados:' as Info;
SELECT COUNT(*) as Total FROM `PoolTypeConfig`;
SELECT * FROM `PoolTypeConfig`;
