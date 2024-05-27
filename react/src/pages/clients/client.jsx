import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  FaUser,
  FaRegEnvelope,
  FaMapMarkerAlt,
  FaPhoneSquareAlt,
} from 'react-icons/fa'; // Asegúrate de tener react-icons instalado
import { getData, postData, putData, getStorage } from '../../api';
import ToastNotify from '../../components/toaster/toaster';
import Spinner from '../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import Breadcrumbs from '../../components/Breadcrumbs';
import Modal from './modal';
import General from './tabs/general';
import Specific from './tabs/specific';

const Clients = () => {
  const [formData, setFormData] = useState({
    dni: '',
    name: '',
    phone: '',
    email: '',
    born_date: '',
    cod_post_id: 0,
    address: '',
    photo: '',
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
  const [isNewRecord, setIsNewRecord] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const [tableTopPosition, setTableTopPosition] = useState(0);
  const [activeTab, setActiveTab] = useState('general');
  const [action, setAction] = useState('Guardar');
  const [cardData, setCardData] = useState({
    name: '',
    dni: '',
    photo: '',
    address: '',
    email: '',
    phone: '',
  });

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

  // const getRows = async () => {
  //   try {
  //     const response = await getData(
  //       `assets/getCategories?page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
  //     );
  //     const { data, meta } = response;
  //     setRows(data);
  //     setOriginalRows(data);
  //     setTotalPages(meta.totalPages);
  //   } catch (error) {
  //     console.error('Error ', error);
  //   }
  // };

  // useEffect(() => {
  //   getRows();
  // }, [currentPage, pageSize, searchTerm]);

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

  const handleChange = (event) => {
    const { id, value, type, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    const dataToSend = { ...formData };
    try {
      let response = '';
      let bandera = false;
      if (id.current === 0) {
        bandera = await verifyPermisology(
          'can_create_category',
          user,
          'No tiene permiso de crear categoría',
        );
        if (!bandera) {
          return;
        }
        response = await postData('assets/category', dataToSend);
      } else {
        bandera = await verifyPermisology(
          'can_update_category',
          user,
          'No tiene permiso de actualizar categoría',
        );
        if (!bandera) {
          return;
        }
        response = await putData('assets/category/' + id.current, dataToSend);
      }
      ToastNotify({
        message: response.message,
        position: 'top-center',
      });
      getRows();
      closeModal();
    } catch (error) {
      console.error('Error a registrar:', error);
    }
  };

  const handleChangeStatu = async (id, origin) => {
    const bandera = await verifyPermisology(
      'can_change_statu_category',
      user,
      'No tiene permiso de cambiar el estatus',
    );
    if (!bandera) {
      return;
    }
    const response = await putData('assets/category/updateStatu/' + id);
    if (response) {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, statu: !row.statu } : row,
        ),
      );
      ToastNotify({
        message: response.message,
        position: 'top-right',
      });
    }
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
    setCardData((prevCardData) => ({
      ...prevCardData,
      [id]: value,
    }));
  };
  return (
    <div className='max-w-full mx-auto'>
      <Breadcrumbs
        items={[
          { label: 'Inicio', route: '/' },
          { label: 'Clientes', route: '/Clients' },
          !isNewRecord
            ? {
                label: cardData.name ? cardData.name : 'Nuevo',
                route: '',
              }
            : { label: '', route: `/Client/${id}` },
        ]}
      />
      <div className='max-w-full mx-auto bg-content shadow-md sm:rounded-lg border-t-2 border-gray-400 flex min-h-[calc(100vh-110px)]'>
        <div className='w-64 border-r-2 border-gray-200'>
          {/* Contenido del lado izquierdo */}
          <div className='flex relative bg-white border-b-2 border-gray-200 h-40 '>
            <div className='w-10 bg-primary h-full'></div>
            <div className='absolute top-12 left-3 bg-white border-2 border-gray-300 rounded-full'>
              {cardData.photo ? (
                <img
                  src={cardData.photo}
                  alt=''
                  className='h-12 rounded-full'
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                <>
                  <FaUser className='text-gray-300 text-5xl p-2' />
                </>
              )}
            </div>
            <div className='mt-8 ml-8'>
              <label className='font-semibold text-md block uppercase'>
                {cardData.name}
              </label>
              <label className='font-light text-sm block mt-2'>
                {cardData.dni}
              </label>
              <label className='font-light text-sm block '>
                {cardData.fecha}
              </label>
            </div>
          </div>
          <div className='w-full ml-5 flex'>
            <label className='text-primary mt-4 mb-4'>Datos de contacto</label>
          </div>

          <div className='w-full ml-5 flex'>
            <label className='flex'>
              <FaMapMarkerAlt className=' mr-4 mb-4' />
            </label>
            <label className='flex text-xs'>
              {cardData.address || 'Dirección'}
            </label>
          </div>
          <div className='w-full ml-5 flex'>
            <label className='flex'>
              <FaRegEnvelope className=' mr-4 mb-4' />
            </label>
            <label className='flex text-xs'>{cardData.email || 'Email'}</label>
          </div>
          <div className='w-full ml-5 flex'>
            <label className='flex'>
              <FaPhoneSquareAlt className=' mr-4' />
            </label>
            <label className='flex text-xs'>
              {cardData.phone || 'Teléfono'}
            </label>
          </div>
        </div>
        <div className='flex-1'>
          {/* Contenido del lado derecho */}
          <div className='flex justify-between'>
            <div className='flex-1'>
              <div className='mb-4 border-b-2 border-gray-400 p-2'>
                <button
                  className={`tab ml-4 mr-4 pr-4 border-r-2 ${
                    activeTab === 'general' ? 'text-primary' : ''
                  }`}
                  onClick={() => setActiveTab('general')}
                >
                  General
                </button>
                <button
                  className={`tab mr-4 pr-4 border-r-2 ${
                    activeTab === 'especifico' ? 'text-primary' : ''
                  } ${isNewRecord ? 'opacity-25 cursor-not-allowed' : ''}`}
                  onClick={() => setActiveTab('especifico')}
                  disabled={isNewRecord}
                >
                  Especifico
                </button>
                <button
                  className={`tab mr-4 pr-4 border-r-2 ${
                    activeTab === 'servicios' ? 'text-primary' : ''
                  }${isNewRecord ? 'opacity-25 cursor-not-allowed' : ''}`}
                  onClick={() => setActiveTab('servicios')}
                  disabled={isNewRecord}
                >
                  Servicios
                </button>
                <button
                  className={`tab ${
                    activeTab === 'seguimientos' ? 'text-primary' : ''
                  }${isNewRecord ? 'opacity-25 cursor-not-allowed' : ''}`}
                  onClick={() => setActiveTab('seguimientos')}
                  disabled={isNewRecord}
                >
                  Seguimientos
                </button>
              </div>
              <div className='p-2 ml-4'>
                {activeTab === 'general' && (
                  <General
                    onHandleChangeCard={handleChangeCard}
                    id={id}
                    onAction={action}
                    onFormData={formData}
                  />
                )}
                {activeTab === 'especifico' && (
                  <Specific id={id} onFormData={formData} />
                )}
                {activeTab === 'servicios' && 'Servicios'}
                {activeTab === 'seguimientos' && 'Seguimientos'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;
