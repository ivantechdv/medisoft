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

export const formatDateToDMY = (dateStr) => {
  console.log(dateStr);
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};


export function validarNSS(nss) {
  if (!nss || typeof nss !== "string") return false;

  nss = nss.replace(/\D/g, ""); // Eliminar caracteres no numéricos

  // Debe tener 12 dígitos
  if (nss.length !== 12) return false;

  const na = parseInt(nss.substring(0, 2), 10);
  const nb = parseInt(nss.substring(2, 10), 10);
  const nc = parseInt(nss.substring(10, 12), 10);

  if (isNaN(na) || isNaN(nb) || isNaN(nc)) return false;

  // Si el número es menor de 10 millones
  const nd = nb < 10000000 ? nb + na * 10000000 : parseInt(`${na}${nb}`, 10);

  // Cálculo del dígito de control
  const validacion = nd % 97;

  return validacion === nc;
}

export function validarNIE(nie) {
  if (!nie || typeof nie !== "string") return false;

  nie = nie.trim().toUpperCase();
  const letras = [
    "T", "R", "W", "A", "G", "M", "Y", "F", "P",
    "D", "X", "B", "N", "J", "Z", "S", "Q", "V",
    "H", "L", "C", "K", "E"
  ];

  // Debe tener 9 caracteres (8 + letra final)
  if (nie.length !== 9) return false;

  const primeraLetra = nie.charAt(0);
  const letraFinal = nie.charAt(8);

  // Comprobar formato: empieza por X, Y o Z y termina en letra
  if (!["X", "Y", "Z"].includes(primeraLetra) || !/[A-Z]/.test(letraFinal)) {
    return false;
  }

  // Reemplazar X/Y/Z por su número equivalente
  let numeroBase = nie.substring(1, 8);
  if (!/^\d{7}$/.test(numeroBase)) return false; // los 7 del medio deben ser números

  let prefijo;
  if (primeraLetra === "X") prefijo = "0";
  else if (primeraLetra === "Y") prefijo = "1";
  else if (primeraLetra === "Z") prefijo = "2";

  const numeroCompleto = parseInt(prefijo + numeroBase, 10);
  const resto = numeroCompleto % 23;

  return letraFinal === letras[resto];
}
export function validarDNI(dni) {
  if (!dni || typeof dni !== "string") return false;

  const letras = [
    "T", "R", "W", "A", "G", "M", "Y", "F", "P",
    "D", "X", "B", "N", "J", "Z", "S", "Q", "V",
    "H", "L", "C", "K", "E"
  ];

  dni = dni.trim().toUpperCase();

  // Debe tener 9 caracteres: 8 números + 1 letra
  if (dni.length !== 9) return false;

  const numero = dni.slice(0, 8);
  const letra = dni[8];

  // Validar que los primeros 8 sean números
  if (!/^\d{8}$/.test(numero)) return false;

  const resto = parseInt(numero, 10) % 23;
  return letra === letras[resto];
}


export function validarDocumento(value) {
  if (!value || typeof value !== "string") return false;

  const input = value.trim().toUpperCase();

  // ✅ Es válido si cumple con el formato de DNI o NIE
  return validarDNI(input) || validarNIE(input);
}
