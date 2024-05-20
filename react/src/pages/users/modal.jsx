import React, { useState } from 'react';

const Modal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({}); // Aquí puedes inicializar los datos del formulario si es necesario

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const handleSubmit = () => {
    // Aquí puedes realizar las acciones de guardado de datos
    onSave(formData);
    onClose();
  };

  return (
    <div className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="absolute top-0 right-0 transform bg-white p-6 rounded-md h-full shadow-md overflow-auto" style={{ width: 400 }}>
        <h2 className="text-lg font-semibold mb-4">Formulario</h2>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1">Nombre:</label>
          <input type="text" id="name" value={formData.name || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" />
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1">Nombre:</label>
          <input type="text" id="name" value={formData.name || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" />
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1">Nombre:</label>
          <input type="text" id="name" value={formData.name || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" />
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1">Nombre:</label>
          <input type="text" id="name" value={formData.name || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" />
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1">Nombre:</label>
          <input type="text" id="name" value={formData.name || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" />
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1">Nombre:</label>
          <input type="text" id="name" value={formData.name || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" />
        </div><div className="mb-4">
          <label htmlFor="name" className="block mb-1">Nombre:</label>
          <input type="text" id="name" value={formData.name || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" />
        </div><div className="mb-4">
          <label htmlFor="name" className="block mb-1">Nombre:</label>
          <input type="text" id="name" value={formData.name || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" />
        </div><div className="mb-4">
          <label htmlFor="name" className="block mb-1">Nombre:</label>
          <input type="text" id="name" value={formData.name || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" />
        </div><div className="mb-4">
          <label htmlFor="name" className="block mb-1">Nombre:</label>
          <input type="text" id="name" value={formData.name || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" />
        </div><div className="mb-4">
          <label htmlFor="name" className="block mb-1">Nombre:</label>
          <input type="text" id="name" value={formData.name || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 w-full" />
        </div>
        {/* Agrega más campos de formulario según tus necesidades */}
        <div className="flex justify-between">
          <button onClick={onClose} className="mr-2 px-4 py-2 text-white bg-red-500 rounded-md">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-700 rounded-md">Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
