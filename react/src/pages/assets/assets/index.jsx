import React, { useState, useEffect, useRef } from 'react';
import {
  show,
  postWithData,
  postAttachment,
  putWithData,
} from '../../../api/index';
import { useNavigate } from 'react-router-dom';
import Stepper from '../../../components/stepper/stepper';
import ToastNotify from '../../../components/toaster/toaster';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../../components/SweetAlert/SweetAlert';
import Spinner from '../../../components/Spinner/Spinner';
import { useParams, useLocation } from 'react-router-dom';
import ChangeLogger from '../../../components/changeLogger';
import { useUser } from '../../../context/userContext';
import { FaPlusCircle, FaEdit, FaMinusCircle } from 'react-icons/fa';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { decrypt } from './../../../components/crypto/index';
import PdfViewer from '../../../components/PdfViewer/PdfViewer';

// Definición del componente DynamicSelect
const DynamicSelect = ({
  element,
  endpoint,
  onHandleChange,
  dinamicData,
  selectedConfig,
  loadOptionsDinamic,
}) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (element.asset_element_id == 0) {
      const fetchOptions = async () => {
        try {
          const response = await show(endpoint); // Realiza una solicitud para obtener las opciones desde el endpoint
          console.log('responseselect ', response);
          setOptions(response); // Actualiza el estado con las opciones obtenidas
        } catch (error) {
          console.error('Error al obtener opciones:', error);
        }
      };

      fetchOptions(); // Llama a la función fetchOptions al montar el componente
    }
  }, [endpoint]); // Ejecuta el efecto cada vez que cambia la URL del endpoint

  useEffect(() => {
    // Verificar si dinamicData['element_id_' + element.id] tiene valor

    if (dinamicData['element_id_' + element.id]) {
      loadOptionsDinamic(element.id, 'dinamico');
    }
  }, [options]);

  return (
    <select
      id={'element_id_' + element.id}
      name={'element_id_' + element.id}
      className='mt-1 p-1 w-full border rounded-md'
      onChange={onHandleChange}
      value={dinamicData['element_id_' + element.id] || ''}
    >
      <option value=''>Seleccione una opción</option>
      {options.length > 0 &&
        options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
    </select>
  );
};

function index(props) {
  const initialValues = {
    asset_config_id: '',
    code: '',
    name: '',
    serial: '',
    company_owner_id: '',
    company_operator_id: '',
    service_line_id: '',
    state_id: '',
    facility_id: '',
    condition: '',
    cost_net: 0,
    cost_reference: 0,
  };
  const { user } = useUser();
  const [companies, setCompanies] = useState([]);
  const [assetCategories, setAssetCategories] = useState([]);
  const [serviceLines, setServiceLines] = useState([]);
  const [facilitiesByState, setFacilitiesByState] = useState([]);
  const [stateByDivisions, setStateByDivisions] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState([]);
  const [formData, setFormData] = useState(initialValues);
  const [dinamicData, setDinamicData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState('Guardar');
  const [assetElementDetails, setAssetElementDetails] = useState([]);
  const { id } = useParams(); // Obtiene el parámetro de la URL
  const [changelogs, setChangelogs] = useState([]);
  const [oldData, setOldData] = useState({});
  const [newData, setNewData] = useState({});
  const navigateTo = useNavigate();
  const [stage, setStage] = useState(0);
  const [viewLogs, setViewLogs] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [expandedCategoryId, setExpandedCategoryId] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
  const [modalDocument, setModalDocument] = useState(false);
  const [modalImage, setModalImage] = useState(false);

  const urlFile = useRef('');
  const sweetAlert = ConfirmSweetAlert({
    title: action,
    text: '¿Esta seguro que desea procesar el activo?',
    icon: 'question',
  });

  const getRecordById = async (id) => {
    try {
      setIsLoading(true);
      const response = await show('assets/' + id);
      const changelogs = await show(
        `changelogs/assets/${id}?page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
      );

      const { data, meta } = changelogs;
      setChangelogs(data);
      console.log('changelogs', changelogs);

      if (response) {
        setAssetElementDetails(response.asset_element_details);
        const data = response;
        const formAux = {
          ...formData,
          asset_config_id: data.asset_config_id || '',
          code: data.code || '',
          name: data.name || '',
          serial: data.serial || '',
          company_owner_id: data.company_owner_id || '',
          company_operator_id: data.company_operator_id || '',
          service_line_id: data.service_line_id || '',
          state_id: data.state_id || '',
          facility_id: data.facility_id || '',
          condition: data.condition || '',
          cost_net: data.cost_net || 0,
          cost_reference: data.cost_reference || 0,
        };
        setFormData(formAux);
        const assetElementDetailsData = response.asset_element_details.reduce(
          (acc, element) => {
            acc['element_id_' + element.asset_element_id] = element.value;
            return acc;
          },
          {},
        );
        setOldData({ ...formAux, ...assetElementDetailsData });
      }
    } catch (error) {
      console.error('Error al obtener el activo por ID:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (id) {
      getRecordById(id);
      setAction('Actualizar Activo');
    } else {
      setAction('Guardar Activo');
      // setUsuario(user?.first_name || '') + ' ' + (user?.last_name || '');
      setFormData(initialValues);
    }
  }, [id]);

  useEffect(() => {
    if (configs.length > 0 && assetElementDetails.length > 0) {
      const selectedConfig = configs.find(
        (config) => config.id === Number(formData.asset_config_id),
      );

      console.log('selectconfig', selectedConfig);
      setSelectedConfig(selectedConfig);

      const initialDinamicData = {};
      assetElementDetails.forEach((detail) => {
        initialDinamicData[`element_id_${detail.asset_element_id}`] =
          detail.value;
      });

      setDinamicData(initialDinamicData);
    }
  }, [configs, assetElementDetails]);

  useEffect(() => {
    const fetchSelect = async () => {
      const com = await show('companies/getCompanies');
      setCompanies(com);
      const cat = await show('assets/getCategories');
      setAssetCategories(cat);
      const sl = await show('service_lines');
      setServiceLines(sl);
      const sd = await show('states/by-divisions');
      setStateByDivisions(sd);
      const cf = await show('assets/getAllConfigs');
      setConfigs(cf);
    };

    fetchSelect();
  }, []);
  useEffect(() => {
    console.log('valor ', formData.state_id);

    if (formData.state_id != '') {
      const loadFacility = async () => {
        const fa = await show('facilities/getByState/' + formData.state_id);
        setFacilitiesByState(fa);
      };
      loadFacility();
    }
  }, [formData.state_id]);

  const handleChange = async (event) => {
    const { id, value, type, checked, element } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
    if (id === 'asset_config_id') {
      const selectedConfig = configs.find(
        (config) => config.id === Number(value),
      );
      setSelectedConfig(selectedConfig);
    }
  };
  const handleDinamicChange = async (event) => {
    console.log('aa');
    const { id, value, type, checked, element } = event.target;

    setDinamicData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
    if (type === 'select-one' && id.startsWith('element_id_')) {
      const element_id = +id.split('_').pop();
      loadOptionsDinamic(element_id, 'select');
      // Verificar si el select actual tiene una dependencia con otro select
    }
  };

  const loadOptionsDinamic = async (element_id, origen, value) => {
    const dependentElement = selectedConfig.asset_config_elements.find(
      (element) => {
        return element.asset_element.asset_element_id == element_id;
      },
    );
    if (
      dependentElement &&
      dependentElement.asset_element.asset_element_id == element_id
    ) {
      const dependentSelect = document.getElementById(
        'element_id_' + dependentElement.asset_element.id,
      );
      console.log('dependentElement', dependentElement.asset_element_id);

      if (origen == 'select') {
        setDinamicData((prevFormData) => ({
          ...prevFormData,
          ['element_id_' + dependentElement.asset_element.id]: 0,
        }));
      }
      console.log('dependentSelect', dependentSelect);
      if (dependentSelect) {
        const valueParent = document.getElementById(
          'element_id_' + element_id,
        ).value;
        console.log('valor select  para endpoint', valueParent);
        // Cargar las opciones del select dependiente basado en el valor seleccionado

        if (valueParent > 0) {
          const endpoint =
            dependentElement.asset_element.endpoint + '/' + valueParent;
          // Cargar las opciones del select dependiente basado en el valor seleccionado del select id_1
          const options = await show(endpoint);
          console.log('options', options);

          // Limpiar las opciones actuales del select id_2
          dependentSelect.innerHTML = '';

          // Agregar la opción por defecto al select id_2
          dependentSelect.appendChild(new Option('Seleccione una opción', 0));

          if (options && options.length > 0) {
            // Agregar las nuevas opciones al select id_2
            options.forEach((option) => {
              dependentSelect.appendChild(new Option(option.name, option.id));
            });
            dependentSelect.value =
              dinamicData['element_id_' + dependentElement.asset_element.id] ||
              0;
          }
        }
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    setDinamicData((prevFormData) => ({
      ...prevFormData,
      [event.target.id]: file, // Guardar la referencia al archivo en el estado
    }));
  };
  const handleConfirm = async (e) => {
    e.preventDefault();
    // if (
    //   !formData.asset_config_id ||
    //   !formData.code ||
    //   !formData.name ||
    //   !formData.serial ||
    //   !formData.company_operator_id ||
    //   !formData.company_owner_id ||
    //   !formData.service_line_id ||
    //   !formData.state_id ||
    //   !formData.facility_id ||
    //   !formData.condition ||
    //   (action === 'Guardar' && !formData.url)
    // ) {
    //   ToastNotify({
    //     message: 'Por favor complete todos los campos obligatorios.',
    //     position: 'top-right',
    //   });
    //   return; // Salir de la función si algún campo obligatorio está vacío
    // }

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

  function changeValueSelect(data) {
    const newData = { ...data };
    for (const key in data) {
      const selectField = document.getElementById(key);
      if (selectField && selectField.tagName.toLowerCase() === 'select') {
        const matchedOption = Array.from(selectField.options).find(
          (option) => option.value == data[key],
        );
        if (matchedOption) {
          newData[key] = matchedOption.text;
        }
      }
    }
    return newData;
  }

  const handleSubmit = async () => {
    const previousData = changeValueSelect(oldData);
    const combinedData = {
      ...formData,
      ...dinamicData,
    };
    const currentData = changeValueSelect(combinedData);

    setIsLoading(true);
    const dataToSend = { ...formData };
    try {
      let response = '';
      let asset_id = '';
      if (!id) {
        response = await postWithData('assets', dataToSend);
        asset_id = response.id;
      } else {
        response = await putWithData('assets/' + id, dataToSend);
        asset_id = response.id;
        await ChangeLogger({
          oldData: previousData,
          newData: currentData,
          user: user,
          module: 'assets',
          module_id: asset_id,
        });
      }

      const dataDinamicSend = [];
      for (const [key, value] of Object.entries(dinamicData)) {
        const isFile = value instanceof File;
        if (isFile) {
          const fileUploadResponse = await postAttachment(value, 'assets');
          dataDinamicSend.push({
            asset_id: asset_id,
            asset_element_id: key.split('_').pop(),
            value: fileUploadResponse.data.STORAGE_ROUTE,
          });
        } else {
          dataDinamicSend.push({
            asset_id: asset_id,
            asset_element_id: key.split('_').pop(),
            value: value,
          });
        }
      }

      let response2 = await postWithData(
        'assets/asset-element-detail',
        dataDinamicSend,
      );

      ToastNotify({
        message: response.message + ' y ' + response2.message,
      });

      // Limpiar los campos dinámicos después de enviar el formulario
      setDinamicData({});

      // Reiniciar la configuración seleccionada a null
      setSelectedConfig(null);

      // Reiniciar los valores del formulario a los valores iniciales
      setFormData(initialValues);
      navigateTo('/assets/all');
    } catch (error) {
      ToastNotify({
        message: 'Ocurrió un error al procesar el registro.',
        position: 'top-right',
      });
      console.error('Error al enviar la solicitud:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDynamicInputs = () => {
    if (!selectedConfig || !selectedConfig.asset_config_elements) return null;

    const groupedElements = selectedConfig.asset_config_elements.reduce(
      (acc, configElement) => {
        const { asset_element } = configElement;
        const groupKey = asset_element.asset_group_element.name;
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(asset_element);
        return acc;
      },
      {},
    );
    const groupKeys = Object.keys(groupedElements);

    // Ordenar el array de claves en función del ID de los elementos
    groupKeys.sort((a, b) => {
      const idA = groupedElements[a][0].asset_element_id;
      const idB = groupedElements[b][0].asset_element_id;
      return idA - idB;
    });

    // Construir un nuevo objeto ordenado
    const sortedGroupedElements = groupKeys.reduce((acc, key) => {
      acc[key] = groupedElements[key];
      return acc;
    }, {});

    // Ordenar los elementos de cada grupo por el ID
    for (const groupKey in sortedGroupedElements) {
      if (sortedGroupedElements.hasOwnProperty(groupKey)) {
        sortedGroupedElements[groupKey].sort((a, b) => {
          console.log('Elemento a:', a.id);
          console.log('Elemento b:', b.id);
          return a.id - b.id;
        });
      }
    }

    return Object.entries(groupedElements).map(([groupName, elements]) => {
      const inputElements = elements.filter(
        (element) => element.type !== 'textarea',
      );
      const textAreaElements = elements.filter(
        (element) => element.type === 'textarea',
      );

      return (
        <div key={groupName}>
          <div className='grid grid-cols-1 sm:grid-cols-1 mt-2'>
            <label className='bg-gray-900 p-1 text-white w-full'>
              {groupName}
            </label>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2'>
            {/* Renderizar elementos de entrada */}
            {inputElements.map((element) => (
              <div key={element.id}>
                <label className='block text-sm font-medium text-gray-700'>
                  {element.name}
                </label>
                {element.type === 'image' || element.type === 'document' ? (
                  <div className='flex'>
                    <input
                      type='file'
                      id={'element_id_' + element.id}
                      name={'element_id_' + element.id}
                      accept={element.type === 'image' ? 'image/*' : '.pdf'}
                      className='mt-1 p-1 w-full border rounded-md flex'
                      onChange={handleFileChange}
                    />
                    {dinamicData['element_id_' + element.id] && (
                      <button
                        type='button'
                        onClick={() =>
                          handleViewFile(
                            dinamicData['element_id_' + element.id],
                          )
                        }
                        className='mt-2 px-4 py-2 bg-blue-500 text-white rounded-md flex'
                      >
                        Ver
                      </button>
                    )}
                  </div>
                ) : element.type === 'select' ? (
                  <DynamicSelect
                    element={element}
                    endpoint={element.endpoint}
                    onHandleChange={handleDinamicChange}
                    dinamicData={dinamicData}
                    selectedConfig={selectedConfig}
                    loadOptionsDinamic={loadOptionsDinamic}
                  />
                ) : (
                  <input
                    id={'element_id_' + element.id}
                    name={'element_id_' + element.id}
                    type={element.type}
                    className='mt-1 p-1 w-full border rounded-md'
                    value={dinamicData['element_id_' + element.id] || ''}
                    onChange={handleDinamicChange}
                  />
                )}
              </div>
            ))}
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-1 gap-2 mt-2'>
            {/* Renderizar elementos de tipo "Textarea" */}
            {textAreaElements.map((element) => (
              <div key={element.id}>
                <label className='block text-sm font-medium text-gray-700'>
                  {element.name}
                </label>
                <textarea
                  id={'element_id_' + element.id}
                  name={'element_id_' + element.id}
                  className='mt-1 p-1 w-full border rounded-md'
                  value={dinamicData['element_id_' + element.id]}
                  onChange={handleDinamicChange}
                />
              </div>
            ))}
            {/* Renderizar elementos de tipo "Texto Enriquecido" */}
          </div>
        </div>
      );
    });
  };
  const handleStepClick = (step) => {
    setStage(step - 1);
  };
  const handleExpand = (categoryId) => {
    setExpandedCategoryId((prevId) =>
      prevId === categoryId ? null : categoryId,
    );

    // Actualiza el estado de filas expandidas
    setExpandedRows((prevRows) =>
      prevRows.includes(categoryId)
        ? prevRows.filter((rowId) => rowId !== categoryId)
        : [...prevRows, categoryId],
    );
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

  const searchElement = (element) => {
    console.log('slectedconfig', selectedConfig);

    if (element.startsWith('element_id_')) {
      const id = element.split('_').pop();
      const elementName = selectedConfig.asset_config_elements
        .filter((configElement) => configElement.asset_element.id == id)
        .map((configElement) => configElement.asset_element.name);

      return elementName;
    }

    return element;
  };

  const handleViewFile = (url) => {
    const ImgViewer = ['png', 'jpg', 'jpeg', 'gif', 'svg']; // Lista de extensiones permitidas para imágenes
    urlFile.current = url;
    const fileExtension = url.split('.').pop().toLowerCase();
    if (fileExtension == 'pdf') {
      setModalDocument(true);

      // Abre la URL en una nueva pestaña
      //window.open(googleDocsViewerSrc, '_blank');
    } else if (ImgViewer.includes(fileExtension)) {
      //window.open(fileSrc, '_blank');
      setModalImage(true);
    }
  };
  return (
    <div className='max-w-6xl mx-auto p-6'>
      <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
        <Stepper
          currentStep={stage}
          totalSteps={2}
          onStepClick={handleStepClick}
          stepTexts={['Crear Activos', 'Cambios realizados']}
        />
        {stage == 0 ? (
          <form
            className='w-full max-w-full p-6 border'
            onSubmit={handleConfirm}
          >
            <div className='flex gap-6'>
              <div className='flex flex-shrink'>
                <label
                  className='block text-sm font-medium text-gray-700 mt-2'
                  htmlFor='activo'
                >
                  Activo Configurado <label className='text-red-500'>•</label>
                </label>
              </div>

              <div className='flex flex-grow'>
                <select
                  id='asset_config_id'
                  name='asset_config_id'
                  className='w-full  border rounded-lg py-1 px-1 focus:outline-none focus:border-blue-500 text-gray-600 mb-2 lg:mb-0 mr-0 lg:mr-4'
                  onChange={handleChange}
                  value={formData.asset_config_id}
                >
                  <option value='0'>Seleccione activo</option>
                  {configs.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-1 mt-2'>
              <label className='bg-gray-900 p-1 text-white w-full'>
                Información Principal
              </label>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2'>
              {/* Columna 1 */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Código <label className='text-red-500'>•</label>
                </label>
                <input
                  type='text'
                  name='code'
                  id='code'
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  value={formData.code}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700'
                >
                  Nombre <label className='text-red-500'>•</label>
                </label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  className='mt-1 p-1 w-full border rounded-md'
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700'
                >
                  Serial <label className='text-red-500'>•</label>
                </label>
                <input
                  type='text'
                  id='serial'
                  name='serial'
                  className='mt-1 p-1 w-full border rounded-md'
                  value={formData.serial}
                  onChange={handleChange}
                />
              </div>
              <div className='col-span-1'>
                <label
                  htmlFor='company_owner_id'
                  className='block text-sm font-medium text-gray-700'
                >
                  Empresa Propietaria <label className='text-red-500'>•</label>
                </label>
                <select
                  id='company_owner_id'
                  name='company_owner_id'
                  className='mt-1 p-1 w-full border rounded-md'
                  value={formData.company_owner_id}
                  onChange={handleChange}
                >
                  <option value=''>Seleccione...</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.company}
                    </option>
                  ))}
                </select>
              </div>

              <div className='col-span-1'>
                <label
                  htmlFor='company_operator_id'
                  className='block text-sm font-medium text-gray-700'
                >
                  Empresa Operadora <label className='text-red-500'>•</label>
                </label>
                <select
                  id='company_operator_id'
                  name='company_operator_id'
                  className='mt-1 p-1 w-full border rounded-md'
                  value={formData.company_operator_id}
                  onChange={handleChange}
                >
                  <option value=''>Seleccione...</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.company}
                    </option>
                  ))}
                </select>
              </div>
              <div className='col-span-1'>
                <label
                  htmlFor='service_line_id'
                  className='block text-sm font-medium text-gray-700'
                >
                  Linea de Servicio <label className='text-red-500'>•</label>
                </label>
                <select
                  id='service_line_id'
                  name='service_line_id'
                  className='mt-1 p-1 w-full border rounded-md'
                  value={formData.service_line_id}
                  onChange={handleChange}
                >
                  <option value=''>Seleccione...</option>
                  {serviceLines.map((serviceLine) => (
                    <option key={serviceLine.id} value={serviceLine.id}>
                      {serviceLine.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='col-span-1'>
                <label
                  htmlFor='state_id'
                  className='block text-sm font-medium text-gray-700'
                >
                  Division/Region <label className='text-red-500'>•</label>
                </label>
                <select
                  id='state_id'
                  name='state_id'
                  className='mt-1 p-1 w-full border rounded-md'
                  value={formData.state_id}
                  onChange={handleChange}
                >
                  <option value=''>Seleccione...</option>
                  {stateByDivisions.map((division) => (
                    <optgroup key={division.id} label={division.division}>
                      {division.states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.state}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className='col-span-1'>
                <label
                  htmlFor='facility_id'
                  className='block text-sm font-medium text-gray-700'
                >
                  Facilidad <label className='text-red-500'>•</label>
                </label>
                <select
                  id='facility_id'
                  name='facility_id'
                  className='mt-1 p-1 w-full border rounded-md'
                  value={formData.facility_id}
                  onChange={handleChange}
                >
                  <option value=''>Seleccione...</option>
                  {facilitiesByState &&
                    facilitiesByState.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className='col-span-1'>
                <label
                  htmlFor='condition'
                  className='block text-sm font-medium text-gray-700'
                >
                  Estado del activo <label className='text-red-500'>•</label>
                </label>
                <select
                  id='condition'
                  name='condition'
                  className='mt-1 p-1 w-full border rounded-md'
                  value={formData.condition}
                  onChange={handleChange}
                >
                  <option value=''>Seleccione</option>
                  <option value='Operativo'>Operativo</option>
                  <option value='No Operativo'>No Operativo</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor='cost_net'
                  className='block text-sm font-medium text-gray-700'
                >
                  Costo historico neto contable
                </label>
                <input
                  type='number'
                  id='cost_net'
                  name='cost_net'
                  className='mt-1 p-1 w-full border rounded-md'
                  value={formData.cost_net}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor='cost_reference'
                  className='block text-sm font-medium text-gray-700'
                >
                  Costo referencial del mercado
                </label>
                <input
                  type='number'
                  id='cost_reference'
                  name='cost_reference'
                  className='mt-1 p-1 w-full border rounded-md'
                  value={formData.cost_reference}
                  onChange={handleChange}
                />
              </div>
            </div>

            {renderDynamicInputs()}
            <div className='flex justify-end bg-white border rounded shadow p-4'>
              <button
                type='submit'
                className='bg-blue-500 text-white py-2 px-4 rounded'
              >
                {action}
              </button>
            </div>
            {isLoading ? <Spinner /> : ''}
          </form>
        ) : (
          <>
            <div className='mb-2 overflow-x-auto  bg-gray-50 p-2'>
              <table className='w-full bg-white border border-gray-300 text-sm'>
                <thead>
                  <tr className='bg-gray-800 text-gray-100'>
                    <th className='border border-gray-300 text-center'>
                      <div className='flex items-center justify-center'>
                        <FaPlusCircle
                          className='cursor-pointer mr-2 transition duration-300 ease-in-out transform hover:text-blue-700 hover:scale-110'
                          title='Permite Expandir'
                        />
                      </div>
                    </th>
                    <th className='border border-gray-300 p-2'>ID</th>
                    <th className='border border-gray-300 p-2'>
                      Fecha Edición
                    </th>
                    <th className='border border-gray-300 p-2'>Usuario</th>
                    <th className='border border-gray-300 p-2'>Empresa</th>
                  </tr>
                </thead>
                <tbody>
                  {changelogs.map((change) => (
                    <React.Fragment key={change.id}>
                      <tr key={change.id}>
                        <td className='border border-gray-300 text-center'>
                          {change.changes && (
                            <div className='flex items-center justify-center'>
                              <div
                                className='cursor-pointer'
                                onClick={() => handleExpand(change.id)}
                                title='Expandir'
                              >
                                {expandedCategoryId === change.id ? (
                                  <FaMinusCircle className='mr-2' />
                                ) : (
                                  <FaPlusCircle className='mr-2' />
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {change.id}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {change.createdAt}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {decrypt(change.creator_name)}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {decrypt(change.creator_company)}
                        </td>
                      </tr>
                      {expandedCategoryId === change.id && (
                        <>
                          <tr>
                            <td></td>
                            <td colSpan={4}>
                              <table className='w-full bg-white border border-gray-300 text-sm'>
                                <thead>
                                  <tr className='bg-gray-400 text-gray-100'>
                                    <th className='border border-gray-300 p-1'>
                                      Campo
                                    </th>
                                    <th className='border border-gray-300 p-1'>
                                      Original
                                    </th>
                                    <th className='border border-gray-300 p-1'>
                                      Actualizado
                                    </th>
                                  </tr>
                                </thead>
                                {Object.entries(decrypt(change.changes)).map(
                                  (field, index) => (
                                    <tr className='bg-cyan-100' key={index}>
                                      <td className='border border-gray-300'>
                                        {searchElement(field[0])}
                                      </td>
                                      <td className='border border-gray-300'>
                                        {field[1].oldValue}
                                      </td>
                                      <td className='border border-gray-300'>
                                        {field[1].newValue}
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </table>
                            </td>
                          </tr>
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {modalImage && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center '>
          <>
            <div className='bg-white p-2 rounded shadow-lg w-1/2 flex flex-col items-center justify-center'>
              <img
                alt='imagen'
                src={urlFile.current}
                className='items-center justify-center h-400'
              />
              <button
                type='button'
                onClick={() => setModalImage(false)}
                className='px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600'
              >
                Cerrar vista previa
              </button>
            </div>
          </>
        </div>
      )}
      {modalDocument && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center '>
          <PdfViewer
            url={urlFile.current}
            onClose={() => setModalDocument(false)}
          />
        </div>
      )}
    </div>
  );
}

export default index;
