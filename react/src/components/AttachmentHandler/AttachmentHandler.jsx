// AttachmentHandler.js

import React, { useEffect, useState } from 'react';
import { deleteAttachment, postAttachment } from '../../api';
import ToastNotify from '../toaster/toaster';

const AttachmentHandler = ({ onFileChange, onFileDelete , deleteUpload = false }) => {

  const [fileUploaded, setFileUploaded] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');



  const uploadFileAndGetUrl = async(file) =>{
        ToastNotify({ message: "Cargando Adjunto", position: 'top-right' });
    try {
      // Subir el archivo al servidor y obtener la URL
      const response = await postAttachment(file, 'image');
      setAttachmentUrl(response.data.STORAGE_ROUTE);
 
      onFileChange(response.data.STORAGE_ROUTE)
      setFileUploaded(true);

    } catch (error) {
      console.error('Error al subir el archivo:', error);
    }
  } 
  const handleFileChange = async (e) => {

    const file = e.target.files[0];
    
    try {
      // Subir el archivo al servidor y obtener la URL
      // Supongamos que handleFileChange devuelve la URL del archivo adjunto
      const attachmentUrl = await uploadFileAndGetUrl(file);

      // Notificar éxito y pasar la URL al componente padre
      ToastNotify({ message: 'Archivo adjunto subido con éxito', position: 'top-right' });
      onFileChange(attachmentUrl);
      setFileUploaded(true);
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      ToastNotify({ message: 'Error al subir el archivo', position: 'top-right' });
    }
  };

  const handleDeleteFile = async () => {
    ToastNotify({ message: 'Eliminando Adjunto', position: 'top-right' });

    try {

      const filename = attachmentUrl.split('/').pop();
      const response = await deleteAttachment(filename, 'image');

      // Verificar si la eliminación fue exitosa
      if (response === 200) {
        onFileDelete();
        setFileUploaded(false);
      } else {
        console.error('Error al eliminar el archivo:', response);
        
        ToastNotify({ message: 'Error al eliminar el archivo', position: 'top-right' });

      }
    } catch (error) {
      console.error('Error al eliminar el archivo:', error);
       
      ToastNotify({ message: 'Error al eliminar el archivo', position: 'top-right' });


    }

  };

  useEffect(()=>{
    if (deleteUpload){
        console.log('emppty')
        setAttachmentUrl('')
        setFileUploaded(false)
      }
  } , [deleteUpload])

  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-600">
        Archivo Adjunto (Opcional):
      </label>
      {!fileUploaded ? (
        <input
          type="file"
          accept=".ppt, .png, .jpeg, .jpg, .pdf, .doc, .docx, .xls, .xlsx"
          onChange={handleFileChange}
          className="  p-2 w-full border rounded-md"
        />
      ) : (
        <div className="flex-1">
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-4 py-2 rounded-md  inline-block"
          >
            Descargar Archivo
          </a>
          <a
            onClick={handleDeleteFile}
            className="bg-red-400 ml-4 text-white px-4 py-2 rounded-md inline-block"
          >
            Eliminar archivo
          </a>
        </div>
      )}
    </div>
  );
};

export default AttachmentHandler;
