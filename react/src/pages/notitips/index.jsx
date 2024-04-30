import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  show,
  putWithData,
  postWithData,
  postAttachment,
  deleteAttachment,
} from '../../api';
import Stepper from '../../components/stepper/stepper';
import foto from '../../img/user-bg.png';
import { PiListPlus } from 'react-icons/pi';
import Spinner from '../../components/Spinner/Spinner';
import Select from 'react-select';
import { useUser } from '../../context/userContext';
import ToastNotify from '../../components/toaster/toaster';

const isDesktop = window.innerWidth > 768;

function index() {
  const { user } = useUser();
  const { id } = useParams();
  const initialValues = {
    status: ``,
    company_id: ``,
    category: ``,
    priority: ``,
    createdBy: ``,
    title: ``,
    description: ``,
    icon: ``,
    image: ``,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const [noti, setNoti] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(initialValues);
  const [formDataCategory, setFormDataCategory] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [Image, setImage] = useState({
    icon: ``,
    image: ``,
  });

  const [enabledBtnNew, setEnabledBtnNew] = useState(true);
  const [enabledBtnEdit, setEnabledBtnEdit] = useState(false);
  const [stage, setStage] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Número de usuarios por página
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getCompanys();
    getCategory();
    getAllNoti();
  }, [currentPage, pageSize, searchTerm]);

  async function getAllNoti() {
    try {
      const response = await show(
        `notitips/getAllNotiTips?page=${currentPage}&pageSize=${pageSize}&email=${searchTerm}`,
      );
      // &company=${selectCompany.id}
      const { data, meta } = response;
      //console.log(data);
      console.log(categories);
      setNoti(data);
      //setOriginalUsers(data);
      // setTotalPages(meta.totalPages);
      // setLoader(false);
    } catch (error) {
      console.error('Error al obtener la lista de usuarios', error);
      // setLoader(false);
    }
  }

  async function getCompanys() {
    const response = await show('companies/getCompanies');
    setCompanies(response);
  }

  async function getCategory() {
    const response = await show('notitips/getAllNotiCategory');
    setCategories(response.data);
    console.log(response);
  }

  const openModal = (row) => {
    if (row == 'add') {
      //setFormData(initialValues);
      setTitle('Nueva Categoría');
      setIsModalOpen(true);
      //current = 0;
    } /* else {
      let department = row.department;
      let description = row.description;
      let id = row.id;

      setFormData({
        ['department']: department,
        ['description']: description,
        ['id']: id,
      });
      current = id;
      setTitle('Actualizar Departamento');
      setIsModalOpen(true);
    } */
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      company_id: formData.company_id,
      category: formData.category,
      createdBy: user.id,
      updatedAt: new Date(),
      [name]: value,
    }));
  };

  const handleChangeCategory = async (e) => {
    const { name, value } = e.target;
    setFormDataCategory((prevData) => ({
      ...prevData,
      updatedAt: new Date(),
      createdBy: user.id,
      [name]: value,
    }));
  };

  const saveCategory = async () => {
    const response = await postWithData(
      'notitips/createNotiCategory/',
      formDataCategory,
    );
    if (response.id) {
      ToastNotify({ message: 'Catergoría Creada...!', position: 'top-right' });
      getCategory();
    } else {
      ToastNotify({
        message: 'Error al Crear Catergoría...!',
        position: 'top-right',
      });
    }
  };

  const postFile = async (image) => {
    const resp = await postAttachment(
        image,
        'notitips',
      )
      return resp
  }

  const submit = async () => {
    if (!id) {
      if (Image) {
        if (Image.icon) {
          const fileUploadResponse = await postFile(Image.icon)
          const url = fileUploadResponse.data.STORAGE_ROUTE;
          console.log("url ", url)
          formData.icon = url
        }
        if (Image.image) {
          const fileUploadResp = await postFile(Image.image)
          const url2 = fileUploadResp.data.STORAGE_ROUTE;
          console.log("url2 ", url2)
          formData.image = url2
        }
      }
      const response = await postWithData('notitips/createNotiTips/', formData);
      if (response.id) {
        ToastNotify({ message: 'Registro Creado...!', position: 'top-right' });
      }
    } else {
      if (Image) {
        if (formData.image != null) {
          if (urlAzureRef.current != '') {
            const filename = urlAzureRef.current.split('/').pop();
            const response = await deleteAttachment(filename, 'notitips');
            // Verificar si la eliminación fue exitosa
            if (response !== 200) {
              InfoSweetAlert({
                title: 'error',
                text: 'Ocurrió un error al eliminar el documento anterior',
                icon: 'error',
              }).infoSweetAlert();
            }
          }
        }
        if (formData.icon != null) {
            if (urlAzureRef.current != '') {
              const filename = urlAzureRef.current.split('/').pop();
              const response = await deleteAttachment(filename, 'notitips');
              // Verificar si la eliminación fue exitosa
              if (response !== 200) {
                InfoSweetAlert({
                  title: 'error',
                  text: 'Ocurrió un error al eliminar el documento anterior',
                  icon: 'error',
                }).infoSweetAlert();
              }
            }
          }
        const fileUploadResponse = await postAttachment(Image, 'notitips');
        const nurl = fileUploadResponse.data.STORAGE_ROUTE;
        urlAzureRef.current = fileUploadResponse.data.STORAGE_ROUTE;
        formData.image = nurl;
      }
      const response = await putWithData(putRoute + id, formData);
      if (response) {
        ToastNotify({
          message: 'Perfil Actualizado...!',
          position: 'top-right',
        });
        getUserById();
      } else {
        ToastNotify({
          message: 'Error en Actualizar Perfil...!',
          position: 'top-right',
        });
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log(e.target.name)
    const ext = getFileExtension(file.name);
    const store = Math.round(file.size / 1024);
    if (
      ext === 'png' ||
      ext === 'jpg' ||
      ext === 'jpeg' ||
      ext === 'gif' ||
      ext === 'pdf'
    ) {
      if (store <= 2000)
        if (e.target.name === 'icon') setImage({ ...Image, icon: file });
        else setImage({ ...Image, image: file });
      else
        ToastNotify({
          message: 'Tamaño del Archivo No Permitido "Máximo: 2MB"',
          position: 'top-center',
        });
    } else
      ToastNotify({
        message: 'Tipo de Extensión No Permitida',
        position: 'top-center',
      });
  };

  function getFileExtension(filename) {
    return /[.]/.exec(filename) ? /[^.]+$/.exec(filename)[0] : undefined;
  }

  useEffect(() => {
    const {
      status,
      company_id,
      category,
      priority,
      title,
      description,
      // icon,
      // image,
    } = formData;

    // Verificar si los campos del formulario y al menos un item son válidos
    const isValid =
      status !== '' &&
      // icon !== '' &&
      company_id !== '' &&
      category !== '' &&
      priority !== '' &&
      title !== '' &&
      description !== '';
    // image !== ''
    setIsFormValid(isValid);
  }, [formData]);

  const handleStepClick = (step) => {
    setStage(step - 1);
  };

  return (
    <div className='container row-span-2 mt-10 p-2'>
      <div className='md:w-full text-sm mt-4'>
        <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
          <Stepper
            currentStep={stage}
            totalSteps={2}
            onStepClick={handleStepClick}
            stepTexts={['Lista de Información', 'Nuevo Registro']}
          />
          {stage == 0 ? (
            <div>
              <input
                type='text'
                placeholder='Buscar por Nombre'
                /* value={searchTerm}
                onChange={handleSearchTermChange} */
                className={`mt-1 p-1 ${
                  isDesktop ? 'w-1/2' : 'w-full'
                } border rounded-md focus:outline-none focus:border-blue-500 transition duration-300 mt-2 ml-2`}
              />
              <div className='mb-4 overflow-x-auto  bg-gray-50 p-2 text-sm'>
                <table className='w-full bg-white border border-gray-300 '>
                  <thead>
                    <tr className='bg-gray-800 text-gray-100'>
                      <th className='border border-gray-300 p-2'>Icon</th>
                      <th className='border border-gray-300 p-2'>Categoría</th>
                      <th className='border border-gray-300 p-2'>Prioridad</th>
                      <th className='border border-gray-300 p-2'>Compañia</th>
                      <th className='border border-gray-300 p-2'>Título</th>
                      <th className='border border-gray-300 p-2'>Ver</th>
                      {/* Agrega más columnas según las propiedades de tus usuarios */}
                    </tr>
                  </thead>
                  <tbody>
                    {noti.map((data) => (
                      <tr
                        key={data.id}
                        className='bg-white hover:bg-slate-500 hover:text-white dark:hover:bg-gray-600 text-sm'
                      >
                        <td className='border border-gray-300 text-center'>
                          <img
                            className='ml-4 h-8 w-8 rounded-full '
                            src={data.icon ? data.icon : foto}
                            alt=''
                          />
                        </td>
                        <td className='border border-gray-300 text-center'>
                          {data.category}
                        </td>
                        <td className='border border-gray-300 text-center'>
                          {data.priority}
                        </td>
                        <td className='border border-gray-300 text-center'>
                          {data.company_id}
                        </td>
                        <td className='border border-gray-300 text-center'>
                          {data.title}
                        </td>
                        {/* <td className='border border-gray-300  text-center'>
                        <button
                          type='button'
                          className={
                            user.statu === 'Activo'
                              ? 'hover:text-white ml-4 text-xl text-lime-600 text-center'
                              : 'hover:text-white  ml-4 text-xl text-red-500 text-center'
                          }
                          onClick={() => handleUpdate(user.id, user.statu)}
                        >
                          {user.statu === 'Activo' ? (
                            <IoShieldCheckmarkOutline />
                          ) : (
                            <FaRegCircleXmark />
                          )}
                        </button>
                      </td>
                      <td className='border border-gray-300 p-2 flex-center'>
                        <Link to={`/configs/users/${user.id}`}>
                          <button
                            type='button'
                            className='hover:text-white text-black  text-lg'
                          >
                            <BiSolidShow />
                          </button>
                        </Link>
                      </td> */}
                        {/* Agrega más celdas según las propiedades de tus usuarios */}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* {renderPagination()} */}
              </div>{' '}
            </div>
          ) : (
            <div className='w-full max-w-full p-6'>
              <div className='flex flex-row mb-4'>
                <div className='basis-1/2'>
                  <div className='w-1/3'>
                    <label className='text-gray-700'>Estado Visible:</label>
                  </div>
                  <div className='w-2/4 mt-2'>
                    <div className='flex flex-row mb-4'>
                      <div className='flex'>
                        <input
                          type='radio'
                          name='status'
                          id='si'
                          className='peer hidden'
                          value={formData.status ? formData.status : '1'}
                          onChange={handleChange}
                        />
                        <label
                          for='si'
                          className='cursor-pointer peer-checked:text-white peer-checked:bg-slate-700 peer-checked:cursor-default text-gray-400  p-2 border rounded-r-lg bg-neutral-300'
                        >
                          Si
                        </label>
                      </div>
                      <div className='flex'>
                        <input
                          type='radio'
                          name='status'
                          id='no'
                          className='peer hidden'
                          value={formData.status ? formData.status : '0'}
                          onChange={handleChange}
                        />
                        <label
                          for='no'
                          className='cursor-pointer peer-checked:text-white peer-checked:bg-slate-700 peer-checked:cursor-default text-gray-400 p-2 border rounded-l-lg bg-neutral-300'
                        >
                          No
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='basis-1/2'>
                  <div className='w-1/3'>
                    <label htmlFor='titulo' className='text-gray-700'>
                      Categoría:{' '}
                      <button
                        className=' justify-end p-1 text-3 text-sky-700'
                        onClick={() => openModal('add')}
                      >
                        <PiListPlus />
                      </button>
                    </label>
                  </div>
                  <div className='w-3/4'>
                    <Select
                      className='mt-1 w-full border-neutral-50 hover:border-slate-95  rounded-md'
                     // defaultValue={{ label: formData.category }}
                      options={categories.map((data) => ({
                        label: data.category,
                        value: data.category,
                      }))}
                      name='category'
                      id='category'
                      onChange={(data) =>
                        setFormData({
                          ...formData,
                          category: data.value,
                        })
                      }
                      value={categories.find(
                        (option) => option.value === formData.category,
                      )}
                    />
                  </div>
                </div>
                <div className='basis-1/2'>
                  <div className='w-2/4'>
                    <label htmlFor='titulo' className='text-gray-700'>
                      Prioridad:
                    </label>
                  </div>
                  <div className='w-2/4 mt-2'>
                    <div className='flex flex-row mb-4'>
                      <div className='flex'>
                        <input
                          type='radio'
                          name='priority'
                          id='ba'
                          className='peer hidden'
                          value={'Baja'}
                          onChange={handleChange}
                        />
                        <label
                          for='ba'
                          className='cursor-pointer peer-checked:text-white peer-checked:bg-slate-700 peer-checked:cursor-default text-gray-400  p-2 border rounded-r-lg bg-neutral-300'
                        >
                          Baja
                        </label>
                      </div>
                      <div className='flex'>
                        <input
                          type='radio'
                          name='priority'
                          id='al'
                          className='peer hidden'
                          value={'Alta'}
                          onChange={handleChange}
                        />
                        <label
                          for='al'
                          className='cursor-pointer peer-checked:text-white peer-checked:bg-slate-700 peer-checked:cursor-default text-gray-400 p-2 border rounded-l-lg bg-neutral-300'
                        >
                          Alta
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='basis-1/2'>
                  <div className='w-1/3'>
                    <label htmlFor='titulo' className='text-gray-700'>
                      Empresa:
                    </label>
                  </div>
                  <div className='w-3/4'>
                    <Select
                      className='mt-1 w-full border-neutral-50 hover:border-slate-95  rounded-md'
                      //defaultValue={{ label: formData.company }}
                      options={companies.map((data) => ({
                        label: data.company,
                        value: data.id,
                      }))}
                      name='company_id'
                      id='company_id'
                      onChange={(data) =>
                        setFormData({
                          ...formData,
                          company_id: data.value,
                        })
                      }
                      value={companies.find(
                        (option) => option.value === formData.company_id,
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className='flex flex-row mb-4'>
                <div className=' basis-full'>
                  <div className='w-full'>
                    <label htmlFor='titulo' className='text-gray-700'>
                      Título:
                    </label>
                  </div>
                  <div className='w-full'>
                    <input
                      type='text'
                      id='title'
                      name='title'
                      value={formData.title}
                      onChange={handleChange}
                      className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                    />
                  </div>
                </div>
              </div>
              <div className='flex flex-row mb-4'>
                <div className=' basis-full'>
                  <div className='w-full'>
                    <label htmlFor='titulo' className='text-gray-700'>
                      Descripción:
                    </label>
                  </div>
                  <div className='w-full'>
                    <textarea
                      name='description'
                      rows='8'
                      resize='false'
                      maxLength='255'
                      spellCheck='true'
                      className='border w-full border-gray-300 rounded-md resize-none'
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className='flex flex-row mb-4'>
                <div className='basis-1/2'>
                  <div className='w-1/3'>
                    <label htmlFor='titulo' className='text-gray-700'>
                      Icono:
                    </label>
                    <input
                      type='file'
                      id='icon'
                      name='icon'
                      onChange={handleFileChange}
                      className='w-full px-3 mt-1 rounded-md text-sm'
                    />
                  </div>
                  <div className='w-2/4'>
                    <img
                      className='h-24 w-24 rounded-full border-b-4 border-t-2 border-x-2 border-slate-500'
                      src={formData.icon ? formData.icon : foto}
                      alt=''
                    />
                  </div>
                </div>
                <div className='basis-1/2'>
                  <div className='w-1/3'>
                    <label htmlFor='titulo' className='text-gray-700'>
                      Image:
                    </label>
                    <input
                      type='file'
                      id='image'
                      name='image'
                      onChange={handleFileChange}
                      className='w-full px-3 mt-1 rounded-md text-sm'
                    />
                  </div>
                  <div className='w-2/4'>
                    <img
                      className='h-24 w-24 rounded-full border-b-4 border-t-2 border-x-2 border-slate-500'
                      src={formData.image ? formData.image : foto}
                      alt=''
                    />
                  </div>
                </div>
              </div>

              <div className='flex justify-end mt-10'>
                <button
                  type='button'
                  //disabled={!enabledBtnNew && !enabledBtnEdit}
                  className={
                    enabledBtnNew || enabledBtnEdit
                      ? 'bg-gray-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded'
                      : 'text-gray-500 bg-gray-200 cursor-not-allowed  font-bold py-1 px-2 rounded '
                  }
                  onClick={submit}
                  disabled={!isFormValid}
                >
                  Guardar
                </button>
                <button className='py-2 px-4 text-sm bg-gray-500 text-white cursor-pointer font-bold rounded ml-4 hover:bg-blue-900'>
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center '>
          <div className='bg-white p-6 rounded shadow-lg w-1/2'>
            <Stepper currentStep={1} totalSteps={1} stepTexts={[title]} />
            {/* Formulario para el nuevo elemento */}
            {/* <form className='w-full max-w-full p-6 border'> */}
            <div className='flex items-center mb-4'>
              <div className='w-1/3 text-right mr-2'>
                <label htmlFor='titulo' className='text-gray-700'>
                  Categoría:
                </label>
              </div>
              <div className='w-2/4'>
                <input
                  type='text'
                  id='category'
                  name='category'
                  /* value={formData.department}*/
                  onChange={handleChangeCategory}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
            </div>
            <div className='flex justify-end mt-10'>
              <button
                type='button'
                disabled={!enabledBtnNew && !enabledBtnEdit}
                className={
                  enabledBtnNew || enabledBtnEdit
                    ? 'bg-gray-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded'
                    : 'text-gray-500 bg-gray-200 cursor-not-allowed  font-bold py-1 px-2 rounded '
                }
                onClick={saveCategory}
              >
                Guardar
              </button>
              <button
                className='py-2 px-4 text-sm bg-gray-500 text-white cursor-pointer font-bold rounded ml-4 hover:bg-blue-900'
                onClick={closeModal}
              >
                Cerrar
              </button>
            </div>
            {/*  </form> */}
          </div>
        </div>
      )}
      {isLoading ? <Spinner /> : ''}
    </div>
  );
}

export default index;
