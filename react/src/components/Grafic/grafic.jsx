import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, LinearScale, CategoryScale } from 'chart.js/auto';

// Función para generar colores aleatorios en formato RGBA
const generateRandomColors = (numColors) => {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const color = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
      Math.random() * 256,
    )}, ${Math.floor(Math.random() * 256)}, 2)`;
    colors.push(color);
  }
  return colors;
};

const ChartBar = ({
  labels = [],
  data = [],
  background = [],
  title = '',
  options = {},
}) => {
  // Configuración de los datos del gráfico
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor:
          background.length > 0
            ? background
            : generateRandomColors(labels.length),
      },
    ],
  };

  // Opciones predeterminadas del gráfico
  const defaultOptions = {
    plugins: {
      legend: {
        display: false, // Desactiva la leyenda
      },
    },
    scales: {
      y: {
        suggestedMin: 5,
        suggestedMax: 12,
      },
    },
    maintainAspectRatio: true, // Permite que la gráfica se expanda para llenar el contenedor
    aspectRatio: 1.5, // Establece una relación de aspecto personalizada
    responsive: true, // Permite que la gráfica se redimensione automáticamente
  };

  // Efecto secundario para registrar los controladores de escala necesarios
  React.useEffect(() => {
    Chart.register(LinearScale, CategoryScale);
  }, []);

  // Combinar las opciones predeterminadas con las opciones personalizadas proporcionadas
  const mergedOptions = { ...defaultOptions, ...options };

  return <Bar data={chartData} options={mergedOptions} />;
};

export { ChartBar };
