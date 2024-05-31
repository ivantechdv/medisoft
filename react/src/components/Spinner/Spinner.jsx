// Spinner.js
import React from 'react';
import './Spinner.css'; // Asegúrate de tener el archivo CSS correspondiente

const Spinner = () => {
  return (
    <div className='spinner-overlay z-50'>
      <div className='spinner'></div>
    </div>
  );
};

export default Spinner;
