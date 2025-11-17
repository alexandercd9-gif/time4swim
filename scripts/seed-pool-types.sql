-- Script para poblar la tabla PoolTypeConfig en producción
-- Ejecutar en el servidor MySQL de producción

USE time4swim;

-- Insertar tipos de piscina si no existen
INSERT INTO pooltypeconfig (id, poolSize, nameEs, nameEn, description, isActive, createdAt, updatedAt)
SELECT 'pool_short_25m', 'SHORT_25M', 'Piscina Corta 25m', 'Short Course 25m', NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM pooltypeconfig WHERE poolSize = 'SHORT_25M');

INSERT INTO pooltypeconfig (id, poolSize, nameEs, nameEn, description, isActive, createdAt, updatedAt)
SELECT 'pool_long_50m', 'LONG_50M', 'Piscina Larga 50m', 'Long Course 50m', NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM pooltypeconfig WHERE poolSize = 'LONG_50M');

INSERT INTO pooltypeconfig (id, poolSize, nameEs, nameEn, description, isActive, createdAt, updatedAt)
SELECT 'pool_open_water', 'OPEN_WATER', 'Aguas Abiertas', 'Open Water', NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM pooltypeconfig WHERE poolSize = 'OPEN_WATER');

-- Verificar que se insertaron correctamente
SELECT id, poolSize, nameEs, nameEn, isActive FROM pooltypeconfig;
