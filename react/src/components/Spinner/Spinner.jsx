// Spinner.js
import React from 'react';
import './Spinner.css'; // Asegúrate de tener el archivo CSS correspondiente

const Spinner = () => {
  return (
    <div className='spinner-overlay'>
      <div className='spinner'></div>
    </div>
  );
};

export default Spinner;
