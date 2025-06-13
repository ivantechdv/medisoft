import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { formatPhoneNumber } from '../../utils/customFormat';

const TooltipPreview = ({ family, position }) => {
  if (!position) return null;

  const style = {
    top: position.top,
    left: position.left,
    position: 'absolute',
    zIndex: 1000,
  };

  return ReactDOM.createPortal(
    <div
      style={style}
      className='bg-white border border-gray-300 shadow-lg rounded-md p-3 w-64'
    >
      <h3 className='font-bold text-gray-800 mb-1'>Vista previa</h3>
      <p>
        <strong>Nombre:</strong> {family.name}
      </p>
      <p>
        <strong>Email:</strong> {family.email}
      </p>
      <p>
        <strong>Teléfono:</strong> {formatPhoneNumber(family.phone)}
      </p>
      {family?.address && (
        <p>
          <strong>Dirección:</strong> {family.address}
        </p>
      )}
    </div>,
    document.body,
  );
};

const FamiliarCard = ({ family, openModalFamily }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [tooltipPos, setTooltipPos] = useState(null);
  const cardRef = useRef(null);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + window.scrollY,
        left: rect.right + 10 + window.scrollX, // Al lado derecho
      });
      setShowPreview(true);
    }
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  const editFamily = () => {
    openModalFamily(family);
  };

  return (
    <>
      <div
        ref={cardRef}
        className='bg-gray-100 shadow-md rounded-md p-2 h-auto flex flex-col justify-between cursor-pointer mb-2'
        onClick={editFamily}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div>
          <h2 className='text-sm font-semibold text-gray-800'>{family.name}</h2>
          <p className='text-gray-600 text-sm'>{family.email}</p>
          <p className='text-gray-600 text-sm'>
            {formatPhoneNumber(family.phone)}
          </p>
        </div>
      </div>

      {showPreview && <TooltipPreview family={family} position={tooltipPos} />}
    </>
  );
};

export default FamiliarCard;
