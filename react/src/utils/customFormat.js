// src/utils/formatUtils.js

// Formatea un número de teléfono (Ej: "1234567890" → "123 456 7890")
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{3})(?=\d)/g, '$1 ');
};

export const formatISOToDate = (isoString) => {
  if (!isoString) return ''; // Manejo de valores nulos o indefinidos
  return isoString.split('T')[0]; // Extrae solo la parte de la fecha
};

// Formatea un correo electrónico a minúsculas
export const formatEmail = (email) => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

// Formatea un DNI agregando puntos cada 2 o 3 dígitos (Ej: "12345678" → "12.345.678")
export const formatDNI = (dni) => {
  if (!dni) return '';
  return dni.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Formatea un nombre para que la primera letra de cada palabra esté en mayúscula
export const formatFullName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
