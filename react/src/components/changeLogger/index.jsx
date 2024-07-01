import { postData, getData } from '../../api/index';
import { encrypt } from './../crypto/index';

const ChangeLogger = async ({ oldData, newData, user, module, module_id }) => {
  const compareChanges = () => {
    const changes = {};
    for (const key in oldData) {
      let oldValue = oldData[key];
      let newValue = newData[key];
      // Comparar valores antiguos y nuevos
      if (oldValue !== newValue) {
        changes[key] = { newValue };
      }
    }

    return changes;
  };

  //ANTES DE GUARDARLO HAY QUE ENCRIPTAR LA INFORMACION PARA TEMA DE SEGURIDAD.
  const changes = compareChanges();

  try {
    let user_id = 0;
    let creator_name = '';
    let creator_company = '';
    let creator_department = 0;
    if (user) {
      user_id = user.id;
      creator_name = encrypt(user.first_name + ' ' + user.last_name);
      creator_company = encrypt(user.company.company);
      creator_department = user.department_id;
    }
    console.log('cambios===>', changes);
    if (Object.keys(changes).length > 0) {
      const dataToSend = {
        user_id: user_id,
        creator_name: creator_name,
        creator_company: creator_company,
        creator_department: creator_department,
        module: module,
        module_id: module_id,
        changes: encrypt(changes),
      };

      await postData('eventlogs', dataToSend);
    }
  } catch (error) {
    console.error('Error al guardar los cambios:', error);
    throw error;
  }
};

export default ChangeLogger;
