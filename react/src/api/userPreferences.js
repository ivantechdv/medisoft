import { getData, postData, putData } from './index.js';

export const getUserPreferences = async (entity) => {
  try {
    const response = await getData(`users/preferences?entity=${entity}`);
    // Si la respuesta es un string JSON, parsearlo
    if (typeof response === 'string') {
      return JSON.parse(response);
    }
    return response || {};
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return {};
  }
};

export const saveUserPreferences = async (entity, preferences) => {
  try {
    await postData('users/preferences', { entity, preferences });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
};
