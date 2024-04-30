import React, { useEffect, useState, useRef } from 'react';
import { show, postWithData, putWithData } from '../../../api';
import ToastNotify from '../../../components/toaster/toaster';
import Spinner from '../../../components/Spinner/Spinner';
import Stepper from '../../../components/stepper/stepper';
import { useUser } from '../../../context/userContext';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../../components/SweetAlert/SweetAlert';
const modalStatu = ({ rowCurrent, handleCloseStatuApproval }) => {
  const { user } = useUser();
  const initialValues = {
    user_id: '',
    provider_id: '',
    company_id: '',
    position_id: '',
    approval_status: '',
    comments: '',
  };
  const [formData, setFormData] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const handleChange = (event) => {
    const { id, value, checked, type } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: newValue,
    }));
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setIsLoading(true);
    const dataToSend = {
      ...formData,
      provider_id: rowCurrent.id,
      user_id: user.id,
      company_id: user.company_id,
      position_id: user.position_id,
    };
    try {
      if (rowCurrent.approval_status === dataToSend.approval_status) {
        InfoSweetAlert({
          title: 'error',
          text: 'Ocurrió un error, seleccione otro estatus para actualizarlo',
          icon: 'error',
        }).infoSweetAlert();
        return;
      }
      let response = '';
      response = await postWithData('providers/historic', dataToSend);
      if (response) {
        const dataProvider = {
          approval_status: dataToSend.approval_status,
        };
        const response2 = await putWithData(
          'providers/' + rowCurrent.id,
          dataProvider,
        );

        ToastNotify({
          message: response.message,
        });
        setFormData(initialValues);
        handleCloseStatuApproval();
      }
    } catch (error) {
      ToastNotify({
        message: 'Ocurrio un error al procesar el registro.',
        position: 'top-right',
      });
      console.error('Error a registrar:', error);
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };
  console.log('id', rowCurrent.id);
  return (
    <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center '>
      <div className='bg-white p-6 rounded shadow-lg w-1/2'>
        <Stepper
          currentStep={1}
          totalSteps={1}
          stepTexts={['Cambiar estatus proveedor']}
        />
        {/* Formulario para el nuevo elemento */}
        <form className='w-full max-w-full p-6 border'>
          <div className='flex items-center mb-4'>
            <div className='w-1/3 text-right mr-2'>
              <label htmlFor='titulo' className='text-gray-700'>
                Estatu:
              </label>
            </div>
            <div className='w-2/4'>
              <select
                id='approval_status'
                name='approval_status'
                onChange={handleChange}
                value={formData.approval_status}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              >
                <option value='0'>Seleccione...</option>
                <option value='Aprobado'>Aprobado</option>
                <option value='Rechazado'>Rechazado</option>
              </select>
            </div>
          </div>
          <div className='flex items-center mb-4'>
            <div className='w-1/3 text-right mr-2'>
              <label htmlFor='titulo' className='text-gray-700'>
                Comentarios:
              </label>
            </div>
            <div className='w-2/4'>
              <textarea
                rows='5'
                name='comments'
                id='comments'
                onChange={handleChange}
                value={formData.comments}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
          </div>
          <div className='flex justify-between mt-10'>
            <button
              className='py-2 px-4 text-sm bg-gray-500 text-white cursor-pointer rounded'
              onClick={handleCloseStatuApproval}
            >
              Cancelar
            </button>
            <button
              type='button'
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
              onClick={handleSubmit}
              disabled={isSaving}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default modalStatu;
