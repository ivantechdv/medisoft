import { postData } from '../../api/index';
import { encrypt } from './../crypto/index';

const ChangeLogger = async ({ oldData, newData, user, module, module_id }) => {
  const encryptData = (data, key) => {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      'SecretChangeLogsUnixfyone',
    ).toString();
    return encryptedData;
  };

  // Función para desencriptar los datos
  const decryptData = (encryptedData, key) => {
    const decryptedData = CryptoJS.AES.decrypt(
      encryptedData,
      'SecretChangeLogsUnixfyone',
    ).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  };

  console.log('oldData ', oldData);
  console.log('newData ', newData);
  const compareChanges = () => {
    const changes = {};
    for (const key in oldData) {
      let oldValue = oldData[key];
      let newValue = newData[key];
      // Comparar valores antiguos y nuevos
      if (oldValue !== newValue) {
        changes[key] = { oldValue, newValue };
      }
    }

    return changes;
  };

  //ANTES DE GUARDARLO HAY QUE ENCRIPTAR LA INFORMACION PARA TEMA DE SEGURIDAD.
  const changes = compareChanges();
  console.log('changes', changes);
  try {
    if (Object.keys(changes).length > 0) {
      const dataToSend = {
        user_id: user.id,
        creator_name: encrypt(user.first_name + ' ' + user.last_name),
        creator_company: encrypt(user.company.company),
        creator_department: user.department_id,
        module: module,
        module_id: module_id,
        changes: encrypt(changes),
      };
      await postData('changelogs', dataToSend);
    }
  } catch (error) {
    console.error('Error al guardar los cambios:', error);
    throw error;
  }
};

export default ChangeLogger;
