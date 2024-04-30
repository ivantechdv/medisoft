import { useEffect, useState } from 'react';
import { useUser } from '../../../../context/userContext';
import { putWithData, show } from '../../../../api';
import { Link } from 'react-router-dom';
import { validatePassword } from '../../../../api';
import { GrValidate } from 'react-icons/gr';
import { BsCheck2 } from "react-icons/bs";
import { LuView } from "react-icons/lu";

import ToastNotify from '../../../../components/toaster/toaster';
import Stepper from '../../../../components/stepper/stepper';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import foto from '../../../../img/user-bg.png';

function MyProfile() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    id: ``,
    username: ``,
    email: ``,
    password: ``,
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
  });

  const [allfacility, setAllfacility] = useState([]);
  const [birhtDate, setBirthDate] = useState();
  const [beginDate, setBeginDate] = useState();
  const [edit, setEdit] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState(true);
  const [miclave, setMiclave] = useState();
  const [validaNewPass, setValidaNewPass] = useState(true);
  const [btnCambia, setBtnCambia] = useState(true);
  const [newPassword, setNewPassword] = useState({
    newpassword: '',
    valpassword: '',
  });
  const [charLong, setScharLong] = useState(false);
  const [charUp, setCharUp] = useState(false);
  const [charDown, setCharDown] = useState(false);
  const [charnumero, setChartNumero] = useState(false);
  const [charespecial, setChartEspecial] = useState(false);
  const [charcompara, setCharcompara] = useState(false)
  const [btnCheck, setBtnCheck] = useState(true)

  useEffect(() => {
    if (user) {
      setBirthDate(new Date());
      setBeginDate(new Date());
      getFacility();
      getUserById();
    }
  }, []);

  async function getUserById() {
    try {
      const response = await show('users/getUserById/' + user.id);
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
      }
    } catch (error) {
      console.error('Error al obtener la solicitud por ID:', error);
    }
  }

  async function getFacility() {
    const response = await show('facilities/getAllFacilities');
    setAllfacility(response.data);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(birhtDate);
    setFormData((prevData) => ({
      ...prevData,
      birth_date: birhtDate,
      facility_id: formData.facility_id,
      phone_number: formData.phone_number,
      other_phone_number: formData.other_phone_number,
      [name]: value,
    }));
  };

  async function update() {
    let form = formData;
    try {
      const response = await putWithData('users/putUser/' + user.id, form);
      if (response) {
        ToastNotify({ message: 'Actualizado', position: 'top-right' });
      }
    } catch (error) {
      console.error({ message: error });
    }
  }

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
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const verify = async () => {
    const data = {
      email: formData.email,
      password: miclave,
      from: 'User',
    };
    try {
      const resp = await validatePassword(data);
      if (resp.success === true) {
        ToastNotify({ message: 'Confirmado', position: 'top-center' });
        setVerifyPassword(false);
      } else {
        ToastNotify({ message: 'Confirmación Errada', position: 'top-center' });
        setVerifyPassword(true);
      }
    } catch (error) {
      console.error({ message: error });
    }
  };

  const handNewPassword = (e) => {
    const { name, value } = e.target;

    if(name === 'newpassword') {
      const valor = e.target.value;

      if(valor === miclave) 
      setCharcompara(false)
      else if(valor != miclave)
      setCharcompara(true)

      if (valor.length > 8) {
        setScharLong(true);
      }
      if (valor.length < 8) {
        setScharLong(false);
      }
  
      if (
        valor.includes(0) ||
        valor.includes(1) ||
        valor.includes(2) ||
        valor.includes(3) ||
        valor.includes(4) ||
        valor.includes(5) ||
        valor.includes(6) ||
        valor.includes(7) ||
        valor.includes(8) ||
        valor.includes(9)
      )
        setChartNumero(true);
      else if (
        !valor.includes(0) ||
        !valor.includes(1) ||
        !valor.includes(2) ||
        !valor.includes(3) ||
        !valor.includes(4) ||
        !valor.includes(5) ||
        !valor.includes(6) ||
        !valor.includes(7) ||
        !valor.includes(8) ||
        !valor.includes(9)
      )
        setChartNumero(false);
  
      if (
        valor.includes('*') ||
        valor.includes('-') ||
        valor.includes('-') ||
        valor.includes('_') ||
        valor.includes('@') ||
        valor.includes('#') ||
        valor.includes('$') ||
        valor.includes('%') ||
        valor.includes('+')
      )
        setChartEspecial(true);
      else if (
        !valor.includes('*') ||
        !valor.includes('-') ||
        !valor.includes('-') ||
        !valor.includes('_') ||
        !valor.includes('@') ||
        !valor.includes('#') ||
        !valor.includes('$') ||
        !valor.includes('%') ||
        !valor.includes('+')
      )
        setChartEspecial(false);
  
      if (
        valor.includes('A') ||
        valor.includes('B') ||
        valor.includes('C') ||
        valor.includes('D') ||
        valor.includes('E') ||
        valor.includes('F') ||
        valor.includes('G') ||
        valor.includes('H') ||
        valor.includes('I') ||
        valor.includes('J') ||
        valor.includes('K') ||
        valor.includes('L') ||
        valor.includes('M') ||
        valor.includes('N') ||
        valor.includes('Ñ') ||
        valor.includes('O') ||
        valor.includes('P') ||
        valor.includes('Q') ||
        valor.includes('R') ||
        valor.includes('S') ||
        valor.includes('T') ||
        valor.includes('U') ||
        valor.includes('V') ||
        valor.includes('W') ||
        valor.includes('X') ||
        valor.includes('Y') ||
        valor.includes('Z')
      )
        setCharUp(true);
      else if (
        !valor.includes('A') ||
        !valor.includes('B') ||
        !valor.includes('C') ||
        !valor.includes('D') ||
        !valor.includes('E') ||
        !valor.includes('F') ||
        !valor.includes('G') ||
        !valor.includes('H') ||
        !valor.includes('I') ||
        !valor.includes('J') ||
        !valor.includes('K') ||
        !valor.includes('L') ||
        !valor.includes('M') ||
        !valor.includes('N') ||
        !valor.includes('Ñ') ||
        !valor.includes('O') ||
        !valor.includes('P') ||
        !valor.includes('Q') ||
        !valor.includes('R') ||
        !valor.includes('S') ||
        !valor.includes('T') ||
        !valor.includes('U') ||
        !valor.includes('V') ||
        !valor.includes('W') ||
        !valor.includes('X') ||
        !valor.includes('Y') ||
        !valor.includes('Z')
      )
        setCharUp(false);
  
      if (
        valor.includes('a') ||
        valor.includes('b') ||
        valor.includes('c') ||
        valor.includes('c') ||
        valor.includes('e') ||
        valor.includes('f') ||
        valor.includes('g') ||
        valor.includes('h') ||
        valor.includes('i') ||
        valor.includes('j') ||
        valor.includes('k') ||
        valor.includes('l') ||
        valor.includes('m') ||
        valor.includes('n') ||
        valor.includes('ñ') ||
        valor.includes('o') ||
        valor.includes('p') ||
        valor.includes('q') ||
        valor.includes('r') ||
        valor.includes('s') ||
        valor.includes('t') ||
        valor.includes('u') ||
        valor.includes('v') ||
        valor.includes('w') ||
        valor.includes('x') ||
        valor.includes('y') ||
        valor.includes('z')
      )
        setCharDown(true);
      else if (
        !valor.includes('a') ||
        !valor.includes('b') ||
        !valor.includes('c') ||
        !valor.includes('c') ||
        !valor.includes('e') ||
        !valor.includes('f') ||
        !valor.includes('g') ||
        !valor.includes('h') ||
        !valor.includes('i') ||
        !valor.includes('j') ||
        !valor.includes('k') ||
        !valor.includes('l') ||
        !valor.includes('m') ||
        !valor.includes('n') ||
        !valor.includes('ñ') ||
        !valor.includes('o') ||
        !valor.includes('p') ||
        !valor.includes('q') ||
        !valor.includes('r') ||
        !valor.includes('s') ||
        !valor.includes('t') ||
        !valor.includes('u') ||
        !valor.includes('v') ||
        !valor.includes('w') ||
        !valor.includes('x') ||
        !valor.includes('y') ||
        !valor.includes('z')
      )
        setCharDown(false);

        if(charDown && charLong && charUp && charcompara && charespecial && charnumero) {
          setValidaNewPass(false);
          setNewPassword({ newpassword: value });
        } else if(!charDown || !charLong || !charUp || !charcompara || !charespecial || !charnumero) {
          setValidaNewPass(true);
        }
    }

    if (name === 'valpassword') {
      if (newPassword.newpassword === value) {
        setNewPassword({ ...newPassword, valpassword: value });
        setBtnCambia(false);
      } else setBtnCambia(true);
    }
  };

  const updatePassword = async () => {
    const data = {
      id: user.id,
      password: newPassword.newpassword,
    };
    try {
      const response = await putWithData(
        'users/changePassword/' + data.id,
        data,
      );
      if (response) {
        ToastNotify({
          message: 'Nuevo Password Registrado con Exito!',
          position: 'top-center',
        });
        setBtnCambia(true);
      } else
        ToastNotify({
          message: 'Error al Registrar Nuevo Password',
          position: 'top-center',
        });
    } catch (error) {
      console.error({ message: error });
    }
  };

  return (
    <div className='max-w-6xl mx-auto p-6 mt-6 text-sm'>
      <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
        <div className='bg-white rounded shadow'>
          <Stepper totalSteps={1} stepTexts={['Mi Perfil']} />
          <div className='  w-full p-4'>
            <div className='md:flex w-full mb-4 space-x-4  justify-between'>
            <img className='h-24 w-24 rounded-full border-b-4 border-t-2 border-x-2 border-slate-500' src={formData.image ? formData.image : foto}/>
              <div className='  md:flex '>
                <div className='md:flex-1'>
                  <label className='block text-sm font-medium text-gray-600'>
                    Status:
                  </label>
                  <input
                    name='statu'
                    value={formData.statu}
                    disabled
                    className='mt-1 p-2 border rounded-md w-30 bg-stone-50'
                  />
                </div>

                <div className='md:flex-1'>
                  <label className='block text-sm font-medium text-gray-600'>
                    Fecha de Creación:
                  </label>
                  <input
                    type='text'
                    name='createdAt'
                    value={dayjs(formData.createdAt).format('DD/MM/YYYY')}
                    disabled // Deshabilitar la entrada del usuario
                    className='mt-1 p-2 w-full border rounded-md bg-stone-50'
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
                <div className='mt-1 p-2 w-full border rounded-md bg-stone-50'>
                  <label>{formData.dni}</label>
                </div>
              </div>
              <div className='md:flex-1'>
                <label className='block text-sm font-medium text-gray-600'>
                  Nombres:
                </label>
                <input
                  type='text'
                  name='first_name'
                  value={formData.first_name}
                  disabled
                  className='mt-1 p-2 w-full border rounded-md bg-stone-50'
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
                  disabled
                  className='mt-1 p-2 w-full border rounded-md bg-stone-50'
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
                <input
                  type='text'
                  name='gender'
                  value={formData.gender}
                  disabled
                  className='mt-1 p-2 w-full border rounded-md bg-stone-50'
                />
              </div>
              <div className='md:flex-1'>
                <label className='block text-sm font-medium text-gray-600'>
                  Fecha de Nacimiento
                </label>
                <div
                  className={
                    edit
                      ? 'mt-1 p-0.5  w-full border rounded-md bg-stone-50'
                      : 'mt-1 p-0.5 w-full border rounded-md'
                  }
                >
                  <DatePicker
                    showWeekNumbers
                    dateFormat='dd/MM/yyyy'
                    locale='es'
                    showIcon
                    disabled={edit ? true : false}
                    selected={birhtDate}
                    onChange={(date) => tmpDate(date, 'birth')}
                    name='birth_date'
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
                  defaultValue={formatNumber(formData.phone_number)}
                  onChange={handleChange}
                  disabled={edit ? true : false}
                  placeholder='(xxx) xxx-xxxx'
                  className={
                    edit
                      ? 'mt-1 p-2 w-full border rounded-md bg-stone-50'
                      : 'mt-1 p-2 w-full border rounded-md'
                  }
                />
              </div>
              <div className='md:flex-1'>
                <label className='block text-sm font-medium text-gray-600'>
                  Otro Número Teléfono:
                </label>
                <input
                  type='text'
                  name='other_phone_number'
                  defaultValue={formatNumber(formData.other_phone_number)}
                  onChange={handleChange}
                  disabled={edit ? true : false}
                  maxLength={20}
                  placeholder='(xxx) xxx-xxxx'
                  className={
                    edit
                      ? 'mt-1 p-2 w-full border rounded-md bg-stone-50'
                      : 'mt-1 p-2 w-full border rounded-md'
                  }
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
                <div
                  className={
                    edit
                      ? 'mt-1 p-0.5  w-full border rounded-md bg-stone-50'
                      : 'mt-1 p-0.5 w-full border rounded-md'
                  }
                >
                  <DatePicker
                    showWeekNumbers
                    dateFormat='dd/MM/yyyy'
                    locale='es'
                    showIcon
                    disabled
                    selected={beginDate}
                    onChange={(date) => setBeginDate(date)}
                    name='dateBegin'
                  />
                </div>
              </div>
              <div className='md:flex-1'>
                <label className='block text-sm font-medium text-gray-600'>
                  Empresa:
                </label>
                <input
                  type='text'
                  name='company'
                  value={formData.company}
                  disabled
                  className='mt-1 p-2 w-full border rounded-md bg-stone-50'
                />
              </div>
              <div className='md:flex-1'>
                <label className='block text-sm font-medium text-gray-600'>
                  Departamento:
                </label>
                <input
                  type='text'
                  name='department'
                  value={formData.department}
                  disabled
                  className='mt-1 p-2 w-full rounded-md border bg-stone-50'
                />
              </div>
              <div className='md:flex-1'>
                <label className='block text-sm font-medium text-gray-600'>
                  Cargo:
                </label>
                <input
                  type='text'
                  name='position'
                  value={formData.position}
                  disabled
                  className='mt-1 p-2 w-full rounded-md border bg-stone-50'
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
                <input
                  name='position'
                  value={formData.nameManager}
                  disabled
                  className='mt-1 p-2 w-full rounded-md border bg-stone-50'
                />
              </div>
              <div className='md:flex-1'>
                <label className='block text-sm font-medium text-gray-600'>
                  Supervisor Funcional:
                </label>
                <input
                  name='position'
                  value={formData.nameFuncional}
                  disabled
                  className='mt-1 p-2 w-full rounded-md border bg-stone-50'
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
                  disabled
                  className='mt-1 p-2 min-w-60 sm:w-full border rounded-md bg-stone-50'
                />
              </div>
              <div className='md:flex-none min-w-50 ml-4'>
                <label className='block text-sm font-medium text-gray-600'>
                  Facilidad Asignado:
                </label>
                {edit ? (
                  <input
                    type='email'
                    name='facility'
                    value={formData.facility}
                    disabled
                    className='mt-1 p-2 min-w-60 sm:w-full border rounded-md bg-stone-50'
                  />
                ) : (
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
                )}
              </div>
              <div className='md:flex-1 ml-4'>
                <label className='block text-sm font-medium text-gray-600'>
                  Dirección:
                </label>
                <input
                  type='text'
                  name='address'
                  defaultValue={formData.address}
                  onChange={handleChange}
                  disabled={edit ? true : false}
                  className={
                    edit
                      ? 'mt-1 p-2 w-full border rounded-md bg-stone-50'
                      : 'mt-1 p-2 w-full border rounded-md'
                  }
                />
              </div>
            </div>
          </div>
          <div className='flex justify-end bg-white border rounded shadow p-4'>
            <button
              type='button'
              className='py-2 px-4 text-sm bg-gray-500 text-white cursor-pointer font-bold rounded ml-4 hover:bg-blue-900'
              hidden={edit ? false : true}
              onClick={() => {
                edit ? setEdit(false) : setEdit(true);
              }}
            >
              Editar
            </button>
            <button
              className='py-2 px-4 text-sm bg-gray-500 text-white cursor-pointer font-bold rounded ml-4 hover:bg-blue-900'
              onClick={() => update()}
              hidden={edit ? true : false}
            >
              Guardar
            </button>
            <button
              className='py-2 px-4 text-sm bg-gray-500 text-white cursor-pointer font-bold rounded ml-4 hover:bg-blue-900'
              onClick={() => openModal()}
            >
              Cambio Clave
            </button>
            <button className='py-2 px-4 text-sm bg-gray-500 text-white cursor-pointer font-bold rounded ml-4 hover:bg-blue-900'>
              <Link to={'/Home'}>Cerrar</Link>
            </button>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center '>
          <div className='bg-white p-6 rounded shadow-lg w-1/2'>
            <Stepper totalSteps={1} stepTexts={['Cambio de Password']} />
            {/* Formulario para el nuevo elemento */}
            <div className=' mt-4 md:grid md:grid-cols-2 gap-5'>
              <div className='md:p-2 md:col-span-1 sm:rounded-lg p-2'>
                <label className='text-gray-700'>Password Actual:</label>
                <input
                  type='password'
                  id='password'
                  name='password'
                  onChange={(e) => setMiclave(e.target.value)}
                  className='w-60 h-8 px-3 ml-4 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
                <button
                  className={
                    verifyPassword
                      ? ' ml-4 text-lg text-red-600 bold '
                      : ' ml-4 text-lg transition-all text-green-600 bold '
                  }
                  onClick={() => verify()}
                >
                  <GrValidate />
                </button>
              </div>
              <div className='md:col-span-1 sm:rounded-lg p-2 '></div>
              <div className='md:col-span-1 sm:rounded-lg p-2 '>
                <label className='text-gray-700'>Nuevo Password:</label>
                <input
                  type={btnCheck ? 'password' : 'text'}
                  id='newpassword'
                  name='newpassword'
                  onChange={handNewPassword}
                  disabled={verifyPassword ? true : false}
                  className='w-60 h-8 px-3 ml-4 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
                <button
                  className='ml-1 text-lg bold '
                  onClick={() => setBtnCheck(!btnCheck)}
                >
                  <LuView />
                </button>
              </div>
              <div className='md:col-span-1 sm:rounded-lg p-2 '>
                <label className='text-gray-700'>Valide Password:</label>
                <input
                  type='password'
                  id='valpassword'
                  name='valpassword'
                  onChange={handNewPassword}
                  disabled={validaNewPass}
                  className='w-60 h-8 px-3 ml-4 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
              <div className='md:col-span-1 sm:rounded-lg p-2 '>
                <ul className='md:flex ml-6'>
                  <p className={charUp ? 'ml-2 text-lime-700' : 'ml-2 text-gray-200'}><BsCheck2 /></p>
               <label
                    className={
                      charUp ? 'ml-2 text-gray-700' : 'ml-2 text-gray-200'
                    }
                  >
                   Letra Mayuscula
                  </label>
                </ul>

                <ul className='md:flex ml-6'>
                  <p className={charUp ? 'ml-2 text-lime-700' : 'ml-2 text-gray-200'}><BsCheck2 /></p>
                  <label
                    className={
                      charDown ? 'ml-2 text-gray-700' : 'ml-2 text-gray-200'
                    }
                  >
                    Letra Miniscula
                  </label>
                </ul>
                <ul className='md:flex ml-6'>
                  <p className={charUp ? 'ml-2 text-lime-700' : 'ml-2 text-gray-200'}><BsCheck2 /></p>
                  <label
                    className={
                      charnumero ? 'ml-2 text-gray-700' : 'ml-2 text-gray-200'
                    }
                  >
                    Número
                  </label>
                </ul>
                <ul className='md:flex ml-6'>
                  <p className={charUp ? 'ml-2 text-lime-700' : 'ml-2 text-gray-200'}><BsCheck2 /></p>
                  <label
                    className={
                      charespecial ? 'ml-2 text-gray-700' : 'ml-2 text-gray-200'
                    }
                  >
                    Caracter Especial: * / - _ @ # $ % +
                  </label>
                </ul>
                <ul className='md:flex ml-6'>
                  <p className={charUp ? 'ml-2 text-lime-700' : 'ml-2 text-gray-200'}><BsCheck2 /></p>
                  <label
                    className={
                      charLong ? 'ml-2 text-gray-700' : 'ml-2 text-gray-200'
                    }
                  >
                    Logitud Minimo 11 Caracteres
                  </label>
                </ul>
                <ul className='md:flex ml-6'>
                  <p className={charcompara ? 'ml-2 text-lime-700' : 'ml-2 text-gray-200'}><BsCheck2 /></p>
                  <label
                    className={
                      charcompara ? 'ml-2 text-gray-700' : 'ml-2 text-gray-200'
                    }
                  >
                    No Igual a Anterior
                  </label>
                </ul>
              </div>
              <div className='md:col-span-1 sm:rounded-lg p-2 '></div>
              <div className='md:col-span-1 sm:rounded-lg p-2 '></div>
              <div className='md:col-span-1 sm:rounded-lg p-2'>
                <button
                  type='button'
                  className={
                    btnCambia
                      ? 'opacity-50 cursor-not-allowed'
                      : 'text-white bg-lime-700 cursor-pointer font-bold py-2 px-4 rounded hover:bg-red-700 hover:text-white'
                  }
                  onClick={() => updatePassword()}
                  disabled={btnCambia}
                >
                  Cambiar
                </button>
                <button
                  className='py-2 px-4 text-sm bg-gray-500 text-white cursor-pointer font-bold rounded ml-4 hover:bg-blue-900'
                  onClick={closeModal}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProfile;
