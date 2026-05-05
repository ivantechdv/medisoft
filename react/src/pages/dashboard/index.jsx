import React, { useState, useEffect } from 'react';
import { getData } from '../../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  FaUsers, 
  FaUserTie, 
  FaConciergeBell, 
  FaChartLine,
  FaUserPlus,
  FaCalendarAlt
} from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getData('dashboard/stats');
      if (response.statusCode === 200) {
        setData(response.data);
      } else {
        setError('Error al cargar datos del dashboard');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Clientes',
      value: data.stats.totalClients,
      icon: <FaUsers className="text-blue-500" />,
      color: 'bg-blue-100',
      change: `+${data.stats.newClientsThisMonth} este mes`
    },
    {
      title: 'Total Empleados',
      value: data.stats.totalEmployees,
      icon: <FaUserTie className="text-green-500" />,
      color: 'bg-green-100',
      change: `+${data.stats.newEmployeesThisMonth} este mes`
    },
    {
      title: 'Servicios Activos',
      value: data.stats.activeClientServices,
      icon: <FaConciergeBell className="text-purple-500" />,
      color: 'bg-purple-100',
      change: 'En curso'
    },
    {
      title: 'Servicios Totales',
      value: data.stats.totalServices,
      icon: <FaChartLine className="text-orange-500" />,
      color: 'bg-orange-100',
      change: 'Disponibles'
    }
  ];

  // Datos para gráfica de servicios por estado
  const servicesStatusData = {
    labels: data.charts.servicesByStatus.map(item => item.name),
    datasets: [
      {
        label: 'Servicios',
        data: data.charts.servicesByStatus.map(item => item.value),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Datos para gráfica de clientes por tipo
  const clientsTypeData = {
    labels: data.charts.clientsByType.map(item => item.name),
    datasets: [
      {
        label: 'Clientes',
        data: data.charts.clientsByType.map(item => item.value),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(147, 51, 234, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(147, 51, 234, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className={`${card.color} rounded-lg p-6 shadow-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.change}</p>
              </div>
              <div className="text-3xl">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de servicios por estado */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Servicios por Estado</h2>
          <div className="h-64">
            <Pie 
              data={servicesStatusData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  title: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Gráfica de clientes por tipo */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Clientes por Tipo</h2>
          <div className="h-64">
            <Bar 
              data={clientsTypeData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Tablas de registros recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clientes recientes */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaUserPlus className="mr-2 text-blue-500" />
            Clientes Recientes
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recent.clients.map((client, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {client.first_name} {client.last_name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">{client.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <FaCalendarAlt className="inline mr-1 text-xs" />
                      {formatDate(client.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empleados recientes */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaUserTie className="mr-2 text-green-500" />
            Empleados Recientes
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recent.employees.map((employee, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {employee.first_name} {employee.last_name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">{employee.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <FaCalendarAlt className="inline mr-1 text-xs" />
                      {formatDate(employee.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
