import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  FaUser,
  FaRegEnvelope,
  FaMapMarkerAlt,
  FaPhoneSquareAlt,
  FaFileAlt,
  FaEnvelope,
} from 'react-icons/fa'; // Asegúrate de tener react-icons instalado
import { getData, postData, putData, getStorage } from '../../api';
import Spinner from '../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import Breadcrumbs from '../../components/Breadcrumbs';
import Modal from './modal';
import General from './tabs/general';
import Complementary from './tabs/complementary';
import Laboral from './tabs/laboral';
import Specific from './tabs/specific';
import FollowUps from './tabs/followUps';
const Employees = () => {
  const [formData, setFormData] = useState({
    dni: '',
    start_date: '',
    first_name: '',
    last_name: '',
    full_name: '',
    code_phone: '',
    phone: '',
    code_phone2: '',
    phone2: '',
    email: '',
    born_date: '',
    cod_post_id: 0,
    num_social_security: '',
    address: '',
    photo: '',
    dniFront: '',
    dniBack: '',
    is_active: true,
    country_id: '',
    type: '1',
    recommendations: '',
    statu_id: '',
    level_id: '',
    state_id: '',
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [title, setTitle] = useState('');
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLogs, setModalLogs] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const [tableTopPosition, setTableTopPosition] = useState(0);
  const [activeTab, setActiveTab] = useState('general');
  const [action, setAction] = useState('Guardar');
  const [hasChange, setHasChange] = useState(false);
  const [cardData, setCardData] = useState({
    full_name: '',
    dni: '',
    photo: '',
    address: '',
    address_num: '',
    address_flat: '',
    email: '',
    cod_post: '',
    phone: '',
    id: '',
    code_phone: '',
  });
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const getRecordById = async (id) => {
    try {
      //setIsLoading(true);
      const response = await getData('employees/' + id);
      console.log('response', response);

      if (response) {
        setFormData(response);
        setCardData(response);
        if (response.photo !== null && response.photo !== '') {
          setCardData((prevCardData) => ({
            ...prevCardData,
            ['photo']: getStorage(response.photo),
          }));
        }
        setCardData((prevCardData) => ({
          ...prevCardData,
          ['cod_post']:
            response.cod_post?.code +
            ' ' +
            response.cod_post?.name +
            ' ' +
            response.cod_post?.state?.name,
        }));
      }
    } catch (error) {
      console.error('Error al obtener el registro por id:', error);
    } finally {
      // setIsLoading(false);
    }
  };

  useEffect(() => {
    const table = document.querySelector('.table-container');
    if (table) {
      const rect = table.getBoundingClientRect();
      setTableTopPosition(rect.top);
    }
  }, []);

  useEffect(() => {
    if (id) {
      getRecordById(id);
      setAction('Actualizar');
      setIsNewRecord(false);
    } else {
      setAction('Guardar');
      setIsNewRecord(true);
    }
  }, [id]);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const openModal = async (row, sub) => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const renderPagination = () => {
    return (
      <div className='flex justify-center mt-4'>
        <button
          className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <HiChevronDoubleLeft />
        </button>
        <span className='mx-4'>{currentPage}</span>
        <button
          className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <HiChevronDoubleRight />
        </button>
      </div>
    );
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowClick = (rowData, event) => {
    setSelectedRow(rowData);
  };

  const handleClosePanel = () => {
    setSelectedRow(false);
  };

  const handleChangeCard = (id, value) => {
    console.log('id => ', id);
    setCardData((prevCardData) => ({
      ...prevCardData,
      [id]: value,
    }));
  };
  const handleTabChange = (newTab) => {
    if (hasChange) {
      if (window.confirm('Tiene cambios sin guardar, ¿desea continuar?')) {
        setActiveTab(newTab);
        setHasChange(false); // Reset unsaved changes
      }
    } else {
      setActiveTab(newTab);
    }
  };
  const EmailList = ({ emails }) => {
    // Dividir la cadena de correos en un array utilizando ";" como delimitador
    const emailArray = emails.split(';');

    return (
      <div className='w-full ml-5 flex'>
        <label className='flex'>
          <FaRegEnvelope className='mr-4 mb-4' />
        </label>
        <div className='flex flex-col'>
          {emailArray.map((email, index) => (
            <label key={index} className='flex'>
              {email.trim() || 'Email'}
            </label>
          ))}
        </div>
      </div>
    );
  };
  const handleLogs = () => {
    setModalLogs(true);
  };
  const handleHasChange = (value) => {
    setHasChange(value);
  };
  return (
    <div className='max-w-full mx-auto'>
      <Breadcrumbs
        items={[
          { label: 'Inicio', route: '/' },
          { label: 'Cuidadores', route: '/employees' },
          !isNewRecord
            ? {
                label: cardData.full_name ? cardData.full_name : 'Nuevo',
                route: '',
              }
            : { label: '', route: `/employee/${id}` },
        ]}
      />
      <div className='max-w-full mx-auto bg-content shadow-md sm:rounded-lg border-t-2 border-gray-400  min-h-[calc(100vh-110px)]'>
        <div className='grid grid-cols-1 md:grid-cols-4'>
          <div className='col-span-1  border-r-2 border-gray-200 h-full'>
            <div className='grid grid-cols-2 md:grid-cols-1'>
              <div className='col-span-1'>
                <div className='w-full border-r-2 border-gray-200'>
                  {/* Contenido del lado izquierdo */}
                  <div className='flex relative bg-white border-b-2 border-gray-200 h-40'>
                    <div className='w-10 bg-blue-300 h-full border-l'></div>
                    <div className='absolute top-12 left-3 bg-white border-2 border-gray-300 rounded-full'>
                      {cardData.photo ? (
                        <img
                          src={cardData.photo}
                          alt=''
                          className='h-12 w-12 rounded-full'
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <FaUser className='text-gray-300 text-5xl p-2' />
                      )}
                    </div>
                    <div className='mt-8 ml-8'>
                      <label className='font-semibold text-md block uppercase'>
                        {cardData.full_name}
                      </label>
                      <label className='font-light text-sm block mt-2'>
                        {cardData.dni}
                      </label>
                      <label className='font-light text-sm block '>
                        {cardData.fecha}
                      </label>
                      {cardData.id && (
                        <div className='flex items-center'>
                          <label className='font-light text-sm block'>
                            ID CLIENTE
                          </label>
                          {'  '}
                          <div className='ml-4 w-10 h-10 bg-blue-300 rounded-full flex items-center justify-center mr-2'>
                            <span className='text-lg font-bold'>
                              {cardData.id}
                            </span>
                          </div>
                        </div>
                      )}
                      {/* <button type='button' onClick={handleLogs}>
                        <FaFileAlt size={32} />
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-span-1 mt-8 pr-4 text-xs'>
                <div className='w-full ml-5'>
                  <label className='text-primary mt-4 mb-4 mt-12 text-base'>
                    Datos de contacto
                  </label>
                </div>

                <div className='w-full ml-5 flex items-center '>
                  <FaMapMarkerAlt className='mr-2' />
                  <label className='flex truncate text-wrap'>
                    {cardData.address +
                      ', calle ' +
                      cardData.address_num +
                      ' numero ' +
                      cardData.address_flat}
                  </label>
                </div>
                <div className='w-full ml-5 flex items-center'>
                  <FaMapMarkerAlt className='mr-2' />
                  <label className='flex truncate text-wrap'>
                    {cardData.cod_post}
                  </label>
                </div>

                <div className='w-full ml-5 flex items-center'>
                  <FaEnvelope className='mr-2' />
                  <a
                    href={`mailto:${cardData.email}`}
                    className='truncate max-w-xs hover:text-blue-600 transition-colors text-wrap'
                    title={cardData.email} // Mostrar el correo completo en un tooltip
                  >
                    {cardData.email || 'Enviar correo'}
                  </a>
                </div>

                <div className='w-full ml-5 flex items-center'>
                  <FaPhoneSquareAlt className='mr-2' />
                  <a
                    href={`tel:${cardData.code_phone}${cardData.phone}`}
                    className='truncate max-w-xs hover:text-blue-600 transition-colors'
                    title={`${cardData.code_phone} ${cardData.phone}`} // Mostrar el teléfono completo en un tooltip
                  >
                    {`${cardData.code_phone} ${cardData.phone || 'Teléfono'}`}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className='md:col-span-3'>
            {/* Contenido del lado derecho */}
            <div className='mb-4 border-b-2 border-gray-400 p-2'>
              <button
                className={`tab px-4 border-r-2 border-r-gray-400 ${
                  activeTab === 'general'
                    ? 'text-black font-semibold border-b-2 border-b-orange-600'
                    : ''
                }`}
                onClick={() => handleTabChange('general')}
              >
                General
              </button>
              <button
                className={`tab px-4 border-r-2 border-r-gray-400 ${
                  activeTab === 'complementary'
                    ? 'text-black font-semibold border-b-2 border-b-orange-600'
                    : ''
                } ${isNewRecord ? 'opacity-25 cursor-not-allowed' : ''}`}
                onClick={() => handleTabChange('complementary')}
                disabled={isNewRecord}
              >
                Complementario
              </button>
              <button
                className={`tab px-4 border-r-2 border-r-gray-400 ${
                  activeTab === 'laboral'
                    ? 'text-black font-semibold border-b-2 border-b-orange-600'
                    : ''
                } ${isNewRecord ? 'opacity-25 cursor-not-allowed' : ''}`}
                onClick={() => handleTabChange('laboral')}
                disabled={isNewRecord}
              >
                Laboral
              </button>
              <button
                className={`tab px-4 border-r-2 border-r-gray-400 ${
                  activeTab === 'specific'
                    ? 'text-black font-semibold border-b-2 border-b-orange-600'
                    : ''
                } ${isNewRecord ? 'opacity-25 cursor-not-allowed' : ''}`}
                onClick={() => handleTabChange('specific')}
                disabled={isNewRecord}
              >
                Especifico
              </button>
              <button
                className={`tab px-4 border-r-2 border-r-gray-400 ${
                  activeTab === 'followUps'
                    ? 'text-black font-semibold border-b-2 border-b-orange-600'
                    : ''
                } ${isNewRecord ? 'opacity-25 cursor-not-allowed' : ''}`}
                onClick={() => handleTabChange('followUps')}
                disabled={isNewRecord}
              >
                Seguimientos
              </button>
            </div>
            <div className='p-2 w-full overflow-y-auto flex-1 overflow-y-auto h-[80vh]'>
              {activeTab === 'general' && (
                <General
                  onHandleChangeCard={handleChangeCard}
                  id={id}
                  onAction={action}
                  onFormData={formData}
                  onHandleHasChange={handleHasChange}
                  onGetRecordById={getRecordById}
                />
              )}
              {activeTab === 'complementary' && (
                <Complementary
                  employee_id={id}
                  onFormData={formData}
                  onHandleHasChange={handleHasChange}
                />
              )}
              {activeTab === 'laboral' && (
                <Laboral
                  employee_id={id}
                  onFormData={formData}
                  onHandleHasChange={handleHasChange}
                />
              )}
              {activeTab === 'specific' && (
                <Specific
                  employee_id={id}
                  onFormData={formData}
                  onHandleHasChange={handleHasChange}
                />
              )}
              {activeTab === 'followUps' && (
                <FollowUps
                  employee_id={id}
                  onFormData={formData}
                  onHandleHasChange={handleHasChange}
                  onGetRecordById={getRecordById}
                  setUnsavedChanges={setUnsavedChanges}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {modalLogs && <ModalLogs employee_id={id} />}
    </div>
  );
};

export default Employees;
