export const tipo_config = {
  1: { label: "Cuidador", color: "rgb(100,255,100)" },
  2: { label: "Pendiente", color: "rgb(255,255,100)" },
};

export const estado_config = {
  1: { label: "Activo", color: "rgb(128, 255, 0)" },
  0: { label: "Inactivo", color: "rgb(245, 245, 245) !important" },
  2: { label: "activo 2", color: "rgb(19, 213, 34)" },
};

// Configuración de colores para estados de clientes basada en client_service.status
export const client_estado_config = {
  1: { 
    label: "Activo", 
    color: "rgb(128, 255, 0)", // Verde Intenso - cliente con contrato vigente
    description: "Cliente con contrato activo (client_service.status = 1)"
  },
  0: { 
    label: "Inactivo", 
    color: "rgb(245, 245, 245) !important", // Gris claro - sin contrato activo (visible)
    description: "Cliente sin contrato activo (client_service.status = 0)"
  },
  2: { 
    label: "Anteriormente Activo", 
    color: "rgb(19, 213, 34)", // Verde oscuro - cliente que tuvo contrato anterior
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