// src/utils/formatUtils.js

// Formatea un número de teléfono usando la máscara configurada dinámicamente
export const formatPhoneNumber = (phone, customMask = null) => {
  if (!phone) return '';
  const cleanNumber = phone.replace(/\D/g, '');

  // Usar máscara personalizada si se proporciona, sino usar localStorage o por defecto
  const phoneMask = customMask || localStorage.getItem('phoneMask') || '999 99 99 99';

  // Aplicar máscara dinámicamente
  return applyMask(cleanNumber, phoneMask);
};

// Aplica una máscara dinámicamente a un número
const applyMask = (number, mask) => {
  // Contar cuántos dígitos (9) hay en la máscara
  const maskDigits = mask.replace(/[^9]/g, '').length;

  // Limitar el número a la cantidad de dígitos de la máscara
  const limitedNumber = number.slice(0, maskDigits);

  let result = '';
  let numberIndex = 0;

  for (let i = 0; i < mask.length && numberIndex < limitedNumber.length; i++) {
    if (mask[i] === '9') {
      result += limitedNumber[numberIndex];
      numberIndex++;
    } else {
      result += mask[i];
    }
  }

  return result;
};

// Función para normalizar teléfono para búsquedas
// Convierte "609 70 70 70" → "609707070" para búsqueda en BD
export const normalizePhoneForSearch = (searchTerm) => {
  if (!searchTerm) return searchTerm;
  
  // Si parece un teléfono (contiene números y espacios), normalizarlo
  const hasDigits = /\d/.test(searchTerm);
  const hasSpaces = /\s/.test(searchTerm);
  
  if (hasDigits && (hasSpaces || searchTerm.length <= 12)) {
    // Es probablemente un teléfono, limpiar espacios y otros caracteres
    return searchTerm.replace(/\D/g, '');
  }
  
  return searchTerm;
};

// Función para cargar la máscara de teléfono desde el backend
export const loadPhoneMask = async () => {
  // Primero verificar si ya hay una máscara guardada
  const savedMask = localStorage.getItem('phoneMask');
  if (savedMask) {
    console.log('Usando máscara guardada en localStorage:', savedMask);
    return savedMask;
  }
  
  try {
    // Importar getData dinámicamente para evitar circular dependencies
    const { getCachedData } = await import('../api');
    
    const response = await getCachedData('configs/phone-mask', 10 * 60 * 1000);
    
    if (response && response.phoneMask) {
      localStorage.setItem('phoneMask', response.phoneMask);
      console.log('Máscara de teléfono cargada desde backend:', response.phoneMask);
      return response.phoneMask;
    }
  } catch (error) {
    console.warn('Error al cargar máscara desde backend, usando máscara por defecto:', error.message);
  }
  
  // Si todo falla, usar y guardar la máscara por defecto
  const defaultMask = '999 99 99 99';
  localStorage.setItem('phoneMask', defaultMask);
  return defaultMask;
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
