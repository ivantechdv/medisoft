const sequelize = require('../database/sequelize');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    const [cols] = await sequelize.query(
      "SHOW COLUMNS FROM configs LIKE 'ui_config'",
    );

    if (cols.length) {
      console.log('Column ui_config already exists');
      return;
    }

    try {
      await sequelize.query(
        'ALTER TABLE configs ADD COLUMN ui_config JSON NULL AFTER employee_config',
      );
    } catch (jsonError) {
      console.warn('JSON type failed, trying LONGTEXT:', jsonError.message);
      await sequelize.query(
        'ALTER TABLE configs ADD COLUMN ui_config LONGTEXT NULL AFTER employee_config',
      );
    }

    console.log('Column ui_config added successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
