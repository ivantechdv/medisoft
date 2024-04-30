import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '../../../context/userContext';
import Stepper from '../../../components/stepper/stepper';
import ToastNotify from '../../../components/toaster/toaster';
import {
  show,
  postWithData,
  putWithData,
  postAttachment,
  deleteAttachment,
} from '../../../api/index';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useParams, useLocation } from 'react-router-dom';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../../components/SweetAlert/SweetAlert';
import Spinner from '../../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import PdfViewer from '../../../components/PdfViewer/PdfViewer';

const Storage = () => {
  const { id } = useParams(); // Obtiene el parámetro de la URL
  const { user } = useUser();
  const initialValues = {
    url: null,
    title: '',
    company_id: '',
    legal_category_id: '',
    description: '',
    user_id: '',
    has_expiration: false,
    alert_period: null,
    date_expiration: null,
    soft_delete: false,
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Número de usuarios por página
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(initialValues);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [action, setAction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const urlAzureRef = useRef('');
  const srcPreview = useRef('');
  const [showLogs, setShowLogs] = useState(false);
  const [enabledBtnCreate, setEnabledBtnCreate] = useState(false);
  const [enabledBtnUpdate, setEnabledBtnUpdate] = useState(false);
  const [usuario, setUsuario] = useState('');

  const sweetAlert = ConfirmSweetAlert({
    title: action,
    text: '¿Esta seguro que desea procesar el archivo?',
    icon: 'question',
  });
  const [changes, setCanges] = useState([]);
  const [stage, setStage] = useState(0);

  const [isImagen, setIsImagen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalPdf, setIsModalPdf] = useState(false);
  const [fileSrc, setFileSrc] = useState('');

  let viewed = false;
  useEffect(() => {
    const fetchSelect = async () => {
      const com = await show('companies/getCompanies');
      setCompanies(com);
      const cat = await show('legal/getCategories');
      setCategories(cat);
    };

    fetchSelect();
  }, []);

  const handleChange = (event) => {
    const { id, value, checked, type } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: newValue,
    }));
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      url: file, // Guardar la referencia al archivo en el estado
    }));
  };
  const handleQuill = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      description: value,
    }));
  };

  const handleConfirm = async () => {
    if (
      !formData.title ||
      !formData.legal_category_id ||
      !formData.company_id ||
      (action === 'Guardar' && !formData.url)
    ) {
      ToastNotify({
        message: 'Por favor complete todos los campos obligatorios.',
        position: 'top-right',
      });
      return; // Salir de la función si algún campo obligatorio está vacío
    }

    await sweetAlert.showSweetAlert().then((result) => {
      const isConfirmed = result !== null && result;

      // Lógica basada en el resultado
      if (isConfirmed) {
        handleSubmit();
      } else {
        ToastNotify({
          message: 'Acción cancelada por el usuario',
          position: 'top-right',
        });
      }
    });
  };

  const handleSubmit = async () => {
    // Verificar que los campos obligatorios estén presentes

    setIsLoading(true);
    const dataToSend = { ...formData };
    try {
      let response = '';
      if (id) {
        if (formData.url != null) {
          if (urlAzureRef.current != '') {
            const filename = urlAzureRef.current.split('/').pop();
            response = await deleteAttachment(filename, 'legal');
            // Verificar si la eliminación fue exitosa
            if (response !== 200) {
              InfoSweetAlert({
                title: 'error',
                text: 'Ocurrió un error al eliminar el documento anterior',
                icon: 'error',
              }).infoSweetAlert();
            }
          }
          const fileUploadResponse = await postAttachment(
            formData.url,
            'legal',
          );
          dataToSend.url = fileUploadResponse.data.STORAGE_ROUTE;
          urlAzureRef.current = fileUploadResponse.data.STORAGE_ROUTE;
        } else {
          delete dataToSend.url;
        }
        let original = await show('legal/storage/getById/' + id);

        // Comparar los valores originales con los nuevos valores
        const changes = Object.keys(original)
          .map((key) => {
            if (original[key] !== dataToSend[key]) {
              if (dataToSend[key] !== undefined) {
                return {
                  question: key,
                  type: 'update',
                  original: original[key],
                  nuevo: dataToSend[key],
                  user_id: user.id,
                  createdAt: new Date(),
                  storage_id: parseInt(id, 10),
                };
              }
            }
            return null;
          })
          .filter((change) => change !== null);

        changes.forEach((element) => {
          if (
            element.question == 'company_id' ||
            element.question == 'legal_category_id'
          ) {
            if (element.question == 'company_id') {
              let original = companies.filter(
                (array) => array.id == element.original,
              )[0].company;
              let nuevo = companies.filter(
                (array) => array.id == element.nuevo,
              )[0].company;
              element.original = original;
              element.nuevo = nuevo;
            }

            if (element.question == 'legal_category_id') {
              // buscamos si el id es el de subcategoria
              let settedOriginal = false;
              let settedNuevo = false;
              categories.forEach((cat) => {
                if (cat.subcategories.length != 0) {
                  let original = cat.subcategories.filter(
                    (array) => array.id == element.original,
                  );
                  if (original[0]) {
                    element.original = original[0].name;
                    settedOriginal = true;
                  }

                  let nuevo = cat.subcategories.filter(
                    (array) => array.id == element.nuevo,
                  );
                  if (nuevo[0]) {
                    element.nuevo = nuevo[0].name;
                    settedNuevo = true;
                  }
                }
              });

              //si no se ha setteado original o nuevo,
              // significa que el id no pertenece a una subcategoria sino mas bien a una categoria

              if (!settedOriginal) {
                let original = categories.filter(
                  (array) => array.id == element.original,
                )[0].name;
                element.original = original;
              }
              if (!settedNuevo) {
                let nuevo = categories.filter(
                  (array) => array.id == element.nuevo,
                )[0].name;
                element.nuevo = nuevo;
              }
            }
          }
        });

        // Enviar cada cambio por separado
        for (const change of changes) {
          await postWithData('legal/postChangeLog', change);
        }

        response = await putWithData('legal/storage/' + id, dataToSend);

        updateChangeLogs();
        setCurrentPage(1);
        handleClearFile();
      } else {
        const fileUploadResponse = await postAttachment(formData.url, 'legal');
        dataToSend.url = fileUploadResponse.data.STORAGE_ROUTE;
        dataToSend.user_id = user.id;

        response = await postWithData('legal/storage', dataToSend);
        if (response) {
          setFormData(initialValues);
          document.getElementById('url').value = '';
          document.getElementById('title').focus();
        }
      }

      ToastNotify({
        message: response.message,
      });
    } catch (error) {
      ToastNotify({
        message: 'Ocurrio un error al procesar el registro.',
        position: 'top-right',
      });
      console.error('Error a registrar:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleClearFile = () => {
    // Limpiar el campo de tipo file en el estado
    setFormData({
      ...formData,
      url: null,
    });

    // Limpiar también el campo de tipo file input (opcional)
    document.getElementById('url').value = '';
  };
  //*********************** EDITAR ************************

  const getRecordById = async (id) => {
    try {
      const response = await show('legal/storage/getById/' + id);

      if (response) {
        const data = response;
        setFormData({
          ...formData,
          url: null,
          title: data.title || '',
          company_id: data.company_id || '',
          legal_category_id: data.legal_category_id || '',
          description: data.description || '',
          user_id: data.user_id || '',
          has_expiration: data.has_expiration || false,
          date_expiration: data.date_expiration || new Date().toISOString(),
          alert_period: data.alert_period || '',
        });
        urlAzureRef.current = data.url;
        setUsuario(response.user?.first_name + ' ' + response.user?.last_name);
      }
    } catch (error) {
      console.error('Error al obtener el activo por ID:', error);
    }
  };

  const getUserRole = async () => {
    if (user && user.Permisology_legal) {
      if (user.Permisology_legal.can_access_logs) {
        setShowLogs(true);
      }
      if (user.Permisology_legal.can_storage_create) {
        setEnabledBtnCreate(true);
      }
      if (user.Permisology_legal.can_storage_update) {
        setEnabledBtnUpdate(true);
      }
      if (!user.Permisology_legal.can_access_form) {
        window.location.href = '/legal/dashboard';
      }
    }
  };

  const sendVisualizationUpdate = async () => {
    if (viewed == false) {
      viewed = true;

      if (user != null) {
        const array = {
          user_id: user.id,
          question: 'view',
          type: 'view',
          original: 'view',
          nuevo: 'view',
          createdAt: new Date(),
          storage_id: parseInt(id, 10),
        };
        await postWithData('legal/postChangeLog', array);
        updateChangeLogs();
      }
    }
  };

  const updateChangeLogs = async () => {
    const changesList = await show(
      `legal/getChangeLogsByStorageId/${id}?page=${currentPage}&pageSize=${pageSize}&id2=${searchTerm}`,
    );
    const { data, meta } = changesList;

    setCanges(data);
    setTotalPages(meta.totalPages);
  };

  useEffect(() => {
    const getChanges = async (id) => {
      const changes = await show(
        `legal/getChangeLogsByStorageId/${id}?page=${currentPage}&pageSize=${pageSize}&id2=${searchTerm}`,
      );
      const { data, meta } = changes;

      setCanges(data);
      setTotalPages(meta.totalPages);
    };

    if (id) {
      getChanges(id);
    }
  }, [currentPage, pageSize, searchTerm]);

  const location = useLocation();

  useEffect(() => {
    if (user != null) {
      getUserRole();
    }

    if (id) {
      getRecordById(id);
      setAction('Actualizar');
      sendVisualizationUpdate();
    } else {
      setAction('Guardar');
      setUsuario(user?.first_name || '') + ' ' + (user?.last_name || '');
      setFormData(initialValues);
      urlAzureRef.current = '';
      srcPreview.current = '';
      setShowLogs(false);
    }
  }, [user, id]);

  const handleStepClick = (step) => {
    setStage(step - 1);
  };
  const handleViewFile = () => {
    const DocViewer = ['xls', 'xlsx', 'doc', 'docx']; // Lista de extensiones permitidas
    const ImgViewer = ['png', 'jpg', 'jpeg', 'gif', 'svg']; // Lista de extensiones permitidas para imágenes
    const fileExtension = urlAzureRef.current.split('.').pop().toLowerCase();

    if (DocViewer.includes(fileExtension)) {
      const fileTitle = formData.title || 'Documento';
      const fileSrc = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
        urlAzureRef.current,
      )}&action=embedview&wdHideTopBar=1&wdHideCommandBar=1&wdHideHeader=1&wdHideNavigationPane=1`;

      srcPreview.current = fileSrc;
      setIsModalOpen(true);

      // Abre la URL en una nueva pestaña
      //window.open(fileSrc, '_blank');
    } else if (fileExtension == 'pdf') {
      setIsModalPdf(true);
      // Abre la URL en una nueva pestaña
      //window.open(googleDocsViewerSrc, '_blank');
    } else if (ImgViewer.includes(fileExtension)) {
      // Si es una imagen, abre la imagen en una nueva pestaña
      const fileSrc = urlAzureRef.current;

      srcPreview.current = urlAzureRef.current;
      //window.open(fileSrc, '_blank');
      setIsImagen(true);
      setFileSrc(fileSrc);
      setIsModalOpen(true);
    }
  };

  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    return (
      <div className='flex justify-center mt-4'>
        <button
          className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <HiChevronDoubleLeft />
        </button>
        <span className='mx-4'>{currentPage}</span>
        <button
          className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <HiChevronDoubleRight />
        </button>
      </div>
    );
  };

  //*********************** EDITAR ************************

  return (
    <div className='max-w-6xl mx-auto p-6 mt-6 text-sm'>
      <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
        {!showLogs ? (
          <Stepper
            currentStep={1}
            totalSteps={1}
            stepTexts={['Legal Registro']}
          />
        ) : (
          action === 'Actualizar' && (
            <Stepper
              currentStep={stage}
              totalSteps={2}
              onStepClick={handleStepClick}
              stepTexts={['Legal Registro', 'Registro de cambios']}
            />
          )
        )}
        {stage == 0 ? (
          <form className='md:grid md:grid-cols-3 gap-2 p-4 md:pr-16'>
            <div className='items-center mb-1 md:col-span-1'>
              <div className='text-left mr-12 mt-2 md:text-right'>
                <label htmlFor='titulo' className='text-gray-700'>
                  Creado por:
                </label>
              </div>
            </div>
            <div className='flex items-center mb-4 md:col-span-2'>
              <div className='w-full md:w-2/3'>
                <input
                  type='text'
                  id='user_id'
                  name='user_id'
                  value={usuario}
                  readOnly={true}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
            </div>
            <div className='items-center mb-1 md:col-span-1'>
              <div className='text-left mr-12 mt-2 md:text-right'>
                <label htmlFor='empresa' className='text-gray-700'>
                  Empresa: <label className='text-red-500'>•</label>
                </label>
              </div>
            </div>
            <div className='flex items-center mb-4 md:col-span-2'>
              <div className='w-full md:w-2/3'>
                <select
                  id='company_id'
                  name='company_id'
                  className='mt-1 p-1 w-full border rounded-md'
                  onChange={handleChange}
                  value={formData.company_id}
                >
                  <option value=''>Seleccione...</option>
                  {user &&
                    companies.length > 0 &&
                    companies
                      .filter(
                        (company) =>
                          user.Permisology_legal.can_access_list_all_companys ||
                          company.id === user.company_id,
                      )
                      .map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.company}
                        </option>
                      ))}
                </select>
              </div>
            </div>
            <div className='items-center mb-1 md:col-span-1'>
              <div className='text-left mr-12 mt-2 md:text-right'>
                <label htmlFor='titulo' className='text-gray-700'>
                  Título: <label className='text-red-500'>•</label>
                </label>
              </div>
            </div>
            <div className='flex items-center mb-4 md:col-span-2'>
              <div className='w-full md:w-2/3'>
                <input
                  type='text'
                  id='title'
                  name='title'
                  onChange={handleChange}
                  value={formData.title}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
            </div>
            <div className='items-center mb-1 md:col-span-1'>
              <div className='text-left mr-12 mt-2 md:text-right'>
                <label htmlFor='empresa' className='text-gray-700'>
                  Categoría: <label className='text-red-500'>•</label>
                </label>
              </div>
            </div>
            <div className='flex items-center mb-4 md:col-span-2'>
              <div className='w-full md:w-2/3'>
                <select
                  id='legal_category_id'
                  name='legal_category_id'
                  className='mt-1 p-1 w-full border rounded-md'
                  onChange={handleChange}
                  value={formData.legal_category_id}
                >
                  <option value=''>Seleccione...</option>
                  {categories.length > 0 &&
                    categories.map((category) =>
                      category.subcategories.length > 0 ? (
                        <optgroup key={category.id} label={category.name}>
                          {category.subcategories.map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </option>
                          ))}
                        </optgroup>
                      ) : (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ),
                    )}
                </select>
              </div>
            </div>
            <div className='items-center mb-1 md:col-span-1'>
              <div className='text-left mr-12 mt-2 md:text-right'>
                <label htmlFor='archivo' className='text-gray-700'>
                  Archivo: <label className='text-red-500'>•</label>
                </label>
              </div>
            </div>
            <div className='flex items-center mb-4 md:col-span-2'>
              <div className='w-full md:w-2/3'>
                <input
                  type='file'
                  id='url'
                  name='url'
                  onChange={handleFileChange}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
              <div className='w-1/4 ml-2'>
                {urlAzureRef.current != '' && (
                  <div>
                    {/* Agregar un enlace para ver el archivo en otra pestaña */}
                    <button
                      type='button'
                      className='bg-green-500 text-white px-4 py-1 rounded-md'
                      onClick={handleViewFile}
                    >
                      Ver archivo
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className='items-center mb-1 md:col-span-1'>
              <div className='text-left mr-12 mt-2 md:text-right'>
                <label htmlFor='empresa' className='text-gray-700'>
                  ¿Expira?
                </label>
              </div>
            </div>
            <div className='flex items-center mb-4 md:col-span-2 mt-2'>
              <div className='w-full md:w-2/3'>
                <input
                  type='checkbox'
                  name='has_expiration'
                  id='has_expiration'
                  checked={formData.has_expiration}
                  onChange={handleChange}
                  className='mr-2'
                />
                <label htmlFor='has_expiration'>
                  Marque si el documento tiene fecha de expiracion
                </label>
              </div>
            </div>
            {formData.has_expiration && (
              <>
                <div className='items-center mb-1 md:col-span-1'>
                  <div className='text-left mr-12 mt-2 md:text-right'>
                    <label htmlFor='empresa' className='text-gray-700'>
                      Fecha de expiración:
                    </label>
                  </div>
                </div>
                <div className='flex items-center mb-4 md:col-span-2 mt-2'>
                  <div className='w-full md:w-2/3'>
                    <input
                      type='date'
                      id='date_expiration'
                      name='date_expiration'
                      value={formData.date_expiration}
                      onChange={handleChange}
                      className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                    />
                  </div>
                </div>
                <div className='items-center mb-1 md:col-span-1'>
                  <div className='text-left mr-12 mt-2 md:text-right'>
                    <label htmlFor='alertPeriod' className='text-gray-700'>
                      Periodo alertar:
                    </label>
                  </div>
                </div>
                <div className='flex items-center mb-4 md:col-span-2'>
                  <div className='w-full md:w-2/3'>
                    <select
                      id='alert_period'
                      name='alert_period'
                      value={formData.alert_period}
                      onChange={handleChange}
                      className='mt-1 p-1 w-full border rounded-md'
                    >
                      <option value=''>Seleccione...</option>
                      <option value='30'>30 dias</option>
                      <option value='60'>60 dias</option>
                      {/* Agrega más opciones según sea necesario */}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className='items-center mb-1 md:col-span-1'>
              <div className='text-left mr-12 mt-2 md:text-right'>
                <label htmlFor='descripcion' className='text-gray-700'>
                  Descripción:
                </label>
              </div>
            </div>
            <div className='flex items-center mb-4 md:col-span-2'>
              <div className='w-full md:w-2/3'>
                <ReactQuill
                  value={formData.description}
                  onChange={handleQuill}
                  style={{ height: '300px' }}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, 4, 5, 6, false] }],
                      ['bold', 'italic', 'underline', 'link'],
                      [{ align: [] }],
                    ],
                  }}
                />
              </div>
            </div>
            <div className='items-center mb-1 md:col-span-1'>
              <div className='text-left mr-12 mt-2 md:text-right'></div>
            </div>
            <div className='flex items-center  mt-8 md:col-span-2'>
              <div className='w-full md:w-2/3'>
                <label className='text-red-500'>• Campos obligatorios</label>
              </div>
            </div>
            <div className='flex items-center mb-4 md:col-span-3'>
              <div className='w-full'>
                <div className='flex justify-center mt-6 md:ml-20'>
                  <button
                    type='button'
                    onClick={handleConfirm}
                    disabled={!enabledBtnCreate && !enabledBtnUpdate}
                    className={`px-4 py-2 rounded-md focus:outline-none 
              ${
                enabledBtnCreate || enabledBtnUpdate
                  ? 'text-white bg-indigo-500 hover:bg-indigo-600 focus:bg-indigo-600'
                  : 'text-gray-500 bg-gray-200 cursor-not-allowed'
              }`}
                  >
                    {action}
                  </button>
                </div>
              </div>
            </div>
            {isLoading ? <Spinner /> : ''}
          </form>
        ) : (
          <>
            <div className='mb-4 overflow-x-auto  bg-gray-50 p-2'>
              <table className='  w-full bg-white border border-gray-300 '>
                <thead>
                  <tr className='bg-gray-800 text-gray-100'>
                    <th className='border border-gray-300 p-2'>ID</th>
                    <th className='border border-gray-300 p-2'>user</th>
                    <th className='border border-gray-300 p-2'>question</th>
                    <th className='border border-gray-300 p-2'>type</th>
                    <th className='border border-gray-300 p-2'>original</th>
                    <th className='border border-gray-300 p-2'>nuevo</th>
                    <th className='border border-gray-300 p-2'>createdAt</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((change) => (
                    <tr key={change.id}>
                      <td className='border border-gray-300 p-2 text-center'>
                        {change.id}
                      </td>
                      <td className='border border-gray-300 p-2 text-center'>
                        {change.user.first_name} {change.user.last_name}
                      </td>
                      <td className='border border-gray-300 p-2 text-center'>
                        {change.question}
                      </td>
                      <td className='border border-gray-300 p-2 text-center'>
                        {change.type}
                      </td>
                      <td className='border border-gray-300 p-2 text-center'>
                        {change.original}
                      </td>
                      <td className='border border-gray-300 p-2 text-center'>
                        {change.nuevo}
                      </td>
                      <td className='border border-gray-300 p-2 text-center'>
                        {formatDate(change.createdAt)}
                      </td>
                      {/* <td className='border border-gray-300 p-2 flex-center'> 
                                        </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination()}
            </div>
          </>
        )}
      </div>
      {isModalOpen && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center '>
          {isImagen ? (
            <>
              <div className='bg-white p-2 rounded shadow-lg w-1/2'>
                <img
                  alt='imagen'
                  src={srcPreview.current}
                  className='w-full'
                  height='500'
                />
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  className='px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600'
                >
                  Cerrar vista previa
                </button>
              </div>
            </>
          ) : (
            <div className='bg-white p-2 rounded shadow-lg w-full'>
              <iframe
                src={srcPreview.current}
                title='Archivo'
                width='100%'
                height='500'
              ></iframe>
              <button
                type='button'
                onClick={() => setIsModalOpen(false)}
                className='px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600'
              >
                Cerrar vista previa
              </button>
            </div>
          )}
        </div>
      )}
      {isModalPdf && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center '>
          <PdfViewer
            url={urlAzureRef.current}
            onClose={() => setIsModalPdf(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Storage;
