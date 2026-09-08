import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  FaUser,
  FaRegEnvelope,
  FaMapMarkerAlt,
  FaPhoneSquareAlt,
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight,
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
import { estado_config } from '../../utils/config';
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
    is_active: false,
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
  const [collapsed, setCollapsed] = useState(false);
  const [colorLateral, setColorLateral]=useState("#fff");

  const location = useLocation();
  const { color } = location.state || {};

  console.log("color de estado", color);

  const getRecordById = async (id) => {
    try {
      //setIsLoading(true);
      const response = await getData('employees/' + id);
      console.log('response', response);

      if (response) {
        // Formatear teléfonos al cargar los datos
        const formatPhone = (phone) => {
          if (!phone || typeof phone !== 'string') return phone;
          const cleanNumber = phone.replace(/\D/g, '');
          if (cleanNumber.length === 9) {
            return cleanNumber.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
          }
          return phone;
        };

        const formattedResponse = {
          ...response,
          phone: formatPhone(response.phone),
          phone2: formatPhone(response.phone2),
        };

        setFormData(formattedResponse);
        setCardData(formattedResponse);

         const hasClientServices = response.clients_services?.length > 0;
       setColorLateral(color);

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
    <div className='max-w-full mx-auto relative'>
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
      <div className='max-w-full mx-auto bg-content shadow-md sm:rounded-lg border-t-2 border-gray-400 min-h-[calc(100vh-80px)] flex flex-col'>
        <div className='flex flex-col lg:grid lg:grid-cols-[auto_1fr] flex-1 min-h-0'>
          {/* Sidebar */}
          <div
            className={`relative border-b-2 lg:border-b-0 lg:border-r-2 border-gray-200 transition-all duration-300 ease-in-out shrink-0 ${
              collapsed ? 'w-full lg:w-[50px]' : 'w-full lg:w-[240px]'
            }`}
          >
            {/* Botón flecha */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className='absolute -right-3 top-4 bg-white border border-gray-300 rounded-full p-1 shadow z-10'
            >
              {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>

            {/* Contenido */}
            <div className='w-full border-r-2 border-gray-200 erp-profile-panel'>
              {!collapsed ? (
                <>
                  <div className='flex relative bg-white border-b-2 border-gray-200 h-40'>
                    <div
                      className='w-10 h-full border-l shrink-0'
                      style={{ backgroundColor: colorLateral }}
                    />
                    <div className='absolute top-12 left-2 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center h-12 w-12 overflow-hidden'>
                      {cardData.photo ? (
                        <img
                          src={cardData.photo}
                          alt=''
                          className='h-12 w-12 rounded-full object-cover'
                        />
                      ) : (
                        <FaUser className='text-gray-300 text-3xl' />
                      )}
                    </div>
                    <div className='mt-4 ml-8 min-w-0 pr-2'>
                      <label className='font-semibold text-sm block uppercase truncate'>
                        {cardData.full_name}
                      </label>
                      <label className='font-light text-xs block mt-1 truncate'>
                        {cardData.dni}
                      </label>
                      {cardData.id && (
                        <div className='flex items-center mt-1'>
                          <label className='font-light text-xs block shrink-0'>
                            ID
                          </label>
                          <div className='ml-2 w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center'>
                            <span className='text-sm font-bold'>{cardData.id}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='mt-4 pr-4 pb-4 text-xs'>
                    <div className='w-full ml-2 flex'>
                      <label className='text-primary mb-3 text-sm font-medium'>
                        Datos de contacto
                      </label>
                    </div>
                    <div className='w-full ml-2 flex items-start mb-1.5'>
                      <FaMapMarkerAlt className='mr-2 mt-0.5 shrink-0' />
                      <label className='flex truncate text-wrap leading-snug'>
                        {[cardData.address, cardData.address_num, cardData.address_flat]
                          .filter(Boolean)
                          .join(', ') || 'Dirección'}
                      </label>
                    </div>
                    <div className='w-full ml-2 flex items-center mb-1.5'>
                      <FaMapMarkerAlt className='mr-2 shrink-0' />
                      <label className='flex truncate text-wrap'>
                        {cardData.cod_post}
                      </label>
                    </div>
                    <div className='w-full ml-2 flex items-center mb-1.5'>
                      <FaEnvelope className='mr-2 shrink-0' />
                      <a
                        href={`mailto:${cardData.email}`}
                        className='truncate max-w-xs hover:text-blue-600 transition-colors'
                        title={cardData.email}
                      >
                        {cardData.email || 'Correo'}
                      </a>
                    </div>
                    <div className='w-full ml-2 flex items-center'>
                      <FaPhoneSquareAlt className='mr-2 shrink-0' />
                      <a
                        href={`tel:${cardData.code_phone}${cardData.phone}`}
                        className='truncate max-w-xs hover:text-blue-600 transition-colors'
                        title={`${cardData.code_phone} ${cardData.phone}`}
                      >
                        {`${cardData.code_phone} ${cardData.phone || 'Teléfono'}`}
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <div className='flex flex-col items-center justify-center h-full min-h-[200px] text-xs font-semibold py-4'>
                  <FaUser className='text-gray-400 text-3xl mb-2' />
                  <span className='rotate-180 [writing-mode:vertical-rl] truncate max-h-[160px]'>
                    {cardData.full_name}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className='flex flex-col flex-1 min-w-0 min-h-0'>
            <div className='mb-4 border-b-2 border-gray-400 p-2 overflow-x-auto'>
              <div className='flex flex-nowrap min-w-max'>
              <button
                className={`tab px-4 py-2 whitespace-nowrap border-r-2 border-r-gray-400 ${
                  activeTab === 'general'
                    ? 'text-black font-semibold border-b-2 border-b-orange-600'
                    : ''
                }`}
                onClick={() => handleTabChange('general')}
              >
                General
              </button>
              <button
                className={`tab px-4 py-2 whitespace-nowrap border-r-2 border-r-gray-400 ${
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
                className={`tab px-4 py-2 whitespace-nowrap border-r-2 border-r-gray-400 ${
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
                className={`tab px-4 py-2 whitespace-nowrap border-r-2 border-r-gray-400 ${
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
                className={`tab px-4 py-2 whitespace-nowrap border-r-2 border-r-gray-400 ${
                  activeTab === 'followUps'
                    ? 'text-black font-semibold border-b-2 border-b-orange-600'
                    : ''
                } ${isNewRecord ? ' opacity-25 cursor-not-allowed' : ''}`}
                onClick={() => handleTabChange('followUps')}
                disabled={isNewRecord}
              >
                Seguimientos
              </button>
              </div>
            </div>
            <div className='p-2 sm:p-4 w-full flex-1 overflow-y-auto min-h-0 pb-6'>
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
