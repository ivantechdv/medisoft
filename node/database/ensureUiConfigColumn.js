const sequelize = require('./sequelize');

let uiConfigColumnEnsured = false;

async function ensureUiConfigColumn() {
  if (uiConfigColumnEnsured) return;

  const [cols] = await sequelize.query(
    "SHOW COLUMNS FROM configs LIKE 'ui_config'",
  );

  if (cols.length) {
    uiConfigColumnEnsured = true;
    return;
  }

  try {
    await sequelize.query(
      'ALTER TABLE configs ADD COLUMN ui_config JSON NULL AFTER employee_config',
    );
    console.log('[DB] Columna ui_config creada (JSON)');
  } catch (jsonError) {
    console.warn('[DB] JSON no disponible para ui_config, usando LONGTEXT:', jsonError.message);
    await sequelize.query(
      'ALTER TABLE configs ADD COLUMN ui_config LONGTEXT NULL AFTER employee_config',
    );
    console.log('[DB] Columna ui_config creada (LONGTEXT)');
  }

  uiConfigColumnEnsured = true;
}

module.exports = { ensureUiConfigColumn };
