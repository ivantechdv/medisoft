const CTRL = {};
const sequelize = require("../../database/sequelize");
const User = require("../../models/users/users.model");
const Client = require("../../models/clients/clients.model");
const Employee = require("../../models/employees/employees.model");
const Service = require("../../models/services/services.model");
const ClientService = require("../../models/clients_services/clients_services.model");
const { Sequelize, Op } = require('sequelize');

CTRL.getDashboardStats = async (req, res) => {
  try {
    // Estadísticas básicas
    const [
      totalClients,
      totalEmployees,
      totalServices,
      activeClientServices,
      newClientsThisMonth,
      newEmployeesThisMonth
    ] = await Promise.all([
      // Total de clientes
      Client.count({ where: { is_deleted: 0 } }),
      
      // Total de empleados
      Employee.count({ where: { is_deleted: 0 } }),
      
      // Total de servicios disponibles
      Service.count({ where: { is_active: true } }),
      
      // Servicios de clientes activos
      ClientService.count({ 
        where: { 
          is_deleted: 0,
          statu: true 
        } 
      }),
      
      // Clientes nuevos este mes
      Client.count({
        where: {
          is_deleted: 0,
          createdAt: {
            [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // Empleados nuevos este mes
      Employee.count({
        where: {
          is_deleted: 0,
          createdAt: {
            [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    // Estadísticas de servicios por estado
    const servicesByStatus = await ClientService.findAll({
      attributes: [
        'statu',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { is_deleted: 0 },
      group: ['statu'],
      raw: true
    });

    // Estadísticas de clientes por tipo (si tienen el campo type)
    const clientsByType = await Client.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { 
        is_deleted: 0,
        type: { [Op.not]: null }
      },
      group: ['type'],
      raw: true
    });

    // Últimos 5 clientes registrados
    const recentClients = await Client.findAll({
      where: { is_deleted: 0 },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'first_name', 'last_name', 'email', 'createdAt'],
      raw: true
    });

    // Últimos 5 empleados registrados
    const recentEmployees = await Employee.findAll({
      where: { is_deleted: 0 },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'first_name', 'last_name', 'email', 'createdAt'],
      raw: true
    });

    res.json({
      statusCode: 200,
      data: {
        stats: {
          totalClients,
          totalEmployees,
          totalServices,
          activeClientServices,
          newClientsThisMonth,
          newEmployeesThisMonth
        },
        charts: {
          servicesByStatus: servicesByStatus.map(item => ({
            name: item.statu ? 'Activos' : 'Inactivos',
            value: parseInt(item.count)
          })),
          clientsByType: clientsByType.map(item => ({
            name: item.type || 'Sin tipo',
            value: parseInt(item.count)
          }))
        },
        recent: {
          clients: recentClients,
          employees: recentEmployees
        }
      }
    });

  } catch (error) {
    console.error('Error en dashboard stats:', error);
    res.json({
      statusCode: 500,
      message: "Error al obtener estadísticas del dashboard",
      error: error.message
    });
  }
};

module.exports = CTRL;
