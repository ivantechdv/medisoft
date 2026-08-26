-- Añade configuración de apariencia global (ui_config) a la tabla configs.
ALTER TABLE configs
ADD COLUMN ui_config JSON NULL
AFTER employee_config;
