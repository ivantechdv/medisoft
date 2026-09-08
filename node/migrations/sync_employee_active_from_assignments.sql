/**
 * One-shot SQL: marca is_active solo si el cuidador tiene
 * al menos un clients_services activo (is_deleted=0, statu=1/true)
 * y limpia situacion "Asignado*" sin asignación real.
 *
 * Ejecutar manualmente en MySQL si no se usa el endpoint
 * POST /api/v1/employees/sync-active-from-assignments
 */

-- Desactivar a todos los no borrados
UPDATE employees
SET is_active = 0
WHERE (is_deleted = 0 OR is_deleted IS NULL);

-- Activar solo con servicio de cliente vigente
UPDATE employees e
INNER JOIN (
  SELECT DISTINCT employee_id
  FROM clients_services
  WHERE employee_id > 0
    AND (is_deleted = 0 OR is_deleted IS NULL)
    AND (statu = 1 OR statu = TRUE)
) active ON active.employee_id = e.id
SET e.is_active = 1
WHERE (e.is_deleted = 0 OR e.is_deleted IS NULL);

-- Quitar situación "Asignado*" si no tiene asignación activa
-- (tabla del catálogo: status / statuses según entorno)
UPDATE employees e
LEFT JOIN (
  SELECT DISTINCT employee_id
  FROM clients_services
  WHERE employee_id > 0
    AND (is_deleted = 0 OR is_deleted IS NULL)
    AND (statu = 1 OR statu = TRUE)
) active ON active.employee_id = e.id
INNER JOIN status s ON s.id = e.statu_id
SET e.statu_id = NULL
WHERE (e.is_deleted = 0 OR e.is_deleted IS NULL)
  AND active.employee_id IS NULL
  AND s.name LIKE '%Asignad%';
