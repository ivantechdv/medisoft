import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  FaUser,
  FaRegEnvelope,
  FaMapMarkerAlt,
  FaPhoneSquareAlt,
  FaFileAlt,
  FaClipboardList,
  FaPlusCircle,
} from 'react-icons/fa'; // Asegúrate de tener react-icons instalado
import { getData, postData, putData, getStorage } from '../../api';
import Spinner from '../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import Breadcrumbs from '../../components/Breadcrumbs';
import Modal from './modal';
import General from './tabs/general';
import Specific from './tabs/specific';
import Service from './tabs/services/index';
import ModalLogs from './modalLogs';
import FollowUps from './tabs/followUps';
import Families from '../families';
import FamiliarCard from '../families/view';
const Clients = () => {
  const [formData, setFormData] = useState({
    dni: '',
    first_name: '',
    last_name: '',
    full_name: '',
    phone: '',
    email: '',
    born_date: '',
    cod_post_id: 0,
    address: '',
    photo: '',
    dniFront: '',
    dniBack: '',
    is_active: '',
    type: '',
    recommendations: '',
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
  const [families, setFamilies] = useState([]);
  const [cardData, setCardData] = useState({
    full_name: '',
    dni: '',
    photo: '',
    address: '',
    email: '',
    phone: '',
    id: '',
    code_phone: '',
    cod_post: '',
  });
  const [formDataFamily, setFormDataFamily] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
  });
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [isFamiliesModalOpen, setIsFamiliesModalOpen] = useState(false);

  const getRecordById = async (id) => {
    try {
      //setIsLoading(true);

      const response = await getData('clients/' + id);
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
        setFamilies(response.families);
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
    if (unsavedChanges) {
      if (window.confirm('Tiene cambios sin guardar, ¿desea continuar?')) {
        setActiveTab(newTab);
        setUnsavedChanges(false); // Reset unsaved changes
      }
    } else {
      setActiveTab(newTab);
    }
  };
  const EmailList = ({ emails }) => {
    // Dividir la cadena de correos en un array utilizando ";" como delimitador
    const emailArray = emails.split(';');

    return (
      <>
        <div className='w-full ml-2 flex items-center'>
          <FaRegEnvelope className='mr-2' />
          <label className='flex truncate text-wrap'>
            {emailArray.map((email, index) => (
              <span key={index} className='mr-1'>
                <a
                  href={`mailto:${email.trim()}`}
                  className='truncate max-w-xs hover:text-blue-600 transition-colors text-wrap'
                >
                  {' '}
                  {email.trim()}
                </a>
              </span>
            ))}
          </label>
        </div>
      </>
    );
  };
  const handleLogs = () => {
    setModalLogs(true);
  };
  const openModalFamilies = (family) => {
    console.log('family', family);
    if (family) {
      setFormDataFamily(family);
    } else {
      setFormDataFamily(null);
    }
    setIsFamiliesModalOpen(true);
  };

  const closeModalFamilies = () => {
    setIsFamiliesModalOpen(false);
  };
  const getFamilies = async () => {
    const response = await getData('family/getByClientId?client_id=' + id);
    console.log('response families', response);
    setFamilies(response);
  };
  return (
    <div className='max-w-full mx-auto'>
      <Breadcrumbs
        items={[
          { label: 'Inicio', route: '/' },
          { label: 'Clientes', route: '/Clients' },
          !isNewRecord
            ? {
                label: cardData.full_name ? cardData.full_name : 'Nuevo',
                route: '',
              }
            : { label: '', route: `/Client/${id}` },
        ]}
      />
      <div className='max-w-full mx-auto bg-content shadow-md sm:rounded-lg border-t-2 border-gray-400  min-h-[calc(100vh-110px)]'>
        <div className='grid grid-cols-1 md:grid-cols-5'>
          <div className='col-span-1  border-r-2 border-gray-200 h-full'>
            <div className='w-full border-r-2 border-gray-200 md:h-screen'>
              {/* Contenido del lado izquierdo */}
              <div className='flex relative bg-white border-b-2 border-gray-200 h-36 '>
                <div className='w-10 bg-blue-300  h-full'></div>
                <div className='absolute top-12 left-2 bg-white border-2 border-gray-300 rounded-full'>
                  {cardData.photo ? (
                    <img
                      src={cardData.photo}
                      alt=''
                      className='h-12 w-12 rounded-full'
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <>
                      <FaUser className='text-gray-300 text-5xl p-2' />
                    </>
                  )}
                </div>
                <div className='mt-4 ml-8'>
                  <label className='font-semibold text-md block uppercase'>
                    {cardData.full_name}
                  </label>
                  <label className='font-light text-sm block mt-2'>
                    {cardData.dni}
                  </label>
                  <label className='font-light text-sm block '>
                    {cardData.fecha}
                  </label>
                  {cardData.id && ( // Verifica si cardData.id existe
                    <div className='flex items-center'>
                      <label className='font-light text-sm block'>
                        ID CLIENTE
                      </label>
                      {'  '}
                      <div className='ml-4 w-10 h-10 bg-blue-300  rounded-full flex items-center justify-center mr-2'>
                        <span className='text-lg font-bold'>{cardData.id}</span>{' '}
                        {/* Aplica estilos para hacerlo negrita y grande */}
                      </div>
                    </div>
                  )}
                  {/* <button type='button' onClick={handleLogs}>
                    <FaFileAlt size={32} />
                  </button> */}
                </div>
              </div>
              <div className='col-span-1 mt-4 pr-4 text-xs'>
                <div className='w-full ml-2 flex'>
                  <label className='text-primary mt-4 mb-4  text-base'>
                    Datos de contacto
                  </label>
                </div>

                <div className='w-full ml-2 flex items-center '>
                  <FaMapMarkerAlt className='mr-2' />
                  <label className='flex truncate text-wrap'>
                    {cardData.address || 'Dirección'}
                  </label>
                </div>
                <div className='w-full ml-2 flex items-center'>
                  <FaMapMarkerAlt className='mr-2' />
                  <label className='flex truncate text-wrap'>
                    {cardData.cod_post}
                  </label>
                </div>
                <EmailList emails={cardData.email} />

                <div className='w-full ml-2 flex items-center'>
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
              <div className='col-span-1 mt-8 pr-4 text-xs'>
                <div className='w-full ml-2 flex justify-between'>
                  <label className='text-primary mt-4 mb-4  text-base'>
                    Datos Familiar
                  </label>
                  <label>
                    {' '}
                    <button type='button' onClick={() => openModalFamilies([])}>
                      <FaPlusCircle className='mt-4 flex-start text-lg' />
                    </button>
                  </label>
                </div>
              </div>
              <div className='w-full p-2 mb-2'>
                {families.map((family, index) => (
                  <FamiliarCard
                    key={index} // Asegúrate de usar una clave única, como un ID, si está disponible
                    family={family}
                    openModalFamily={openModalFamilies}
                  />
                ))}
              </div>
              <Families
                isOpen={isFamiliesModalOpen}
                onClose={closeModalFamilies}
                client_id={cardData.id}
                formDataFamily={formDataFamily}
                getFamilies={getFamilies}
              ></Families>
            </div>
          </div>
          <div className='md:col-span-4'>
            {/* Contenido del lado derecho */}
            <div className='mb-4 border-b-2 border-gray-400 p-2'>
              <button
                className={`tab px-4 border-r-2 border-r-gray-400  ${
                  activeTab === 'general'
                    ? 'text-black font-semibold border-b-2 border-b-orange-600'
                    : ''
                }`}
                onClick={() => handleTabChange('general')}
              >
                General
              </button>
              <button
                className={`tab px-4 border-r-2 border-r-gray-400  ${
                  activeTab === 'especifico'
                    ? 'text-black font-semibold border-b-2 border-b-orange-600'
                    : ''
                } ${isNewRecord ? 'opacity-25 cursor-not-allowed' : ''}`}
                onClick={() => handleTabChange('especifico')}
                disabled={isNewRecord}
              >
                Especifico
              </button>
              <button
                className={`tab px-4 border-r-2 border-r-gray-400  ${
                  activeTab === 'servicios'
                    ? 'text-black font-semibold border-b-2 border-b-orange-600'
                    : ''
                }${isNewRecord ? 'opacity-25 cursor-not-allowed' : ''}`}
                onClick={() => handleTabChange('servicios')}
                disabled={isNewRecord}
              >
                Servicios
              </button>
              <button
                className={`tab px-4 border-r-2 border-r-gray-400  ${
                  activeTab === 'seguimientos'
                    ? 'text-black font-semibold border-b-2 border-b-orange-600'
                    : ''
                }${isNewRecord ? 'opacity-25 cursor-not-allowed' : ''}`}
                onClick={() => handleTabChange('seguimientos')}
                disabled={isNewRecord}
              >
                Seguimientos
              </button>
            </div>
            <div className='p-2 w-full'>
              {activeTab === 'general' && (
                <General
                  onHandleChangeCard={handleChangeCard}
                  id={id}
                  onAction={action}
                  onFormData={formData}
                />
              )}
              {activeTab === 'especifico' && (
                <Specific
                  id={id}
                  onFormData={formData}
                  onGetRecordById={getRecordById}
                  setUnsavedChanges={setUnsavedChanges}
                />
              )}
              {activeTab === 'servicios' && (
                <Service
                  id={id}
                  onFormData={formData}
                  onGetRecordById={getRecordById}
                  setUnsavedChanges={setUnsavedChanges}
                />
              )}
              {activeTab === 'seguimientos' && (
                <FollowUps
                  id={id}
                  onFormData={formData}
                  onGetRecordById={getRecordById}
                  setUnsavedChanges={setUnsavedChanges}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {modalLogs && <ModalLogs id={id} />}
    </div>
  );
};

export default Clients;
