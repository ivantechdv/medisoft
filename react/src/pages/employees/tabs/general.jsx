import React, { useState } from 'react';

const Form = () => {
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    email: '',
    fechaNacimiento: '',
    direccion: '',
  });
  const [images, setImages] = useState([]);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Aquí puedes hacer lo que necesites con los datos del formulario
    console.log(formData);
  };

  return (
    <div className='rounded '>
      <form className='overflow-y-auto '>
        <div className='md:grid md:grid-cols-4 gap-4'>
          <div className='col-span-1'>
            <div className='col-span-1'>
              <div className='h-40 w-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex justify-center items-center'>
                {images.front ? (
                  <>
                    <label htmlFor='front' className='cursor-pointer'>
                      <img
                        src={''}
                        alt='Imagen front'
                        className='h-full  w-full rounded-lg'
                        style={{ objectFit: 'contain' }}
                      />
                      <input
                        type='file'
                        id='front'
                        name='front'
                        accept='image/*'
                        className='hidden'
                        onChange={''}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label htmlFor='front' className='cursor-pointer'>
                      Foto carnet
                      <input
                        type='file'
                        id='front'
                        name='front'
                        accept='image/*'
                        className='hidden'
                        onChange={''}
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className='col-span-3 md:grid md:grid-cols-2 gap-4'>
            <div className='col-span-1'>
              <label
                htmlFor='dni'
                className='block text-sm font-medium text-gray-700'
              >
                DNI
              </label>
              <input
                type='text'
                id='dni'
                name='dni'
                value={formData.dni}
                onChange={handleChange}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='nombre'
                className='block text-sm font-medium text-gray-700'
              >
                Nombre
              </label>
              <input
                type='text'
                id='nombre'
                name='nombre'
                value={formData.nombre}
                onChange={handleChange}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Correo electrónico
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='fechaNacimiento'
                className='block text-sm font-medium text-gray-700'
              >
                Fecha de nacimiento
              </label>
              <input
                type='date'
                id='fechaNacimiento'
                name='fechaNacimiento'
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='fechaNacimiento'
                className='block text-sm font-medium text-gray-700'
              >
                Numero de seguridad social
              </label>
              <input
                type='text'
                id='fechaNacimiento'
                name='fechaNacimiento'
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='fechaNacimiento'
                className='block text-sm font-medium text-gray-700'
              >
                Edad
              </label>
              <input
                type='text'
                id='fechaNacimiento'
                name='fechaNacimiento'
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='gender_id'
                className='block text-sm font-medium text-gray-700'
              >
                Genero
              </label>
              <select
                name='gender_id'
                id='gender_id'
                className='w-full px-3 mt-1 p-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              >
                <option>Seleccione</option>
              </select>
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='education_level'
                className='block text-sm font-medium text-gray-700'
              >
                Nivel de educación
              </label>
              <select
                name='education_level'
                id='education_level'
                className='w-full px-3 mt-1 p-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              >
                <option>Seleccione</option>
              </select>
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='fechaNacimiento'
                className='block text-sm font-medium text-gray-700'
              >
                Adjuntar curriculum vitae
              </label>
              <input
                type='file'
                id='fechaNacimiento'
                name='fechaNacimiento'
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='fechaNacimiento'
                className='block text-sm font-medium text-gray-700'
              >
                Codigo postal
              </label>
              <select
                name='cod_post_id'
                id='cod_post_id'
                className='w-full px-3 mt-1 p-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              >
                <option>Seleccione</option>
              </select>
            </div>
            <div className='col-span-2'>
              <label
                htmlFor='direccion'
                className='block text-sm font-medium text-gray-700'
              >
                Dirección
              </label>
              <textarea
                id='direccion'
                name='direccion'
                rows='3'
                value={formData.direccion}
                onChange={handleChange}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              ></textarea>
            </div>
            <div className='text-center'>
              <button
                type='submit'
                className='bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                onClick={handleSubmit}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Form;
