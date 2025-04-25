// SweetAlert.jsx
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export const ConfirmSweetAlert = ({ title, text, onConfirm }) => {
  Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    cancelButtonText: 'Cancelar',
    confirmButtonText: 'Sí',
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm();
    }
  });

  return null; // No necesita retornar JSX
};

export const InfoSweetAlert = ({ title, text, icon }) => {
  Swal.fire({
    title,
    text,
    icon,
  });

  return null; // No necesita retornar JSX
};
