import React from 'react';
import { FaFileUpload, FaEdit, FaAngleRight } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Importa Link desde react-router-dom

const Breadcrumbs = ({ items }) => {
  return (
    <nav aria-label='breadcrumb' className='p-2'>
      <ol className='breadcrumb' style={{ display: 'flex' }}>
        {items.map((item, index) => (
          <li
            key={index}
            className={`breadcrumb-item ${
              index === items.length - 1 ? 'text-breadcrum_active' : ''
            }`}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <React.Fragment>
              {index === 0 ? (
                <Link to={item.route}>{item.label}</Link>
              ) : (
                <>
                  <span className='text-black' style={{ margin: '0 5px' }}>
                    <FaAngleRight />
                  </span>

                  <Link to={item.route}>{item.label}</Link>
                </>
              )}
            </React.Fragment>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
