const CTRL = {};
const sequelize = require("../../database/sequelize");
const EventLogs = require("../../models/eventlogs/eventlogs.model");

CTRL.create = async (req, res, next) => {
  try {
    const data = await EventLogs.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    return res.json({ error: error });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    const { page = 1, pageSize = ITEMS_PER_PAGE, searchTerm } = req.query;
    const { module, id } = req.params;
    // Validación de parámetros de consulta
    const parsedPage = parseInt(page);
    const parsedPageSize = parseInt(pageSize);

    if (
      isNaN(parsedPage) ||
      isNaN(parsedPageSize) ||
      parsedPage <= 0 ||
      parsedPageSize <= 0
    ) {
      return res
        .status(400)
        .json({ error: "Los parámetros de página son inválidos" });
    }
    const whereClause = {
      module: module,
      module_id: id,
    };
    const offset = (parsedPage - 1) * parsedPageSize;
    const { count, rows: rows } = await EventLogs.findAndCountAll({
      where: whereClause,
      limit: parsedPageSize,
      offset,
    });

    const totalPages = Math.ceil(count / parsedPageSize);

    res.json({
      data: rows,
      meta: {
        totalRow: count,
        totalPages,
        currentPage: parsedPage,
      },
    });
  } catch (error) {
    return res.json({ error: error });
  }
};

module.exports = CTRL;
