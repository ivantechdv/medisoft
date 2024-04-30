import React, { useState } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export const ConfirmSweetAlert = ({ title, text, icon }) => {
  const [isConfirmed, setIsConfirmed] = useState(null);

  const showSweetAlert = () => {
    return new Promise(async (resolve) => {
      const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Sí',
        reverseButtons: true,
      });

      setIsConfirmed(result.isConfirmed);
      resolve(result.isConfirmed);
    });
  };

  return {
    showSweetAlert,
    isConfirmed,
  };
};

export const InfoSweetAlert = ({ title, text, icon }) => {
  const infoSweetAlert = () => {
    return Swal.fire({
      title,
      text,
      icon,
    });
  };

  return {
    infoSweetAlert,
  };
};
