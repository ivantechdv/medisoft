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
        <div className='md:grid md:grid-cols-3 gap-4'>
          <div className='col-span-3 md:grid md:grid-cols-3 gap-4'>
            <div className='col-span-1 md:col-span-1'>
              <label
                htmlFor='availability'
                className='block text-sm font-medium text-gray-700'
              >
                Años de experiencia
              </label>
              <select
                name='gender_id'
                id='gender_id'
                className='w-full px-3 mt-1 p-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              >
                <option>Seleccione</option>
              </select>
            </div>
            <div className='col-span-1 md:col-span-1'>
              <label
                htmlFor='availability'
                className='block text-sm font-medium text-gray-700'
              >
                ¿Sabe cocinar?
              </label>
              <select
                name='gender_id'
                id='gender_id'
                className='w-full px-3 mt-1 p-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              >
                <option>Seleccione</option>
              </select>
            </div>
            <div className='col-span-1 md:col-span-3'>
              <label
                htmlFor='availability'
                className='block text-sm font-medium text-gray-700 mb-4'
              >
                Disponibilidad horaria
              </label>

              <div className='col-span-3 md:grid md:grid-cols-3 gap-2'>
                <label
                  htmlFor='internaSemana'
                  className='inline-flex items-center'
                >
                  <input
                    type='checkbox'
                    id='internaSemana'
                    name='internaSemana'
                    checked={''}
                    onChange={''}
                    className='form-checkbox h-5 w-5 text-indigo-600'
                  />
                  <span className='ml-2'>Interna entre semana</span>
                </label>
                <label
                  htmlFor='internaFinSemana'
                  className='inline-flex items-center'
                >
                  <input
                    type='checkbox'
                    id='internaFinSemana'
                    name='internaFinSemana'
                    checked={''}
                    onChange={''}
                    className='form-checkbox h-5 w-5 text-indigo-600'
                  />
                  <span className='ml-2'>Interna fin de semana</span>
                </label>
                <label
                  htmlFor='externaSemana'
                  className='inline-flex items-center'
                >
                  <input
                    type='checkbox'
                    id='externaSemana'
                    name='externaSemana'
                    checked={''}
                    onChange={''}
                    className='form-checkbox h-5 w-5 text-indigo-600'
                  />
                  <span className='ml-2'>Externa entre semana</span>
                </label>
                <label
                  htmlFor='externaFinSemana'
                  className='inline-flex items-center'
                >
                  <input
                    type='checkbox'
                    id='externaFinSemana'
                    name='externaFinSemana'
                    checked={''}
                    onChange={''}
                    className='form-checkbox h-5 w-5 text-indigo-600'
                  />
                  <span className='ml-2'>Externa fin de semana</span>
                </label>
                <label htmlFor='noches' className='inline-flex items-center'>
                  <input
                    type='checkbox'
                    id='noches'
                    name='noches'
                    checked={''}
                    onChange={''}
                    className='form-checkbox h-5 w-5 text-indigo-600'
                  />
                  <span className='ml-2'>Noches</span>
                </label>
              </div>
            </div>
            <div className='col-span-1 md:col-span-3 gap-2'>
              <label
                htmlFor='availability'
                className='block text-sm font-medium text-gray-700 mb-4'
              >
                ¿Permiso de conducir vigente?
              </label>
              <div className='col-span-3 md:grid md:grid-cols-3'>
                <label
                  htmlFor='internaSemana'
                  className='inline-flex items-center'
                >
                  <input
                    type='radio'
                    id='internaSemana'
                    name='internaSemana'
                    checked={''}
                    onChange={''}
                    className='form-checkbox h-5 w-5 text-indigo-600'
                  />
                  <span className='ml-2'>Si</span>
                </label>
                <label
                  htmlFor='internaSemana'
                  className='inline-flex items-center'
                >
                  <input
                    type='radio'
                    id='internaSemana'
                    name='internaSemana'
                    checked={''}
                    onChange={''}
                    className='form-checkbox h-5 w-5 text-indigo-600'
                  />
                  <span className='ml-2'>No</span>
                </label>
              </div>
            </div>
            <div className='col-span-1 md:col-span-3'>
              <label
                htmlFor='availability'
                className='block text-sm font-medium text-gray-700 mb-4'
              >
                ¿Dispone de vehiculo propio?
              </label>
              <div className='col-span-3 md:grid md:grid-cols-3 mb-4'>
                <label
                  htmlFor='internaSemana'
                  className='inline-flex items-center'
                >
                  <input
                    type='radio'
                    id='internaSemana'
                    name='internaSemana'
                    checked={''}
                    onChange={''}
                    className='form-checkbox h-5 w-5 text-indigo-600'
                  />
                  <span className='ml-2'>Si</span>
                </label>
                <label
                  htmlFor='internaSemana'
                  className='inline-flex items-center'
                >
                  <input
                    type='radio'
                    id='internaSemana'
                    name='internaSemana'
                    checked={''}
                    onChange={''}
                    className='form-checkbox h-5 w-5 text-indigo-600'
                  />
                  <span className='ml-2'>No</span>
                </label>
              </div>
              <div className='col-span-1 md:col-span-3 gap-4 mb-4'>
                <label
                  htmlFor='availability'
                  className='block text-sm font-medium text-gray-700 mb-4'
                >
                  Idiomas
                </label>
                <div className='col-span-3 md:grid md:grid-cols-3 gap-2'>
                  <label
                    htmlFor='internaSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='internaSemana'
                      name='internaSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Castellano</span>
                  </label>
                  <label
                    htmlFor='internaFinSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='internaFinSemana'
                      name='internaFinSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Catalán</span>
                  </label>
                  <label
                    htmlFor='externaSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='externaSemana'
                      name='externaSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Frances</span>
                  </label>
                  <label
                    htmlFor='externaFinSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='externaFinSemana'
                      name='externaFinSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Italiano</span>
                  </label>
                  <label htmlFor='noches' className='inline-flex items-center'>
                    <input
                      type='checkbox'
                      id='noches'
                      name='noches'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Alemán</span>
                  </label>
                  <label htmlFor='noches' className='inline-flex items-center'>
                    <input
                      type='checkbox'
                      id='noches'
                      name='noches'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Portugués</span>
                  </label>
                  <label htmlFor='noches' className='inline-flex items-center'>
                    <input
                      type='checkbox'
                      id='noches'
                      name='noches'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Ruso</span>
                  </label>
                </div>
              </div>
              <div className='col-span-1 md:col-span-3 gap-4 mb-4'>
                <label
                  htmlFor='availability'
                  className='block text-sm font-medium text-gray-700 mb-4'
                >
                  ¿Experiencia adquirido?
                </label>
                <div className='col-span-3 md:grid md:grid-cols-3 gap-2'>
                  <label
                    htmlFor='internaSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='internaSemana'
                      name='internaSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Cuidando de un familiar</span>
                  </label>
                  <label
                    htmlFor='internaFinSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='internaFinSemana'
                      name='internaFinSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>En domicilios particulares</span>
                  </label>
                  <label
                    htmlFor='externaSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='externaSemana'
                      name='externaSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>
                      En centros de día, residencias u hospitales
                    </span>
                  </label>
                </div>
              </div>
              <div className='col-span-1 md:col-span-3 gap-4 mb-4'>
                <label
                  htmlFor='availability'
                  className='block text-sm font-medium text-gray-700 mb-4'
                >
                  Formación sanitaria
                </label>
                <div className='col-span-3 md:grid md:grid-cols-3 gap-2'>
                  <label
                    htmlFor='internaSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='internaSemana'
                      name='internaSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>
                      Sin titulación, solo experiencia
                    </span>
                  </label>
                  <label
                    htmlFor='internaFinSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='internaFinSemana'
                      name='internaFinSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Auxiliar de enfermería</span>
                  </label>
                  <label
                    htmlFor='externaSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='externaSemana'
                      name='externaSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>
                      Técnico en cuidados sanitarios en domicilio o
                      instituciones
                    </span>
                  </label>
                  <label
                    htmlFor='externaSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='externaSemana'
                      name='externaSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Gerontóloga</span>
                  </label>
                  <label
                    htmlFor='externaSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='externaSemana'
                      name='externaSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Otra</span>
                  </label>
                </div>
              </div>
              <div className='col-span-1 md:col-span-3 gap-4 mb-4'>
                <label
                  htmlFor='availability'
                  className='block text-sm font-medium text-gray-700 mb-4'
                >
                  Tarea que puede realizar como cuidadora
                </label>
                <div className='col-span-3 md:grid md:grid-cols-3 gap-2'>
                  <label
                    htmlFor='internaSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='internaSemana'
                      name='internaSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Insulina</span>
                  </label>
                  <label
                    htmlFor='internaFinSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='internaFinSemana'
                      name='internaFinSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Auxiliar de enfermería</span>
                  </label>
                  <label
                    htmlFor='externaSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='externaSemana'
                      name='externaSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>
                      Técnico en cuidados sanitarios en domicilio o
                      instituciones
                    </span>
                  </label>
                  <label
                    htmlFor='externaSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='externaSemana'
                      name='externaSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Gerontóloga</span>
                  </label>
                  <label
                    htmlFor='externaSemana'
                    className='inline-flex items-center'
                  >
                    <input
                      type='checkbox'
                      id='externaSemana'
                      name='externaSemana'
                      checked={''}
                      onChange={''}
                      className='form-checkbox h-5 w-5 text-indigo-600'
                    />
                    <span className='ml-2'>Otra</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Form;
