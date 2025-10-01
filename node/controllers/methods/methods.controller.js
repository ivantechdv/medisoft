const CTRL = {};
const sequelize = require("../../database/sequelize");
const { Sequelize, Op, col } = require("sequelize");
const { UniqueConstraintError } = require("sequelize");
const ITEMS_PER_PAGE = 20; // Puedes ajustar esto según tus necesidades
(CTRL.create = async (req, res, next, Model) => {
  try {
    const data = await Model.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      const errors = error.errors.map(
        (e) => `El valor '${e.value}' ya existe.`
      );
      return res.status(409).json({ errors });
    }

    // Otros errores de base de datos
    const isSequelizeError =
      error.name?.startsWith("Sequelize") || Boolean(error.parent?.sqlMessage);

    if (isSequelizeError) {
      const sqlMessage = error.parent?.sqlMessage || error.message;
      const fieldMatch = sqlMessage.match(/column '(.+?)'/);
      return res.status(400).json({
        error: sqlMessage,
        field: fieldMatch?.[1] || "unknown",
        type: "DATABASE_ERROR",
      });
    }

    // Errores generales
    console.log("error", error);
    next(error);
  }
}),
  (CTRL.createOrUpdateBulk = async (data, Model) => {
    try {
      const createData = [];
      const updateData = [];

      console.log("Data recibida:", data);

      // Separar los datos para creación y actualización
      data.forEach((item) => {
        if (item.id) {
          updateData.push(item); // Para actualización
        } else {
          createData.push(item); // Para creación
        }
      });

      // Crear nuevos registros
      if (createData.length > 0) {
        console.log("Registros a crear:", createData);
        const created = await Model.bulkCreate(createData, { validate: true });
        console.log("Registros creados con éxito:", created);
      }

      // Actualizar registros existentes
      if (updateData.length > 0) {
        console.log("Registros a actualizar:", updateData);
        const updatePromises = updateData.map(async (item) => {
          const { id, ...updateFields } = item;
          const [updatedCount] = await Model.update(updateFields, {
            where: { id },
          });
          console.log(`Registros actualizados para ID ${id}:`, updatedCount);
        });
        await Promise.all(updatePromises);
      }

      return true; // Devolver éxito
    } catch (error) {
      console.error("Error al guardar o actualizar los datos:", error);
      throw error;
    }
  });

CTRL.update = async (req, res, next, Model) => {
  try {
    console.log("reqboody", req.body);
    const { id } = req.params;
    console.log("id", id);
    const data = await Model.update(req.body, {
      where: { id },
    });
    if (data) {
      return res.status(201).json({ id: id });
    }
    return res.status(404).json({ message: "Registro no encontrado" });
  } catch (error) {
    next(error);
  }
};

CTRL.get = async (
  req,
  res,
  next,
  Model,
  where = {},
  include,
  additionalSearchConditions = []
) => {
  try {
    const { page = 1, pageSize, searchTerm, is_deleted } = req.query;
    const {
      is_active, // filtro estado
      type, // filtro tipo
      level_id, // filtro nivel
      statu_id, // filtro situacion
    } = req.query;
    // Validación de parámetros de consulta
    let parsedPage;
    let parsedPageSize;
    let offset;
    if (pageSize) {
      parsedPage = parseInt(page);
      parsedPageSize = parseInt(pageSize);

      offset = (parsedPage - 1) * parsedPageSize;
    }
    const searchWhere = {
      ...(searchTerm && {
        [Op.or]: [
          { full_name: { [Op.like]: `%${searchTerm}%` } },
          { email: { [Op.like]: `%${searchTerm}%` } },
          { dni: { [Op.like]: `%${searchTerm}%` } },
          { alias: { [Op.like]: `%${searchTerm}%` } },
          { phone: { [Op.like]: `%${searchTerm}%` } },
          { id: { [Op.like]: `%${searchTerm}%` } },
          ...additionalSearchConditions,
        ],
      }),
      ...(typeof is_deleted !== "undefined" && { is_deleted }),
      ...(typeof is_active !== "undefined" && { is_active }),
      ...(typeof type !== "undefined" && { type }),
      ...(typeof level_id !== "undefined" && { level_id }),
      ...(typeof statu_id !== "undefined" && { statu_id }),
    };

    // Combinar la cláusula where existente con la cláusula de búsqueda
    const combinedWhere = {
      [Op.and]: [where, searchWhere],
    };

    const ids = await Model.findAll({
      attributes: ["id"],
      where: combinedWhere,
      include: include,
      subQuery: false,
    });

    // console.log("ids", ids);

    const { count, rows } = await Model.findAndCountAll({
      where: {
        id: ids.map((idRecord) => idRecord.id),
      },
      distinct: true,
      include: include,
      ...(pageSize && {
        limit: parsedPageSize,
        offset: offset,
      }),
      order: [["id", "ASC"]],
    });

    // const { count, rows: rows } = await Model.findAndCountAll({
    //   include: include,
    //   where: combinedWhere,
    //   limit: parsedPageSize,
    //   offset,
    //   order: [["id", "ASC"]],
    // });

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
    console.error("Error al ejecutar la consulta:", error);
  }
};
CTRL.getAll = async (
  req,
  res,
  next,
  Model,
  where,
  include,
  returnData = false
) => {
  try {
    const queryParameters = req.query;
    const useLike = queryParameters.useLike === "true"; // Verificar si se debe usar LIKE
    delete queryParameters.useLike; // Eliminar este parametro para que no afecte el resto de la lógica

    const condition = useLike ? { [Op.or]: [] } : {};

    if (queryParameters) {
      Object.keys(queryParameters).forEach((key) => {
        if (key !== "order" && queryParameters[key]) {
          if (useLike) {
            const likeCondition = {};
            likeCondition[key] = {
              [Op.like]: queryParameters[key],
            };
            condition[Op.or].push(likeCondition);
          } else {
            condition[key] = queryParameters[key];
          }
        }
      });
    }
    let order = [];
    if (queryParameters.order) {
      const [field, direction] = queryParameters.order.split("-");
      // Validar y usar 'field' y 'direction' para ordenar los resultados
      if (direction === "asc" || direction === "desc") {
        const fields = field.split("and");
        if (fields) {
          for (const orderField of fields) {
            order.push([orderField, direction.toUpperCase()]);
          }
        } else {
          order = [[field, direction.toUpperCase()]];
        }
      }
    }

    console.log("order", order);
    if (queryParameters.service_start === "true") {
      condition["service_start"] = {
        [Sequelize.Op.ne]: null, // Solo servicios que tienen service_start
      };
    }

    const queryOptions = {
      where: condition,
    };

    // if (include && Object.keys(include).length > 0) {
    //   console.log("**********");
    //   console.log(include);
    //   queryOptions.include = include;
    // }
    let optionInclude = [];
    if (include != null) {
      optionInclude = include;
    }

    console.log("condition =>", condition);
    const result = await Model.findAll({
      where: { ...condition, ...where },
      include: optionInclude,
      order: order, // Añadir el parámetro 'order' a la consulta
    });

    if (returnData) {
      return result; // Devolver los resultados si se requiere
    } else {
      res.json(result); // Enviar los resultados si no se requiere devolverlos
    }
  } catch (error) {
    console.log("error", error);
    next(error);
  }
};
CTRL.getById = async (req, res, next, Model, where, include) => {
  const { id } = req.params;
  try {
    let result = false;
    if (include) {
      result = await Model.findByPk(id, {
        include: include,
      });
    } else {
      result = await Model.findByPk(id);
    }

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: Model + " registro no encontrado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener registro " + Model });
  }
};

CTRL.delete = async (req, res, next, Model, where, returnData = false) => {
  const { id } = req.params;
  let condition = {};
  if (id) {
    condition = { id };
  }
  if (where) {
    condition = where;
  }
  try {
    const result = await Model.destroy({
      where: condition,
    });

    if (result) {
      if (returnData) {
        return;
      }
      res.status(200).json(true);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar registro " + Model });
  }
};

module.exports = CTRL;
