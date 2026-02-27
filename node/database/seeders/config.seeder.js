const sequelize = require("../sequelize");
const Config = require("../models/configs/configs.model");
const Country = require("../models/countries/countries.model");

const seedConfig = async () => {
  try {
    // Buscar España como país por defecto
    const spain = await Country.findOne({ where: { name: 'España' } });
    
    if (!spain) {
      console.log('No se encontró España, creando configuración con país por defecto');
      const defaultCountry = await Country.findOne();
      
      if (defaultCountry) {
        await Config.create({
          phone_mask: '999 99 99 99',
          default_country_id: defaultCountry.id,
          client_config: {
            client_types: ['Particular', 'Empresa', 'Seguro', 'Mutua'],
            languages: ['Español', 'Inglés', 'Francés', 'Alemán']
          },
          caregiver_config: {
            caregiver_types: ['Cuidador interno', 'Cuidador externo', 'Cuidador nocturno'],
            levels: ['Básico', 'Medio', 'Avanzado', 'Especializado'],
            languages: ['Español', 'Inglés', 'Francés', 'Alemán', 'Portugués']
          }
        });
        console.log('Configuración por defecto creada');
      }
    } else {
      await Config.create({
        phone_mask: '999 99 99 99',
        default_country_id: spain.id,
        client_config: {
          client_types: ['Particular', 'Empresa', 'Seguro', 'Mutua'],
          languages: ['Español', 'Inglés', 'Francés', 'Alemán']
        },
        caregiver_config: {
          caregiver_types: ['Cuidador interno', 'Cuidador externo', 'Cuidador nocturno'],
          levels: ['Básico', 'Medio', 'Avanzado', 'Especializado'],
          languages: ['Español', 'Inglés', 'Francés', 'Alemán', 'Portugués']
        }
      });
      console.log('Configuración por defecto creada con España');
    }
  } catch (error) {
    console.error('Error al crear configuración por defecto:', error);
  }
};

module.exports = seedConfig;
