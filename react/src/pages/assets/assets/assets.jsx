import React, { useState, useEffect } from 'react';
import { show, postWithData, postAttachment } from '../../../api/index';
import Stepper from '../../../components/stepper/stepper';
import Dropzone from 'react-dropzone';
import './assets.css';
import { FaDeleteLeft } from 'react-icons/fa6';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useParams } from 'react-router-dom';
const Tab = ({ label, onClick, isActive }) => (
  <div
    className={`px-4 py-2 mr-4 border rounded cursor-pointer ${
      isActive ? 'bg-gray-300' : 'bg-gray-200'
    }`}
    onClick={onClick}
  >
    {label}
  </div>
);

const GeneralSection = (props) => (
  <div className='max-w-5xl mx-auto'>
    <div className='grid grid-cols-3 gap-6'>
      {/* Primera fila */}
      <div className='col-span-1'>
        <label htmlFor='code' className='font-bold'>
          Codigo
        </label>
        <input
          type='text'
          id='code'
          name='code'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.code}
        />
      </div>

      <div className='col-span-1'>
        <label htmlFor='name' className='font-bold'>
          Nombre
        </label>
        <input
          type='text'
          id='name'
          name='name'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.name}
        />
      </div>

      <div className='col-span-1'>
        <label htmlFor='serial' className='font-bold'>
          Serial
        </label>
        <input
          type='text'
          id='serial'
          name='serial'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.serial}
        />
      </div>
    </div>

    <div className='grid grid-cols-3 gap-6'>
      {/* Primera fila */}
      <div className='col-span-1'>
        <label htmlFor='asset_category_id' className='font-bold'>
          Categoría
        </label>
        <select
          id='asset_category_id'
          name='asset_category_id'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.asset_category_id}
        >
          <option>Seleccione...</option>
          {/* {props.assetCategories.map((assetCategory) => (
            <option key={assetCategory.id} value={assetCategory.id}>
              {assetCategory.name}
            </option>
          ))} */}
        </select>
      </div>
      <div className='col-span-1'>
        <label htmlFor='company_owner' className='font-bold'>
          Empresa Propietaria
        </label>
        <select
          id='company_owner'
          name='company_owner'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.company_owner}
        >
          <option>Seleccione...</option>
          {props.companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.company}
            </option>
          ))}
        </select>
      </div>

      <div className='col-span-1'>
        <label htmlFor='company_operator' className='font-bold'>
          Empresa Operadora
        </label>
        <select
          id='company_operator'
          name='company_operator'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.company_operator}
        >
          <option>Seleccione...</option>
          {props.companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.company}
            </option>
          ))}
        </select>
      </div>
    </div>
    <div className='grid grid-cols-3 gap-6'>
      <div className='col-span-1'>
        <label htmlFor='service_line_id' className='font-bold'>
          Linea de Servicio
        </label>
        <select
          id='service_line_id'
          name='service_line_id'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.service_line_id}
        >
          <option>Seleccione...</option>
          {props.serviceLines.map((serviceLine) => (
            <option key={serviceLine.id} value={serviceLine.id}>
              {serviceLine.name}
            </option>
          ))}
        </select>
      </div>
      <div className='col-span-1'>
        <label htmlFor='division_id' className='font-bold'>
          Division/Region
        </label>
        <select
          id='division_id'
          name='division_id'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.division_id}
        >
          <option>Seleccione...</option>
          {props.stateByDivisions.map((division) => (
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
        <label htmlFor='facility_id' className='font-bold'>
          Facilidad
        </label>
        <select
          id='facility_id'
          name='facility_id'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.facility_id}
        >
          <option>Seleccione...</option>
          {props.facilitiesByState &&
            props.facilitiesByState.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
        </select>
      </div>
    </div>
    <div className='grid grid-cols-3 gap-6'>
      {/* Primera fila */}
      <div className='col-span-1'>
        <label htmlFor='owner' className='font-bold'>
          Propietario
        </label>
        <input
          type='text'
          id='owner'
          name='owner'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.owner}
        />
      </div>

      <div className='col-span-1'>
        <label htmlFor='transfer' className='font-bold'>
          Traspaso
        </label>
        <select
          id='transfer'
          name='transfer'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.transfer}
        >
          <option value='si'>Si</option>
          <option value='no'>No</option>
        </select>
      </div>

      <div className='col-span-1'>
        <label htmlFor='investment' className='font-bold'>
          Inversión
        </label>
        <select
          id='investment'
          name='investment'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.investment}
        >
          <option value='si'>Si</option>
          <option value='no'>No</option>
        </select>
      </div>
    </div>
    <div className='grid grid-cols-3 gap-6'>
      {/* Primera fila */}
      <div className='col-span-1'>
        <label htmlFor='ppto' className='font-bold'>
          PPTO
        </label>
        <select
          id='ppto'
          name='ppto'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.ppto}
        >
          <option value='CAPEX'>CAPEX</option>
          <option value=''></option>
        </select>
      </div>

      <div className='col-span-1'>
        <label htmlFor='state' className='font-bold'>
          Estado del equipo
        </label>
        <select
          id='state'
          name='state'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.state}
        >
          <option value='Operativo'>Operativo</option>
          <option value='No Operativo'>No Operativo</option>
        </select>
      </div>

      <div className='col-span-1'>
        <label htmlFor='date_acquisition' className='font-bold'>
          Fecha Adquisicion
        </label>
        <input
          type='date'
          id='date_acquisition'
          name='date_acquisition'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.date_acquisition}
        />
      </div>
    </div>
    <div className='grid grid-cols-3 gap-6'>
      {/* Primera fila */}
      <div className='col-span-1'>
        <label htmlFor='cost_net' className='font-bold'>
          Costo Neto
        </label>
        <input
          type='text'
          id='cost_net'
          name='cost_net'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.cost_net}
        />
      </div>

      <div className='col-span-1'>
        <label htmlFor='cost_referential' className='font-bold'>
          Costo Ref Mercado
        </label>
        <input
          type='text'
          id='cost_referential'
          name='cost_referential'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.cost_referential}
        />
      </div>

      <div className='col-span-1'>
        <label htmlFor='date_last_procedure' className='font-bold'>
          Fecha ultimo Tramite
        </label>
        <input
          type='date'
          id='date_last_procedure'
          name='date_last_procedure'
          className='mt-1 p-1 w-full border rounded-md'
          onChange={props.handleChange}
          value={props.formData.date_last_procedure}
        />
      </div>
    </div>
  </div>
);

const CharacteristicsSection = (props) => {
  const [maxYear, setMaxYear] = useState(new Date().getFullYear() + 1);
  const [editorState, setEditorState] = useState('');

  const handleChange = (value) => {
    setEditorState(value);
  };
  return (
    <div className='max-w-5xl mx-auto'>
      <div className='grid grid-cols-3 gap-6'>
        {/* Primera fila */}
        <div className='col-span-1'>
          <label htmlFor='year_factory' className='font-bold'>
            Año de fabricación
          </label>
          <input
            type='number'
            id='year_factory'
            name='year_factory'
            className='mt-1 p-1 w-full border rounded-md'
            min='1900'
            max={maxYear}
            onChange={props.handleChange}
            value={props.formData.year_factory}
          />
        </div>

        <div className='col-span-1'>
          <label htmlFor='date_acquisition' className='font-bold'>
            Fecha de adquisición
          </label>
          <input
            type='date'
            id='date_acquisition'
            name='date_acquisition'
            className='mt-1 p-1 w-full border rounded-md'
            onChange={props.handleChange}
            value={props.formData.date_acquisition}
          />
        </div>

        <div className='col-span-1'>
          <label htmlFor='capacity' className='font-bold'>
            Capacidad
          </label>
          <input
            type='text'
            id='capacity'
            name='capacity'
            className='mt-1 p-1 w-full border rounded-md'
            onChange={props.handleChange}
            value={props.formData.capacity}
          />
        </div>
      </div>
      <div className='grid grid-cols-3 gap-6'>
        {/* Segunda fila */}
        <div className='col-span-1'>
          <label htmlFor='asset_brand_id' className='font-bold'>
            Marca
          </label>
          <select
            id='asset_brand_id'
            name='asset_brand_id'
            className='mt-1 p-1 w-full border rounded-md'
            onChange={props.handleBrandChange}
            value={props.formData.asset_brand_id}
          >
            <option>Seleccione...</option>
            {props.assetBrands &&
              props.assetBrands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
          </select>
        </div>

        <div className='col-span-1'>
          <label htmlFor='asset_model_id' className='font-bold'>
            Modelo
          </label>
          <select
            id='asset_model_id'
            name='asset_model_id'
            className='mt-1 p-1 w-full border rounded-md'
            value={props.formData.asset_model_id}
          >
            <option>Seleccione...</option>
            {props.assetModels &&
              props.assetModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
          </select>
        </div>

        <div className='col-span-1'>
          <label htmlFor='color' className='font-bold'>
            Color
          </label>
          <input
            type='text'
            id='color'
            name='color'
            className='mt-1 p-1 w-full border rounded-md'
            onChange={props.handleChange}
            value={props.formData.color}
          />
        </div>
      </div>

      <div>
        <label htmlFor='description' className='font-bold'>
          Descripcion
        </label>
        <ReactQuill
          value={props.formData.description}
          onChange={props.handleQuill}
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
  );
};

const FilesSection = (props) => (
  <div className='mb-4'>
    <label className='block text-sm font-medium text-gray-600'>Imagenes</label>
    <Dropzone
      onDrop={props.handleDropImages}
      accept={{ mimeType: ['image/jpeg', 'image/png', 'image/gif'] }}
      className='dropzone bg-gray-500 h-[130px] w-[480px]  rounded-lg'
    >
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()} className='dropzone-content'>
          <input {...getInputProps()} />
          <p>
            Arrastra y suelta las imagenes aquí, o haz clic para seleccionar
          </p>
        </div>
      )}
    </Dropzone>
    {props.images.length > 0 && (
      <div className='preview-container'>
        <div className='preview-images'>
          {props.images.map((image, index) => (
            <div key={image.name} className='preview-image'>
              <img src={image.url} alt='Preview' />
              <p>{image.name}</p>
              <button
                onClick={() => props.handleDelete(index)}
                className='delete-button'
              >
                <FaDeleteLeft />
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
    <label className='block text-sm font-medium text-gray-600'>
      Documentos
    </label>
    <Dropzone onDrop={props.handleDropFiles} className='dropzone'>
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()} className='dropzone-content'>
          <input {...getInputProps()} />
          <p>Arrastra y suelta archivos aquí, o haz clic para seleccionar.</p>
        </div>
      )}
    </Dropzone>
    {props.files.length > 0 && (
      <div className='preview-container'>
        <div className='preview-files'>
          {props.files.map((file, index) => (
            <div key={file.name} className='preview-file'>
              <p>{file.name}</p>
              <button
                onClick={() => props.handleDelete(index)}
                className='delete-button'
              >
                <FaDeleteLeft />
              </button>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Agrega más campos aquí según sea necesario */}
  </div>
);

const ActivosForm = () => {
  const { id } = useParams();
  const initialValues = {
    code: '',
    name: '',
    serial: '',
    asset_category_id: '',
    company_owner: '',
    company_operator: '',
    service_line_id: '',
    division_id: '',
    facility_id: '',
    owner: '',
    transfer: '',
    investment: '',
    ppto: '',
    state: '',
    date_acquisition: '',
    cost_net: '',
    cost_referential: '',
    date_last_procedure: '',
    year_factory: '',
    capacity: '',
    color: '',
    description: '',
    asset_brand_id: '',
    asset_model_id: '',
  };
  const [activeTab, setActiveTab] = useState('general');
  const [companies, setCompanies] = useState([]);
  const [assetCategories, setAssetCategories] = useState([]);
  const [serviceLines, setServiceLines] = useState([]);
  const [facilitiesByState, setFacilitiesByState] = useState([]);
  const [stateByDivisions, setStateByDivisions] = useState([]);
  const [assetBrands, setAssetBrands] = useState([]);
  const [assetModels, setAssetModels] = useState([]);
  const [formData, setFormData] = useState(initialValues);
  const [initialImages, setInitialImages] = useState([]);
  // dropzone
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);

  const handleDropImages = (acceptedFiles) => {
    // Filtra solo las imágenes válidas (instancia de Blob)
    const validImages = acceptedFiles.filter((file) => file instanceof Blob);

    console.log('Imagen válida', validImages);

    if (validImages.length > 0) {
      // Crea objetos con la propiedad 'url' para las imágenes válidas
      const imageObjects = validImages.map((image) => ({
        url: URL.createObjectURL(image),
      }));

      console.log('Objetos de imágenes', imageObjects);

      // Agrega los objetos de imágenes al estado de imágenes
      setImages((prevImages) => [...prevImages, ...imageObjects]);
    } else {
      console.error(
        'No se encontraron imágenes válidas en acceptedFiles:',
        acceptedFiles,
      );
    }
  };
  const handleDropFiles = (acceptedFiles) => {
    setFiles([...files, ...acceptedFiles]);
  };

  const handleDeleteImages = (index) => {
    alert(index);
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const handleDivisionStateChange = async (event) => {
    const fa = await show('facilities/getByState/' + event.target.value);
    setFacilitiesByState(fa);

    const { id, value, type, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  useEffect(() => {
    console.log('valor ', formData.division_id);
    const loadFacility = async () => {
      // const fa = await show('facilities/getByState/' + formData.division_id);
      // setFacilitiesByState(fa);
    };
    loadFacility();
  }, [formData.division_id]);

  useEffect(() => {
    console.log('valor ', formData.asset_brand_id);
    const loadFacility = async () => {
      // const ab = await show(
      //   'assets/getModelsByBrand/' + formData.asset_brand_id,
      // );
      // setAssetModels(ab);
    };
    loadFacility();
  }, [formData.asset_brand_id]);

  const handleBrandChange = async (event) => {
    const ab = await show('assets/getModelsByBrand/' + event.target.value);
    setAssetModels(ab);
  };

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
      const ab = await show('assets/asset_brands');
      setAssetBrands(ab);
    };

    fetchSelect();
  }, []);

  const renderSection = () => {
    switch (activeTab) {
      case 'characteristics':
        return (
          <CharacteristicsSection
            assetBrands={assetBrands}
            assetModels={assetModels}
            handleBrandChange={handleBrandChange}
            handleChange={handleChange}
            handleQuill={handleQuill}
            formData={formData}
          />
        );
      case 'filesSection':
        return (
          <FilesSection
            handleDropFiles={handleDropFiles}
            handleDropImages={handleDropImages}
            handleDeleteImages={handleDeleteImages}
            files={files}
            images={images}
          />
        );
      default:
        return (
          <GeneralSection
            companies={companies}
            assetCategories={assetCategories}
            serviceLines={serviceLines}
            facilitiesByState={facilitiesByState}
            stateByDivisions={stateByDivisions}
            handleDivisionStateChange={handleDivisionStateChange}
            handleChange={handleChange}
            formData={formData}
          />
        );
    }
  };

  const handleChange = (event) => {
    const { id, value, type, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };
  const handleQuill = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      description: value,
    }));
  };

  const handleSubmit = async () => {
    const dataToSend = { ...formData };
    try {
      let response = '';
      let response2 = '';
      let response3 = '';
      response = await postWithData('assets', dataToSend);
      const asset_id = response.id;
      if (files.length > 0) {
        const urls = await Promise.all(
          files.map((file) => postAttachment(file, 'assets')),
        );
        const assetFiles = [];
        urls.forEach(async (url) => {
          const dataFiles = {
            asset_id: asset_id,
            url: url.data.STORAGE_ROUTE,
          };
          assetFiles.push(dataFiles);
        });

        response2 = await postWithData('assets/createAssetFiles', assetFiles);
      }
      if (images.length > 0) {
        const urls = await Promise.all(
          images.map((file) => postAttachment(file, 'assets')),
        );
        const assetFiles = [];
        urls.forEach(async (url) => {
          const dataFiles = {
            asset_id: asset_id,
            url: url.data.STORAGE_ROUTE,
          };
          assetFiles.push(dataFiles);
        });

        response3 = await postWithData('assets/createAssetFiles', assetFiles);
      }

      console.log('Respuesta de la API 1:', response);
      console.log('Respuesta de la API 2:', response2);
      console.log('Respuesta de la API 2:', response3);
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
    }
  };

  const getAssetById = async (id) => {
    try {
      const response = await show('assets/getAssetById/' + id);
      console.log(response);
      if (response) {
        const assetData = response; // Ajusta esto según la estructura real de tu respuesta
        const formatedDateAdquisition = assetData.date_acquisition
          ? new Date(assetData.date_acquisition).toISOString().split('T')[0]
          : '';
        const formatedDateLastProcedure = assetData.date_last_procedure
          ? new Date(assetData.date_last_procedure).toISOString().split('T')[0]
          : '';

        const imagesFromAssetFiles = response.asset_files.map((file) => ({
          url: file.url,
        }));
        setImages(imagesFromAssetFiles);
        console.log('images', imagesFromAssetFiles);

        // Actualizar el estado formData con los valores obtenidos
        setFormData({
          ...formData,
          code: assetData.code || '',
          name: assetData.name || '',
          serial: assetData.serial || '',
          asset_category_id: assetData.asset_category_id || '',
          company_owner: assetData.company_owner || '',
          company_operator: assetData.company_operator || '',
          service_line_id: assetData.service_line_id || '',
          division_id: assetData.facility.state_id || '',
          facility_id: assetData.facility_id || '',
          owner: assetData.owner || '',
          transfer: assetData.transfer || '',
          investment: assetData.investment || '',
          ppto: assetData.ppto || '',
          state: assetData.state || '',
          date_acquisition: formatedDateAdquisition || '',
          cost_net: assetData.cost_net || '',
          cost_referential: assetData.cost_referential || '',
          date_last_procedure: formatedDateLastProcedure || '',
          year_factory: assetData.year_factory || '',
          capacity: assetData.capacity || '',
          asset_brand_id: assetData.asset_model.asset_brand_id || '',
          asset_model_id: assetData.asset_model_id || '',
          color: assetData.color || '',
          description: assetData.description || '',
          // Agrega más campos según sea necesario
        });
      }
    } catch (error) {
      console.error('Error al obtener el activo por ID:', error);
    }
  };

  useEffect(() => {
    if (id) {
      getAssetById(id);
    }
  }, []);
  return (
    <div className='max-w-6xl mx-auto p-6'>
      <div className='bg-white border rounded shadow'>
        <Stepper currentStep={1} totalSteps={1} stepTexts={['Crear Activos']} />
        <div className='mb-4 overflow-x-auto  bg-gray-200'>
          <div className='flex'>
            <Tab
              label='General'
              onClick={() => setActiveTab('general')}
              isActive={activeTab === 'general'}
            />
            <Tab
              label='Características'
              onClick={() => setActiveTab('characteristics')}
              isActive={activeTab === 'characteristics'}
            />
            <Tab
              label='Imagen & Soportes'
              onClick={() => setActiveTab('filesSection')}
              isActive={activeTab === 'filesSection'}
            />
          </div>
        </div>
        <div className='p-4'>{renderSection()}</div>
      </div>
      <div className='flex justify-end bg-white border rounded shadow p-4'>
        <button
          type='button'
          className='bg-blue-500 text-white py-2 px-4 rounded'
          onClick={handleSubmit}
        >
          Guardar Activo
        </button>
      </div>
    </div>
  );
};

export default ActivosForm;
