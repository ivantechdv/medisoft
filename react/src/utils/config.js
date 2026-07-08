export const tipo_config = {
  1: { label: "Cuidador", color: "rgb(100,255,100)" },
  2: { label: "Pendiente", color: "rgb(255,255,100)" },
};

export const estado_config = {
  1: { label: "Activo", color: "rgb(128, 255, 0)" },
  0: { label: "Inactivo", color: "rgb(245, 245, 245)" },
  2: { label: "activo 2", color: "rgb(19, 213, 34)" },
};

// Configuración de colores para estados de clientes basada en client_service.status
export const client_estado_config = {
  1: { 
    label: "Activo", 
    color: "rgb(34, 197, 94)", // Verde visible tipo ERP (como cuidadores)
    description: "Cliente con contrato activo (client_service.status = 1)"
  },
  0: { 
    label: "Inactivo", 
    color: "rgb(241, 245, 249)", // Gris suave para mantener lectura en filas sin servicios
    description: "Cliente sin contrato activo (client_service.status = 0)"
  },
  2: { 
    label: "Anteriormente Activo", 
    color: "rgb(74, 222, 128)", // Verde medio para histórico activo
    description: "Cliente que ha estado activo anteriormente con servicios"
  }
};

// Configuración de colores para tipos de cliente
export const client_tipo_config = {
  "Cliente": { 
    label: "Cliente", 
    color: "rgb(100, 255, 100)", // Verde - cliente regular
    description: "Cliente regular"
  },
  "Posible Cliente": { 
    label: "Posible Cliente", 
    color: "rgb(255, 255, 100)", // Amarillo - posible cliente
    description: "Posible cliente o prospecto"
  }
};