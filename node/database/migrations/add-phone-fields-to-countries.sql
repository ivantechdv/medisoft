-- Ejecutar este script en tu base de datos MySQL para agregar los campos phone_format y phone_mask a la tabla countries

ALTER TABLE countries 
ADD COLUMN phone_format VARCHAR(50) NULL COMMENT 'Formato E.164 del número de teléfono (ej: 999999999)' AFTER name,
ADD COLUMN phone_mask VARCHAR(50) NULL COMMENT 'Máscara visual del número de teléfono (ej: 999 99 99 99)' AFTER phone_format;
