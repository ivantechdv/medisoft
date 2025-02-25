import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';

const FileInput = ({
  label,
  name,
  accept,
  onFileChange,
  fileUrl,
  onDeleteImage,
}) => {
  const [fileName, setFileName] = useState('');

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileChange(event);
    }
  };

  const handleDelete = () => {
    if (fileUrl && onDeleteImage) {
      onDeleteImage(); // Ahora la función ya tiene los valores correctos desde el padre
    }
  };
  return (
    <div className='col-span-1 flex flex-col gap-2'>
      {/* Label arriba */}
      <label className='block text-sm font-medium text-gray-700'>{label}</label>

      {/* Contenedor para selección de archivo y vista previa */}
      <div className='flex items-center gap-2'>
        {/* Botón de selección de archivo */}
        <label
          htmlFor={name}
          className='cursor-pointer p-2 border border-gray-300 text-gray-700 rounded-lg w-full text-center'
        >
          {fileUrl ? 'Cambiar archivo' : 'Seleccionar archivo'}
        </label>

        <input
          type='file'
          accept={accept}
          name={name}
          id={name}
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        {/* Botón de vista previa (Ojo) */}
        {fileUrl && (
          <a
            href={fileUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='p-3 bg-green-500 text-white rounded-lg flex justify-center items-center'
          >
            <FaEye />
          </a>
        )}
      </div>

      {/* Botón de eliminar debajo */}
      {fileUrl && (
        <button
          className='bg-red-600 py-2 w-full text-white rounded-lg'
          onClick={handleDelete}
          type='button'
        >
          Eliminar
        </button>
      )}

      {/* Mostrar el nombre del archivo seleccionado */}
      {fileName && (
        <p className='mt-2 text-sm text-gray-600'>
          Archivo seleccionado: {fileName}
        </p>
      )}
    </div>
  );
};

export default FileInput;
