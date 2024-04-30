import CryptoJS from 'crypto-js';

// Función para encriptar los datos
export const encrypt = (data, key) => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    'SecretChangeLogsUnixfyone',
  ).toString();
  return encryptedData;
};

// Función para desencriptar los datos
export const decrypt = (encryptedData, key) => {
  const decryptedData = CryptoJS.AES.decrypt(
    encryptedData,
    'SecretChangeLogsUnixfyone',
  ).toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedData);
};
