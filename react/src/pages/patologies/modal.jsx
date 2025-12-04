
import React, { useState, useEffect } from "react";
import Spinner from "../../components/Spinner/Spinner";
import ToastNotify from "../../components/toast/toast";

import { getData, postData, putData } from "../../api";

const Modal = ({ isOpen, onClose, id, row }) => {
  const initialValues = {
    name: "",
    alias: "",
    position: "",
    is_active: true, // cambiado
  };

  const [formData, setFormData] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Validación simple estilo enterprise
  const validate = () => {
    const errors = {};

    if (!formData.name) errors.name = "El nombre es obligatorio";
    if (!formData.alias) errors.alias = "El alias es obligatorio";
    if (formData.position === "")
      errors.position = "La posición es obligatoria";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const toggleActive = () => {
    setFormData((prev) => ({ ...prev, is_active: !prev.is_active })); // cambiado
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);

      const dataToSend = { ...formData };
      let response = false;
      let message = "";

      if (!id) {
        response = await postData("patologies", dataToSend);
        message = "Patología registrada con éxito";
      } else {
        response = await putData("patologies/" + id, dataToSend);
        message = "Patología actualizada con éxito";
      }

      if (response) {
        ToastNotify({
          message,
          position: "top-left",
          type: "success",
        });
        onClose("update");
      }
    } catch (error) {
      ToastNotify({
        message: "Error al procesar el formulario",
        position: "top-left",
        type: "error",
      });
    } finally {
      setIsLoading(false);
      setFormData(initialValues);
    }
  };

  useEffect(() => {
    if (row) setFormData(row);
  }, [row]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50">
      {isLoading && <Spinner />}

      <div
        className="absolute top-1/2 left-1/2 bg-white rounded-xl shadow-lg p-6 transform -translate-x-1/2 -translate-y-1/2"
        style={{ width: 520 }}
      >
        {/* TÍTULO */}
        <div className="grid grid-cols-3">
          <div className="col-span-2 p-4">
            <h2 className="text-2xl font-bold mb-6 text-orange-500">
              Gestión de Patologías
            </h2>
          </div>
          <div className="flex items-center space-x-2 ml-8">
            <span className="text-blue-600 font-semibold">Activo</span>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={formData.is_active} // cambiado
                onChange={toggleActive}
                className="hidden"
              />
              <span
                className={`absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer transition
                ${formData.is_active ? "bg-green-500" : "bg-gray-400"}`} // cambiado
              ></span>
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform
                ${formData.is_active ? "translate-x-6" : "translate-x-0"}`} // cambiado
              />
            </label>
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="grid grid-cols-3 gap-4">
          {/* ID */}
          <div>
            <div className="text-center">
              <div className="text-blue-600 text-lg font-semibold">
                ID Patología
              </div>
              <div className="text-3xl font-bold">{id || "—"}</div>
            </div>
          </div>

          {/* INPUTS */}
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="col-span-2">
                <label className="font-semibold text-blue-600">Nombre</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`border rounded px-3 py-2 w-full ${
                    validationErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Alias */}
              <div>
                <label className="font-semibold text-blue-600">Alias</label>
                <input
                  id="alias"
                  type="text"
                  value={formData.alias}
                  onChange={handleChange}
                  className={`border rounded px-3 py-2 w-full ${
                    validationErrors.alias
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.alias && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.alias}
                  </p>
                )}
              </div>

              {/* Posición */}
              <div>
                <label className="font-semibold text-blue-600">Posición</label>
                <input
                  id="position"
                  type="number"
                  value={formData.position}
                  onChange={handleChange}
                  className={`border rounded px-3 py-2 w-full ${
                    validationErrors.position
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.position && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.position}
                  </p>
                )}
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-lg text-white bg-red-500 hover:bg-red-600 text-lg font-semibold"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                className="px-6 py-3 rounded-lg text-white bg-blue-500 hover:bg-blue-600 text-lg font-semibold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
