import React from 'react';
import { formatPhoneNumber } from '../../utils/customFormat';
const FamiliarCard = ({ family, openModalFamily }) => {
  const editFamily = (family) => {
    openModalFamily(family);
  };
  return (
    <div
      className='bg-gray-100 shadow-md rounded-md p-4 h-auto flex flex-col justify-between mb-2'
      onClick={() => editFamily(family)}
    >
      <div>
        <h2 className='text-xl font-semibold text-gray-800'>{family.name}</h2>
        <p className='text-gray-600 mt-2'>{family.email}</p>
        <p className='text-gray-600 mt-1'>{formatPhoneNumber(family.phone)}</p>
      </div>
    </div>
  );
};

export default FamiliarCard;
