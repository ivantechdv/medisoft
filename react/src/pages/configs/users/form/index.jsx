import {
  postWithData,
  putWithData,
  show,
  postAttachment,
  deleteAttachment,
} from '../../../../api';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import ToastNotify from '../../../../components/toaster/toaster';
import Stepper from '../../../../components/stepper/stepper';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import foto from '../../../../img/user-bg.png';

function UserForm() {
  const { id } = useParams();
  const [fieldBlock, setFieldBlock] = useState(false);
  const [stage, setStage] = useState(0);
  const [formData, setFormData] = useState({
    username: ``,
    email: ``,
    password: 0,
    dni: ``,
    first_name: ``,
    last_name: ``,
    statu: ``,
    company_id: ``,
    address: ``,
    gender: ``,
    birth_date: ``,
    phone_number: ``,
    other_phone_number: ``,
    dateBegin: ``,
    department_id: ``,
    position_id: ``,
    direct_boss_id: ``,
    functional_boss_id: ``,
    facility_id: ``,
    type_user: ``,
    createdAt: new Date(),
    updatedAt: new Date(),
    code_tmp: 0,
    image: ``,
  });
  const [permisologyGeneralFormData, setpermisologyGeneralFormData] = useState({
    can_access_config: false,
    can_create_user: false,
    can_edit_user: false,
    can_delete_user: false,
    createdAt: new Date(),
    user_id: id,
  });

  const [PermisologyPurchaseFormData, setPermisologyPurchaseFormData] =
    useState({
      can_access_purchase: false,
      can_create_purchase: false,
      can_delete_purchase: false,
      can_create_cost_center: false,
      can_delete_cost_center: false,

      can_create_aprobador: false,
      can_delete_aprobador: false,

      can_create_cuenta_contable: false,
      can_delete_cuenta_contable: false,
      compras_user: false, 
      createdAt: new Date(),
      user_id: id,
    });

  const [PermisologyLegalFormData, setPermisologyLegalFormData] = useState({
    can_access_legal: false,

    can_access_config: false,
    can_access_form: false,
    can_access_list_all_companys: false,
    can_access_list_my_company: false,
    can_access_logs: false,

    can_access_category: false,
    can_category_create: false,
    can_category_update: false,
    can_storage_create: false,
    can_storage_update: false,
    can_storage_list: false,

    can_storage_delete: false,
    can_storage_show_deletes: false,

    createdAt: new Date(),
    user_id: id,
  });

  const urlAzureRef = useRef('');
  const [companies, setCompanies] = useState([]);
  const [allusers, setAllUsers] = useState([]);
  const [alldepartment, setAllDepartment] = useState([]);
  const [allposition, setAllposition] = useState([]);
  const [allfacility, setAllfacility] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [loader, setLoader] = useState(true);
  const [beginDate, setBeginDate] = useState({ beginDate: formData.dateBegin });
  const [birhtDate, setBirthDate] = useState({
    birhtDate: formData.birth_date,
  });
  const [btnSave, setBtnSave] = useState(true);
  const [Image, setImage] = useState('')

  useEffect(() => {
    getCompanys();
    getAllUsers();
    getDepartment();
    getPosition();
    getFacility();
    if (!id) {
      setBeginDate(new Date());
      setBirthDate(new Date());
    }
    if (id) {
      getUserById();
      setBtnSave(false);
    } else {
      setLoader(false);
    }
  }, []);

  async function getAllUsers() {
    const response = await show('users/getAllUsers');
    setAllUsers(response.data);
    //console.log(response.data);
  }
  async function getCompanys() {
    const response = await show('companies/getCompanies');
    setCompanies(response);
  }
  async function getDepartment() {
    const response = await show('departments/getDepartments');
    setAllDepartment(response);
  }
  async function getFacility() {
    const response = await show('facilities/getAllFacilities');
    setAllfacility(response.data);
    //  console.log(response.data)
  }
  async function getPosition() {
    const response = await show('positions/getPositions');
    setAllposition(response);
  }
  async function getUserById() {
    try {
      const response = await show('users/getUserById/' + id);
      // Verifica si la respuesta tiene datos
      if (response && response.id) {
        // Actualiza el estado del formData con los datos de la solicitud
        let namedirecto = '';
        let nameFuncional = '';
        setBirthDate(response.birth_date);
        setBeginDate(response.dateBegin);
        if (response.direct_boss_id === 0) namedirecto = 'Vacio';
        else
          namedirecto =
            response.manager.first_name + ' ' + response.manager.last_name;

        if (response.functional_boss_id === 0) nameFuncional = 'Vacio';
        else
          nameFuncional =
            response.functional.first_name +
            ' ' +
            response.functional.last_name;

        setFormData((prevData) => ({
          ...prevData,
          username: response.username,
          email: response.email,
          password: response.password,
          dni: response.dni,
          first_name: response.first_name,
          last_name: response.last_name,
          statu: response.statu,
          createdAt: response.createdAt,
          company_id: response.company_id,
          company: response.company.company,
          gender: response.gender,
          birth_date: response.birth_date,
          phone_number: response.phone_number,
          other_phone_number: response.other_phone_number,
          dateBegin: response.dateBegin,
          department_id: response.department_id,
          department: response.department.department,
          position_id: response.position_id,
          position: response.position.position,
          direct_boss_id: response.direct_boss_id,
          nameManager: namedirecto,
          functional_boss_id: response.functional_boss_id,
          nameFuncional: nameFuncional,
          facility_id: response.facility_id,
          facility: response.facility.name,
          address: response.address,
          type_user: response.type_user,
          image: response.image,
        }));
        urlAzureRef.current = response.image

        if (response.permisology_general) {
          setpermisologyGeneralFormData((prevData) => ({
            ...prevData,
            can_access_legal: response.permisology_general.can_access_legal,
            can_access_config: response.permisology_general.can_access_config,
            can_create_user: response.permisology_general.can_create_user,
            can_edit_user: response.permisology_general.can_edit_user,
            can_delete_user: response.permisology_general.can_delete_user,
            user_id: response.permisology_general.user_id,
            createdAt: response.permisology_general.createdAt,
          }));
        }
        if (response.Permisology_purchase) {
          setPermisologyPurchaseFormData((prevData) => ({
            ...prevData,
            can_access_purchase:
            response.Permisology_purchase.can_access_purchase,
            can_create_purchase:
              response.Permisology_purchase.can_create_purchase,
            can_delete_purchase:
              response.Permisology_purchase.can_delete_purchase,

            can_create_cost_center:
              response.Permisology_purchase.can_create_cost_center,
            can_delete_cost_center:
              response.Permisology_purchase.can_delete_cost_center,

            can_create_aprobador:
              response.Permisology_purchase.can_create_aprobador,
            can_delete_aprobador:
              response.Permisology_purchase.can_delete_aprobador,

            can_create_cuenta_contable:response.Permisology_purchase.can_create_cuenta_contable,
            can_delete_cuenta_contable:response.Permisology_purchase.can_delete_cuenta_contable,
           
            compras_user:response.Permisology_purchase.compras_user,

            user_id: response.Permisology_purchase.user_id,
            createdAt: response.Permisology_purchase.createdAt,
          }));
        }

        if (response.Permisology_legal) {
          setPermisologyLegalFormData((prevData) => ({
            ...prevData,

            can_access_legal: response.Permisology_legal.can_access_legal,
            can_access_config: response.Permisology_legal.can_access_config,
            can_access_form: response.Permisology_legal.can_access_form,
            can_access_list_all_companys:
              response.Permisology_legal.can_access_list_all_companys,
            can_access_list_my_company:
              response.Permisology_legal.can_access_list_my_company,
            can_access_logs: response.Permisology_legal.can_access_logs,

            can_access_category: response.Permisology_legal.can_access_category,
            can_category_create: response.Permisology_legal.can_category_create,
            can_category_update: response.Permisology_legal.can_category_update,
            can_storage_create: response.Permisology_legal.can_storage_create,
            can_storage_update: response.Permisology_legal.can_storage_update,
            can_storage_list: response.Permisology_legal.can_storage_list,
            can_storage_delete: response.Permisology_legal.can_storage_delete,
            can_storage_show_deletes:
              response.Permisology_legal.can_storage_show_deletes,

            user_id: response.Permisology_legal.user_id,
            createdAt: response.Permisology_legal.createdAt,
          }));
        }
        setLoader(false);
      }
    } catch (error) {
      console.error('Error al obtener la solicitud por ID:', error);
    }
  }

  const submit = async (type = 'user') => {
    const f = confirm('¿Está seguro de que desea enviar?');
    if (f) {
      let postRoute = '';
      let putRoute = '';
      let getRoute = '';
      if (type == 'user') {
        postRoute = 'users/createUser';
        putRoute = 'users/putUser/';
        getRoute = 'users/getUserById/' + id;

      } else {
        return 500;
      }
      if (!id) {
        if (Image) {
          const fileUploadResponse = await postAttachment(Image, 'colaborador',);
          const url = fileUploadResponse.data.STORAGE_ROUTE;
          setFormData((prevData) => ({
            ...prevData,
            image: url,
          }));
        }
        const response = await postWithData(postRoute, formData);
        if (response.id) {
          ToastNotify({ message: 'Perfil Creado...!', position: 'top-right' });
        }
      } else {
        if(Image) {
        if (formData.image != null) {
          if (urlAzureRef.current != '') {
            const filename = urlAzureRef.current.split('/').pop();
            const response = await deleteAttachment(filename, 'colaborador',);
            // Verificar si la eliminación fue exitosa
            if (response !== 200) {
              InfoSweetAlert({
                title: 'error',
                text: 'Ocurrió un error al eliminar el documento anterior',
                icon: 'error',
              }).infoSweetAlert();
            } } 
          }
        const fileUploadResponse = await postAttachment(Image, 'colaborador',);
        const nurl = fileUploadResponse.data.STORAGE_ROUTE;
        urlAzureRef.current = fileUploadResponse.data.STORAGE_ROUTE;
        formData.image = nurl
      }
        const response = await putWithData(putRoute + id, formData);
        if (response) {
          ToastNotify({ message: 'Perfil Actualizado...!', position: 'top-right' });
          getUserById() 
        } else {
          ToastNotify({ message: 'Error en Actualizar Perfil...!', position: 'top-right' });
        }
      }
    } 
  };
  const submitPermisology = async (type = 'PermisolgyGeneral') => {
    // es un submit que recibe como parametro para que
    // permisologia iran las petciones
    // se deben agregar las rutas y el formulario
    // debe manejar el post si aun no existe una permisologia creada con el id del usuario
    // y el put si ya existe un registro permisology con el id del usuario
    const f = confirm('¿Está seguro de que desea enviar?');
    if (f) {
      let postRoute = '';
      let putRoute = '';
      let form;
      let getRoute = '';
      if (type == 'PermisolgyGeneral') {
        postRoute = 'permisologys/postPermisologyGeneral';
        putRoute = 'permisologys/putPermisologyGeneralByUserId/';
        getRoute = 'permisologys/getPermisologyGeneralById/' + id;
        form = permisologyGeneralFormData;
      } else if (type == 'PermisologyPurchase') {
        postRoute = 'permisologys/postPermisologyPurchases';
        putRoute = 'permisologys/putPermisologyPurchasesByUserId/';
        getRoute = 'permisologys/getPermisologyPurchaseById/' + id;
        form = PermisologyPurchaseFormData;
      } else if (type == 'PermisologyLegal') {
        postRoute = 'permisologys/postPermisologyLegal';
        putRoute = 'permisologys/putPermisologyLegalByUserId/';
        getRoute = 'permisologys/getPermisologyLegalById/' + id;
        form = PermisologyLegalFormData;
      } else {
        return 500;
      }

      const user = await show('users/getUserById/' + id);

      let post = true;

      //aca validamos si el usuario ya tiene permisologia
      // para ver si hacemos post o put
      // debemos validar cada permisologia segun el formulario
      if (type == 'PermisolgyGeneral') {
        if (!user.permisology_general) {
        } else {
          post = false;
        }
      }
      if (type == 'PermisologyPurchase') {
        if (!user.Permisology_purchase) {
        } else {
          post = false;
        }
      }
      if (type == 'PermisologyLegal') {
        if (!user.Permisology_legal) {
        } else {
          post = false;
        }
      }
      if (post) {
        const response = await postWithData(postRoute, form);
        if (response.id) {
          ToastNotify({ message: 'Creado', position: 'top-right' });
        } else {
          ToastNotify({ message: 'Error', position: 'top-right' });
        }
      } else {
        console.log('p[uty');
        const response = await putWithData(putRoute + id, form);
        console.log('p[uty', response);
        ToastNotify({ message: 'Actualizado', position: 'top-right' });
      }
    } else {
      ToastNotify({ message: 'Cancelado', position: 'top-right' });
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    if (name === 'dni' && !id) {
      let res = '';
      res = allusers.find((option) => option.dni === e.target.value);
      if (res) {
        ToastNotify({ message: 'CI Existe..!     ', position: 'top-center' });
        setFieldBlock(true);
      } else setFieldBlock(false);
    }

    setFormData((prevData) => ({
      ...prevData,
      username: formData.email,
      company_id: formData.company_id,
      department_id: formData.department_id,
      direct_boss_id: formData.direct_boss_id,
      position_id: formData.position_id,
      facility_id: formData.facility_id,
      functional_boss_id: formData.functional_boss_id,
      dateBegin: beginDate,
      birth_date: birhtDate,
      updatedAt: new Date(),
      [name]: value,
    }));
  };

  const handleChangeGeneralPermisology = (e) => {
    const { name, type, checked } = e.target;

    // Manejar el caso especial para checkboxes
    const value = type === 'checkbox' ? checked : e.target.value;
    setpermisologyGeneralFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleChangePurchasePermisology = (e) => {
    const { name, type, checked } = e.target;

    // Manejar el caso especial para checkboxes
    const value = type === 'checkbox' ? checked : e.target.value;
    setPermisologyPurchaseFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleChangeLegalPermisology = (e) => {
    const { name, type, checked } = e.target;

    // Manejar el caso especial para checkboxes
    const value = type === 'checkbox' ? checked : e.target.value;
    setPermisologyLegalFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleStepClick = (step) => {
    setStage(step - 1);
  };

  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
  };

  useEffect(() => {
    const {
      username,
      email,
      password,
      dni,
      first_name,
      last_name,
      statu,
      createdAt,
      company_id,
      department_id,
      position_id,
      direct_boss_id,
      functional_boss_id,
      facility_id,
    } = formData;

    // Verificar si los campos del formulario y al menos un item son válidos
    const isValid =
      // username.trim() !== '' &&
      email.trim() !== '' &&
      dni !== 0 &&
      first_name !== '' &&
      last_name.trim() !== '' &&
      statu.trim() !== '' &&
      createdAt !== '' && 
      company_id !== '' && 
      department_id !== '' && 
      position_id !== '' && 
      direct_boss_id !== '' && 
      functional_boss_id !== '' && 
      facility_id !== '' 

    setIsFormValid(isValid);
  }, [formData]);

  const formatNumber = (num) => {
    if (!num) return num;
    const number = num.replace(/[^\d]/g, '');
    const numberLength = number.lenght;
    if (numberLength < 4) return number;
    if (numberLength < 7) {
      return `(${number.slice(0, 3)}) ${number.slice(3)}`;
    }
    return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(
      6,
      10,
    )}`;
  };

  const tmpDate = (date, tipo) => {
    if (tipo === 'birth') {
      setBirthDate(date);
      setFormData((prevData) => ({
        ...prevData,
        birth_date: birhtDate,
      }));
    } else if (tipo === 'begin') {
      setBeginDate(date);
      setFormData((prevData) => ({
        ...prevData,
        dateBegin: date,
      }));
    }
  };

  const resetPassword = async () => {
    const data = {
      id: id,
      password: 0,
    };
    try {
      const result = await putWithData('users/resetUser/' + id, data);
      if (result) {
        ToastNotify({
          message: 'Password Reseteado y Enviado!',
          position: 'top-center',
        });
      } else {
        ToastNotify({
          message: 'Error al Registrar Nuevo Password',
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error({ message: error });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const ext = getFileExtension(file.name);
    const store = Math.round(file.size / 1024);
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif') {
      if (store <= 2000)
        setImage(file)
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

  return (
    <div className='max-w-6xl p-6 mt-4 text-sm'>
      <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
        <div className='bg-white rounded shadow'>
          <Stepper
            currentStep={stage}
            totalSteps={2}
            onStepClick={handleStepClick}
            stepTexts={['Usuario', 'Permisologia']}
          />
          {!loader ? (
            <>
              {stage == 0 ? (
                <form>
                  <>
                    <div className='  w-full p-4'>
                      <div className='md:flex w-full mb-4 space-x-4'>
                        <div className='md:flex-1 mb-3 p-2 ml-6'>
                          <img
                            className='h-24 w-24 rounded-full border-b-4 border-t-2 border-x-2 border-slate-500'
                            src={formData.image ? formData.image : foto}
                            alt=''
                          />
                          <input
                            type='file'
                            id='url'
                            name='url'
                            onChange={handleFileChange}
                            className='w-full px-3 mt-1 rounded-md text-sm'
                          />
                        </div>
                        <div className='md:flex-1'></div>
                        <div className='  md:flex '>
                          <div className='md:flex-1'>
                            <label className='block text-sm font-medium text-gray-600'>
                              Status:
                            </label>

                            <select
                              name='statu'
                              value={formData.statu}
                              onChange={handleChange}
                              disabled={fieldBlock ? true : false}
                              className='mt-1 p-2 border rounded-md w-30'
                            >
                              <option value='' disabled>
                                Seleccione
                              </option>
                              <option value='Activo'>Activo</option>
                              <option value='Inactivo'>Inactivo</option>
                            </select>
                          </div>
                          <div className='md:flex-1'>
                            <label className='block text-sm font-medium text-gray-600'>
                              Tipo de Usuario:
                            </label>
                            <select
                              name='type_user'
                              value={formData.type_user}
                              onChange={handleChange}
                              disabled={fieldBlock ? true : false}
                              className='mt-1 p-2 border rounded-md w-30'
                            >
                              <option value='' disabled>
                                Seleccione
                              </option>
                              <option value='Colaborador'>Colaborador</option>
                              <option value='Pasante'>Pasante</option>
                              <option value='PNR'>PNR</option>
                              <option value='Retiro'>Retiro</option>
                            </select>
                          </div>
                          <div className='md:flex-1'>
                            <label className='block text-sm font-medium text-gray-600'>
                              Fecha de Creación:
                            </label>
                            <input
                              type='text'
                              name='createdAt'
                              value={formatDate(formData.createdAt)}
                              onChange={handleChange}
                              disabled // Deshabilitar la entrada del usuario
                              className='mt-1 p-2 w-full border rounded-md'
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='  w-full p-4'>
                      <div className='md:flex w-full mb-4 space-x-4'>
                        <div className='md:flex-1 max-w-32 sm:w-full '>
                          <label className='block text-sm font-medium bg-slate-100 text-gray-600 border border-l-blue-950 border-b-blue-950 border-spacing-2 border-transparent border-l-4 '>
                            Datos Principales
                          </label>
                        </div>
                        <div className='md:flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            C.I:
                          </label>
                          <input
                            type='number'
                            name='dni'
                            value={formData.dni}
                            onChange={handleChange}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                        <div className='md:flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            Nombres:
                          </label>
                          <input
                            type='text'
                            name='first_name'
                            value={formData.first_name}
                            onChange={handleChange}
                            disabled={fieldBlock ? true : false}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                        <div className='md:flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            Apellidos:
                          </label>
                          <input
                            type='text'
                            name='last_name'
                            value={formData.last_name}
                            onChange={handleChange}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            disabled={fieldBlock ? true : false}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                      </div>
                    </div>

                    <div className='  w-full p-4'>
                      <div className='md:flex w-full mb-4 space-x-4'>
                        <div className='md:flex-1 max-w-32 sm:w-full '>
                          <label className='block text-sm font-medium bg-slate-100 text-gray-600 border border-l-blue-950 border-b-blue-950 border-spacing-2 border-transparent border-l-4 '>
                            Datos Generales
                          </label>
                        </div>
                        <div className='md:flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            Genero:
                          </label>
                          <select
                            name='gender'
                            value={formData.gender}
                            onChange={handleChange}
                            disabled={fieldBlock ? true : false}
                            className='mt-1 p-2 w-full border rounded-md'
                          >
                            <option value='' disabled>
                              Seleccione
                            </option>
                            <option value='Femenino'>Femenino</option>
                            <option value='Masculino'>Masculino</option>
                          </select>
                        </div>
                        <div className='md:flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            Fecha de Nacimiento
                          </label>
                          <div className='mt-1 p-0.5 w-full border rounded-md border-slate-300'>
                            <DatePicker
                              showWeekNumbers
                              dateFormat='dd/MM/yyyy'
                              //locale='es'
                              showIcon
                              disabled={fieldBlock ? true : false}
                              selected={birhtDate}
                              onChange={(date) => tmpDate(date, 'birth')}
                            />
                          </div>
                        </div>
                        <div className='md:flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            Número Teléfono:
                          </label>
                          <input
                            type='text'
                            name='phone_number'
                            value={formatNumber(formData.phone_number)}
                            onChange={handleChange}
                            disabled={fieldBlock ? true : false}
                            placeholder='(xxx) xxx-xxxx'
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                        <div className='md:flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            Otro Número Teléfono:
                          </label>
                          <input
                            type='text'
                            name='other_phone_number'
                            value={formatNumber(formData.other_phone_number)}
                            onChange={handleChange}
                            disabled={fieldBlock ? true : false}
                            placeholder='(xxx) xxx-xxxx'
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                      </div>
                    </div>
                    <div className='w-full p-4'>
                      <div className='md:flex w-full mb-4 space-x-4'>
                        <div className='md:flex-1 max-w-32 sm:w-full '>
                          <label className='block text-sm font-medium bg-slate-100 text-gray-600 border border-l-blue-950 border-b-blue-950 border-spacing-2 border-transparent border-l-4 '>
                            Datos Corporativos
                          </label>
                        </div>
                        <div className='md:flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            Fecha de Ingreso:
                          </label>
                          <div className='mt-1 p-0.5 w-full border rounded-md border-slate-300'>
                            <DatePicker
                              showWeekNumbers
                              dateFormat='dd/MM/yyyy'
                              //locale='es'
                              showIcon
                              disabled={fieldBlock ? true : false}
                              selected={beginDate}
                              onChange={(date) => tmpDate(date, 'begin')}
                            />
                          </div>
                        </div>
                        <div className='md:flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            Empresa:
                          </label>
                          <Select
                            className='mt-1 w-full border-neutral-50 hover:border-slate-95  rounded-md'
                            defaultValue={{ label: formData.company }}
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
                        <div className='md:flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            Departamento:
                          </label>
                          <Select
                            disabled={fieldBlock ? true : false}
                            className='mt-1 w-full border-neutral-50 hover:border-slate-95  rounded-md'
                            defaultValue={{ label: formData.department }}
                            options={alldepartment.map((data) => ({
                              label: data.department,
                              value: data.id,
                            }))}
                            name='department_id'
                            id='department_id'
                            onChange={(data) =>
                              setFormData({
                                ...formData,
                                department_id: data.value,
                              })
                            }
                            value={alldepartment.find(
                              (option) =>
                                option.value === formData.department_id,
                            )}
                          />
                        </div>

                        <div className='md:flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            Cargo:
                          </label>
                          <Select
                            className='mt-1 w-full border-neutral-50 hover:border-slate-95  rounded-md'
                            defaultValue={{ label: formData.position }}
                            options={allposition.map((data) => ({
                              label: data.position,
                              value: data.id,
                            }))}
                            name='position_id'
                            id='position_id'
                            onChange={(data) =>
                              setFormData({
                                ...formData,
                                position_id: data.value,
                              })
                            }
                            value={allposition.find(
                              (option) => option.value === formData.position_id,
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className='  w-full p-4'>
                      <div className='md:flex w-full mb-4 space-x-4'>
                        <div className='md:flex-1 max-w-32 sm:w-full '>
                          <label className='block text-sm font-medium bg-slate-100 text-gray-600 border border-l-blue-950 border-b-blue-950 border-spacing-2 border-transparent border-l-4 '>
                            Supervisores
                          </label>
                        </div>
                        <div className='md:flex-1'>
                          <label className='block text-sm font-medium text-gray-600 '>
                            Supervisor Directo:
                          </label>
                          <Select
                            className='mt-1 w-full border-neutral-50 hover:border-slate-95  rounded-md'
                            defaultValue={{ label: formData.nameManager }}
                            options={allusers.map((data) => ({
                              label: [
                                data.first_name +
                                  ' ' +
                                  data.last_name +
                                  ' ' +
                                  data.company.company,
                              ],
                              value: data.id,
                            }))}
                            name='direct_boss_id'
                            id='direct_boss_id'
                            onChange={(data) =>
                              setFormData({
                                ...formData,
                                direct_boss_id: data.value,
                              })
                            }
                            value={allusers.find(
                              (option) =>
                                option.value === formData.direct_boss_id,
                            )}
                          />
                        </div>
                        <div className='md:flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            Supervisor Funcional:
                          </label>
                          <Select
                            className='mt-1 w-full border-neutral-50 hover:border-slate-95  rounded-md'
                            defaultValue={{
                              label: formData.nameFuncional,
                            }}
                            options={allusers.map((data) => ({
                              label: [
                                data.first_name +
                                  ' ' +
                                  data.last_name +
                                  ' ' +
                                  data.company.company,
                              ],
                              value: data.id,
                            }))}
                            name='functional_boss_id'
                            id='functional_boss_id'
                            onChange={(data) =>
                              setFormData({
                                ...formData,
                                functional_boss_id: data.value,
                              })
                            }
                            value={allusers.find(
                              (option) =>
                                option.value === formData.functional_boss_id,
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    <div className='w-full p-4'>
                      <div className='md:flex w-full mb-4'>
                        <div className='md:flex-1 max-w-32 sm:w-full '>
                          <label className='block text-sm font-medium bg-slate-100 text-gray-600 border border-l-blue-950 border-b-blue-950 border-spacing-2 border-transparent border-l-4 '>
                            Ubicación
                          </label>
                        </div>
                        <div className='md:flex-none min-w-60 ml-4'>
                          <label className='block text-sm font-medium text-gray-600'>
                            Correo Electrónico:
                          </label>
                          <input
                            type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            disabled={fieldBlock ? true : false}
                            className='mt-1 p-2 min-w-60 sm:w-full border rounded-md'
                          />
                        </div>
                        <div className='md:flex-none min-w-50 ml-4'>
                          <label className='block text-sm font-medium text-gray-600'>
                            Facilidad Asignado:
                          </label>
                          <Select
                            className='mt-1 w-full border-neutral-50 hover:border-slate-95  rounded-md'
                            defaultValue={{ label: formData.facility }}
                            options={allfacility.map((data) => ({
                              label: data.name,
                              value: data.id,
                            }))}
                            name='facility_id'
                            id='facility_id'
                            onChange={(data) =>
                              setFormData({
                                ...formData,
                                facility_id: data.value,
                              })
                            }
                            value={allfacility.find(
                              (option) => option.value === formData.facility_id,
                            )}
                          />
                        </div>
                        <div className='md:flex-1 ml-4'>
                          <label className='block text-sm font-medium text-gray-600'>
                            Dirección:
                          </label>
                          <input
                            type='text'
                            name='address'
                            value={formData.address}
                            onChange={handleChange}
                            disabled={fieldBlock ? true : false}
                            className='mt-1 p-2 border rounded-md sm:w-full'
                          />
                        </div>
                      </div>
                    </div>
                    <div className='flex justify-end bg-white border rounded shadow p-4'>
                      <button
                        type='button'
                        onClick={() => submit()}
                        className={`bg-gray-800 text-white px-4 py-2 rounded-md ${
                          !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={!isFormValid}
                      >
                        {btnSave ? 'Guardar' : 'Actualizar'}
                      </button>
                      <button
                        type='button'
                        onClick={() => resetPassword()}
                        className={` ml-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-rose-600 ${
                          !isFormValid
                            ? 'ml-2 opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        disabled={!isFormValid}
                        hidden={btnSave ? true : false}
                      >
                        Reset Password
                      </button>
                    </div>
                  </>
                </form>
              ) : (
                <>
                  <form>
                    <h1 className='text-1xl font-bold mb-3 p-4'>
                      Permisologia General:
                    </h1>

                    <div className='  w-full p-4'>
                      <div className='flex w-full mb-4 space-x-4'>
                      <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                          can_access_config 
                          </label>
                       
                          <input
                            type='checkbox'
                            name='can_access_config'
                            checked={permisologyGeneralFormData.can_access_config}
                            onChange={handleChangeGeneralPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />

                          <label className='block text-sm font-medium text-gray-600'>
                          (acceder al modulo de usuarios)
                          </label>


                        </div>

                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_create_user:
                          </label>
                          <input
                            type='checkbox'
                            name='can_create_user'
                            checked={permisologyGeneralFormData.can_create_user}
                            onChange={handleChangeGeneralPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_edit_user:
                          </label>
                          <input
                            type='checkbox'
                            name='can_edit_user'
                            checked={permisologyGeneralFormData.can_edit_user}
                            onChange={handleChangeGeneralPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_delete_user:
                          </label>
                          <input
                            type='checkbox'
                            name='can_delete_user'
                            checked={permisologyGeneralFormData.can_delete_user}
                            onChange={handleChangeGeneralPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                      </div>

                      <button
                        type='button'
                        onClick={() => submitPermisology('PermisolgyGeneral')}
                        className={`bg-gray-800 text-white px-4 py-2 rounded-md `}
                      >
                        Guardar
                      </button>
                      <div className='border w-full mt-4'> </div>
                    </div>

                    <h1 className='text-1xl font-bold mb-3 p-4'>
                      Modulo Purchases:
                    </h1>

                    <div className='  w-full p-4'>
                      <div className='flex w-full mb-4 space-x-4'>
                      <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                          can_access_purchase:
                          </label>
                          <input
                            type='checkbox'
                            name='can_access_purchase'
                            checked={
                              PermisologyPurchaseFormData.can_access_purchase
                            }
                            onChange={handleChangePurchasePermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />

                        <label className='block text-sm font-medium text-gray-600'>
                        (acceder al modulo) 
                          </label>


                        </div>


                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_create_purchase:
                          </label>
                          <input
                            type='checkbox'
                            name='can_create_purchase'
                            checked={
                              PermisologyPurchaseFormData.can_create_purchase
                            }
                            onChange={handleChangePurchasePermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_delete_purchase:
                          </label>
                          <input
                            type='checkbox'
                            name='can_delete_purchase'
                            checked={
                              PermisologyPurchaseFormData.can_delete_purchase
                            }
                            onChange={handleChangePurchasePermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                      </div>
                      <div className='flex w-full mb-4 space-x-4'>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_create_cost_center:
                          </label>
                          <input
                            type='checkbox'
                            name='can_create_cost_center'
                            checked={
                              PermisologyPurchaseFormData.can_create_cost_center
                            }
                            onChange={handleChangePurchasePermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_delete_cost_center:
                          </label>
                          <input
                            type='checkbox'
                            name='can_delete_cost_center'
                            checked={
                              PermisologyPurchaseFormData.can_delete_cost_center
                            }
                            onChange={handleChangePurchasePermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                      </div>
                      <div className='flex w-full mb-4 space-x-4'>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_create_aprobador:
                          </label>
                          <input
                            type='checkbox'
                            name='can_create_aprobador'
                            checked={
                              PermisologyPurchaseFormData.can_create_aprobador
                            }
                            onChange={handleChangePurchasePermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_delete_aprobador:
                          </label>
                          <input
                            type='checkbox'
                            name='can_delete_aprobador'
                            checked={
                              PermisologyPurchaseFormData.can_delete_aprobador
                            }
                            onChange={handleChangePurchasePermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                      </div>

                      <div className='flex w-full mb-4 space-x-4'>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_create_cuenta_contable:
                          </label>
                          <input
                            type='checkbox'
                            name='can_create_cuenta_contable'
                            checked={
                              PermisologyPurchaseFormData.can_create_cuenta_contable
                            }
                            onChange={handleChangePurchasePermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_delete_cuenta_contable:
                          </label>
                          <input
                            type='checkbox'
                            name='can_delete_cuenta_contable'
                            checked={
                              PermisologyPurchaseFormData.can_delete_cuenta_contable
                            }
                            onChange={handleChangePurchasePermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                      </div>
                      <div className='flex w-full mb-4 space-x-4'>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                          compras_user:
                          </label>
                          <input
                            type='checkbox'
                            name='compras_user'
                            checked={
                              PermisologyPurchaseFormData.compras_user
                            }
                            onChange={handleChangePurchasePermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
               
                      </div>
                      <button
                        type='button'
                        onClick={() => submitPermisology('PermisologyPurchase')}
                        className={`bg-gray-800 text-white px-4 py-2 rounded-md `}
                      >
                        Guardar
                      </button>
                      <div className='border w-full mt-4'> </div>
                    </div>

                    <h1 className='text-1xl font-bold mb-3 p-4'>
                      Modulo Legal:
                    </h1>

                    <div className='  w-full p-4'>
                      <div className='flex w-full mb-4 space-x-4'>
                      <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                          can_access_legal:
                          </label>
                          <input
                            type='checkbox'
                            name='can_access_legal'
                            checked={PermisologyLegalFormData.can_access_legal}
                            onChange={handleChangeLegalPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                          <label className='block text-sm font-medium text-gray-600'>
                          (acceder al modulo)
                          </label>



                        </div>


                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_access_config:
                          </label>
                          <input
                            type='checkbox'
                            name='can_access_config'
                            checked={PermisologyLegalFormData.can_access_config}
                            onChange={handleChangeLegalPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_access_form:
                          </label>
                          <input
                            type='checkbox'
                            name='can_access_form'
                            checked={PermisologyLegalFormData.can_access_form}
                            onChange={handleChangeLegalPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_access_list_all_companys:
                          </label>
                          <input
                            type='checkbox'
                            name='can_access_list_all_companys'
                            checked={
                              PermisologyLegalFormData.can_access_list_all_companys
                            }
                            onChange={handleChangeLegalPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>

                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_access_list_my_company:
                          </label>
                          <input
                            type='checkbox'
                            name='can_access_list_my_company'
                            checked={
                              PermisologyLegalFormData.can_access_list_my_company
                            }
                            onChange={handleChangeLegalPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                      </div>

                      <div className='flex w-full mb-4 space-x-4'>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_access_logs:
                          </label>
                          <input
                            type='checkbox'
                            name='can_access_logs'
                            checked={PermisologyLegalFormData.can_access_logs}
                            onChange={handleChangeLegalPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>

                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_access_category:
                          </label>
                          <input
                            type='checkbox'
                            name='can_access_category'
                            checked={
                              PermisologyLegalFormData.can_access_category
                            }
                            onChange={handleChangeLegalPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>

                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_category_create:
                          </label>
                          <input
                            type='checkbox'
                            name='can_category_create'
                            checked={
                              PermisologyLegalFormData.can_category_create
                            }
                            onChange={handleChangeLegalPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>

                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_category_update:
                          </label>
                          <input
                            type='checkbox'
                            name='can_category_update'
                            checked={
                              PermisologyLegalFormData.can_category_update
                            }
                            onChange={handleChangeLegalPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                      </div>

                      <div className='flex w-full mb-4 space-x-4'>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_storage_create:
                          </label>
                          <input
                            type='checkbox'
                            name='can_storage_create'
                            checked={
                              PermisologyLegalFormData.can_storage_create
                            }
                            onChange={handleChangeLegalPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>

                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_storage_update:
                          </label>
                          <input
                            type='checkbox'
                            name='can_storage_update'
                            checked={
                              PermisologyLegalFormData.can_storage_update
                            }
                            onChange={handleChangeLegalPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>

                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_storage_list:
                          </label>
                          <input
                            type='checkbox'
                            name='can_storage_list'
                            checked={PermisologyLegalFormData.can_storage_list}
                            onChange={handleChangeLegalPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>

                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_storage_delete:
                          </label>
                          <input
                            type='checkbox'
                            name='can_storage_delete'
                            checked={
                              PermisologyLegalFormData.can_storage_delete
                            }
                            onChange={handleChangeLegalPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                      </div>
                      <div className='flex w-full mb-4 space-x-4'>
                        <div className='flex-1'>
                          <label className='block text-sm font-medium text-gray-600'>
                            can_storage_show_deletes:
                          </label>
                          <input
                            type='checkbox'
                            name='can_storage_show_deletes'
                            checked={
                              PermisologyLegalFormData.can_storage_show_deletes
                            }
                            onChange={handleChangeLegalPermisology}
                            // maxLength={100}
                            // disabled={formData.stage === 1}
                            className='mt-1 p-2 w-full border rounded-md'
                          />
                        </div>
                      </div>

                      <button
                        type='button'
                        onClick={() => submitPermisology('PermisologyLegal')}
                        className={`bg-gray-800 text-white px-4 py-2 rounded-md `}
                      >
                        Guardar
                      </button>

                      <div className='border w-full mt-4'> </div>
                    </div>
                  </form>
                </>
              )}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserForm;
