import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';

const FileInput = ({ label, name, accept, onFileChange, fileUrl }) => {
  const [fileName, setFileName] = useState('');

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileChange(file);
    }
  };

  return (
    <div className='col-span-1'>
      <div className='flex'>
        <label className='block text-sm font-medium text-gray-700'>
          {label}
        </label>
      </div>
      <div className='flex items-center w-full'>
        <label
          htmlFor={name}
          className='cursor-pointer p-2 border border-gray-300 text-gray-700 rounded-lg mr-2 w-full'
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
        {fileUrl && (
          <a
            href={fileUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='p-2 bg-green-500 text-white rounded-lg'
          >
            <FaEye />
          </a>
        )}
      </div>
      {fileName && (
        <p className='mt-2 text-sm text-gray-600'>
          Archivo seleccionado: {fileName}
        </p>
      )}
    </div>
  );
};

export default FileInput;
