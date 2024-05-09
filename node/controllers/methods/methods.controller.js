const CTRL = {};
const sequelize = require("../../database/sequelize");
const ITEMS_PER_PAGE = 20; // Puedes ajustar esto según tus necesidades
CTRL.create = async (req, res, next, Model) => {
  try {
    const data = await Model.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    console.log("error", error);
    next(error);
  }
};

CTRL.get = async (req, res, next, Model, where, include) => {
  try {
    const { page = 1, pageSize = ITEMS_PER_PAGE, searchTerm } = req.query;
    const { module, id } = req.params;
    // Validación de parámetros de consulta
    const parsedPage = parseInt(page);
    const parsedPageSize = parseInt(pageSize);

    if (isNaN(parsedPage) || isNaN(parsedPageSize) || parsedPage <= 0 || parsedPageSize <= 0) {
      return res.status(400).json({ error: 'Los parámetros de página son inválidos' });
    }
    const whereClause ={
      module:module,
      module_id:id
    };
    const offset = (parsedPage - 1) * parsedPageSize;
    const { count, rows: rows } = await Model.findAndCountAll({
      where: where,
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
    next(error);
  }
}

module.exports = CTRL;