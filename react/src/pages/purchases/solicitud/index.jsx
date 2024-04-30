import React, { useState, useEffect } from 'react';
import { useUser } from '../../../context/userContext';
import {
  show,
  postAttachment,
  deleteAttachment,
  postWithData,
  putWithData,
  select,
  deleteById,
} from '../../../api';
import Stepper from '../../../components/stepper/stepper';
import { FaEdit, FaMinusCircle, FaPlusCircle, FaTrash  } from 'react-icons/fa';
// import CustomStepper from 'react-form-stepper'; // Cambia el nombre del componente importado a CustomStepper, por ejemplo

import ToastNotify from '../../../components/toaster/toaster';
import ItemsList from './ItemsList';
import AttachmentHandler from '../../../components/AttachmentHandler/AttachmentHandler';
import './solicitud.css';
import { Link, Navigate, redirect, useParams } from 'react-router-dom'; // Importa useParams desde react-router-dom



function SolicitudForm() {
  const { id } = useParams(); // Obtiene el parámetro de la URL

  const { user } = useUser();
  
  let date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  date = `${day}/${month}/${year}`;
  const [users, setUsers] = useState([]);
  const [usersLoader, setUsersLoader] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isCreate, setIscreate] = useState(true); //habilita los campos del formulario inicial
  const [showStage, setShowStage] = useState(0);

  const [showInternalButton, setShowInternalButton] = useState(true);
  const [formData, setFormData] = useState({
    creator_name: ``,
    creator_username: ``,
    creator_id: ``,
    creator_company_id: 0,
    created: date,
    created_new_date: new Date(),
    company_id: 0,
    req_name: '',
    delivery_date: '',
    attachment_url: '',
    comments: '',
    stage: 0,
    aprobator1Id: 0,
  });

  const [IsFormAprobacionDataValid, setIsFormAprobacionDataValid] =
    useState(false);

  const [formAprobacionData, setFormAprobacionData] = useState({
    creator_name: '',
    creator_username: '',
    creator_id: 0,
    created: date,
    created_new_date: new Date(),
    comments: '',
    response: '',
    changedExistence: '',
    purchase_solicitud_id: '',
  });

  // if (user == null){

  // }else{
  //  setFormAprobacionData({
  //     creator_name: user.first_name + ' ' + user.last_name ,
  //     creator_username: user.email,
  //     creator_id: user.id,
  //     created: date,
  //     created_new_date: new Date(),
  //     comments: '',
  //     response: '',
  //     changedExistence: false,
  //     purchase_solicitud_id: id,
  //   });
  // }

  const [isFormValid, setIsFormValid] = useState(false);
  const [items, setItems] = useState([
    {
      id: Date.now(), // Utilizar un timestamp como id
      item_name: '',
      quantity: 0,
      unit_measure: '',
      description: '',
      attachment_url: '',
      cost_center: '',
    },
  ]);
  const [submitedItems, setSubmitedItems] = useState([]);
  const [ExistSubmitedItems, setExistSubmitedItems] = useState(false);

  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [validApprover, setValidApprover] = useState(false);
  const MAX_ITEMS = 10;
  const [enableItems, setEnableItems] = useState(false);
  const [isComprasUser, setComprasUser] = useState(false)
  const [providers, setProviders] = useState([])
  const [originalProviders, setOriginalProviders] = useState([])
  const [providerCategories, setProvidersCategories] = useState([])
  const [itemsByProviders, setItemsByProviders] = useState([])
  const [selectedItem, setSelectedItem] = useState(null); // Estado para mantener el ítem seleccionado
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectionStage, setSelectionStage] = useState(0)
  // Función para manejar el clic en un ítem
 
    // Estado para almacenar si los subítems de cada proveedor están visibles o no
    const [showItemsByProvider, setShowItemsByProvider] = useState({});

    // Función para manejar el clic en el botón "Mostrar más"
    const handleShowItemsClick = (providerName) => {
      setShowItemsByProvider({
        ...showItemsByProvider,
        [providerName]: !showItemsByProvider[providerName], // Alternar el estado de visibilidad
      });
    };


  const handleItemClick = (clickedItem) => {
    const updatedItems = submitedItems.map(item => {
      if (item.id === clickedItem.id) {
        // Cambiar entre true y false si ya está definido o establecerlo como true si es undefined
        return { ...item, selected: item.selected === undefined ? true : !item.selected };
      } else {
        return item;
      }
    });

    setSubmitedItems(updatedItems); // Actualizar la lista de elementos
    setSelectionStage(1); // Cambiar la etapa de selección si es necesario
  };

    const handleProviderClick = (item) => {
      setSelectedProvider(item); // Establecer el ítem seleccionado
      setSelectionStage(2)
    };

    const handleDeleteItemByProvider = async (item) => {
      const f = confirm('¿Está seguro que desea eliminar esta asignación de proveedor a item?');
      const itemId = item.id;
      if (f) {
        try {
          await deleteById('purchases/deletePurchaseItemByProvider/', itemId);
          ToastNotify({ message: 'Eliminado', position: 'top-right' });
          getPurchaseItemByProviderList();
        } catch (error) {
          console.error('Error al eliminar el elemento:', error);
          ToastNotify({ message: 'Error al eliminar', position: 'top-right' });
        }
      } else { 
        ToastNotify({ message: 'Cancelado', position: 'top-right' });
      }
    };
    

  // Función para agregar un nuevo elemento a la lista de items
  const handleAddItem = () => {
    if (items.length < MAX_ITEMS) {
      ToastNotify({ message: 'Item Agregado', position: 'top-right' });

      setItems((prevItems) => [
        ...prevItems,
        {
          id: Date.now(), // Utilizar un timestamp como id
          item_name: '',
          quantity: 0,
          unit_measure: '',
          description: '',
          attachment_url: '',
          cost_center: 0,
        },
      ]);
    }
  };

  const deleteItem = async (item) => {
    const f = confirm('Esta seguro que desea eliminar este item?');
    const itemId = item.id;
    if (f) {
      if (item.attachment_url) {
        const filename = item.attachment_url.split('/').pop();

        const response = await deleteAttachment(filename, 'image');
        if (response === 200) {
          ToastNotify({ message: 'Adjunto Eliminado', position: 'top-right' });

          const updatedItems = submitedItems.filter(
            (item) => item.id !== itemId,
          );
          setSubmitedItems(updatedItems);

          // Si no quedan elementos después de la eliminación, actualiza el estado correspondiente
          setExistSubmitedItems(updatedItems.length > 0);

          ToastNotify({ message: 'Item Eliminado', position: 'top-right' });
        } else {
          console.error('Error al eliminar el archivo:', response);
          ToastNotify({
            message: 'Error al eliminar el archivo',
            position: 'top-right',
          });
        }
      } else {
        const updatedItems = submitedItems.filter((item) => item.id !== itemId);
        setSubmitedItems(updatedItems);

        // Si no quedan elementos después de la eliminación, actualiza el estado correspondiente
        setExistSubmitedItems(updatedItems.length > 0);

        ToastNotify({ message: 'Eliminado', position: 'top-right' });
      }
    } else {
      ToastNotify({ message: 'Cancelado', position: 'top-right' });
    }
  };

  const handleRemoveItem = (itemId) => {
    // Filtrar los elementos y eliminar el item específico
    const updatedItems = items.filter((item) => item.id !== itemId);
    setItems(updatedItems);

    ToastNotify({ message: 'Item Eliminado', position: 'top-right' });
  };

  // Función para manejar cambios en los campos de un elemento específico
  const handleItemChange = (index, fieldName, value) => {
    setItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, [fieldName]: value } : item,
      ),
    );
  };

  const handleAprobadorChange = (e) => {
    if (e.target.name == 'changedExistence') {
      let value = false;
      if (e.target.value == 'true') value = true;
      if (e.target.value == 'false') value = false;
      setEnableItems(value);
      setIscreate(value);
      setShowInternalButton(!value);
    }

    if (e.target.name == 'response') {
      if (e.target.value == 'Rechazado') {
        setEnableItems(false);
        setIscreate(false);
      }
    }

    const { name, value } = e.target;
    setFormAprobacionData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const consultIfActive = () => {
    if (formData.stage == 0) {
      return false;
    }
    if (formData.stage != 0 && !enableItems) {
      return true;
    } else if (formData.stage != 0 && enableItems) {
      return false;
    } else {
      return true;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  const submit = async () => {
    const f = confirm('¿Está seguro de que desea enviar esta solicitud?');
    if (f) {
      setFormData((prevData) => {
        // Actualizar el estado de formData
        const updatedData = { ...prevData, stage: 1 };
        return updatedData;
      });

      formData.aprobator1Id = parseInt(formData.aprobator1Id, 10);

      if (
        (formData.stage != 0 && enableItems) ||
        (formData.stage != 0 && showInternalButton)
      ) {
        console.log('formData.stage=> ', formData.stage)
        console.log('11111111111111=> ', IsFormAprobacionDataValid)
        if (IsFormAprobacionDataValid) {
          
          formAprobacionData.creator_name = user.first_name + ' ' + user.last_name;
          formAprobacionData.creator_username = user.email;
          formAprobacionData.creator_id = user.id;
          formAprobacionData.purchase_solicitud_id = id;
          formAprobacionData.stage = formData.stage;

          formAprobacionData.purchase_solicitud_id = parseInt(
            formAprobacionData.purchase_solicitud_id,
            10,
          );

          if (formAprobacionData.changedExistence == '')
            formAprobacionData.changedExistence = false;

          const response = await postWithData(
            'purchases/createPurchaseAprobacion',
            formAprobacionData,
          );

          // buscamos los items y si tenemos uno nuevo lo agregamos
          const items = await show(
            'purchases/getPurchaseItemByPurchaseSolicitudId/' + id,
          );

          // Obtener los elementos que existen tanto en items como en submitedItems
          const commonItems = items.filter((item) =>
            submitedItems.some((subItem) => subItem.id === item.id),
          );

          // Eliminar los elementos que existen en items pero no en submitedItems
          const itemsToDelete = items.filter(
            (item) => !commonItems.includes(item),
          );

          // // Eliminar los elementos no deseados
          itemsToDelete.forEach(async (itemToDelete) => {
            const response = await deleteById(
              'purchases/deletePurchaseItem/' + itemToDelete.id,
            );
          });

          // agregamos los items que no existen
          submitedItems.forEach(async (item) => {
            let existence = items.filter((array) => array.id == item.id);
            if (existence.length) {
            } else {
              item.purchase_solicitud_id = id;
              const response = await postWithData(
                'purchases/createPurchaseItem',
                item,
              );
            }
          });

          // Actualizamos la solicitud
          setFormData((prevData) => {
            const updatedData = { ...prevData, stage: 2 };
            return updatedData;
          });
          formData.stage = 2;
          const solicitud = await putWithData(
            'purchases/updatePurchaseSolicitud/' + id,
            formData,
          );

          setIscreate(false);
          setEnableItems(false);
          ToastNotify({ message: 'Aprobado - Solicitud actualizada' });
        } else {
          ToastNotify({ message: 'formulario de aprobador incompleto' });
        }
      } else {
        formData.stage = 1;

        const response = await postWithData(
          'purchases/createPurchaseSolicitud',
          formData,
        );
        const purchase_solicitud_id = response.id;
        if (submitedItems.length) {
          submitedItems.forEach(async (element) => {
            element.purchase_solicitud_id = purchase_solicitud_id;
            const response = await postWithData(
              'purchases/createPurchaseItem',
              element,
            );
          });
        }

        let url = '/purchases/solicitud/view/' + response.id;
        window.location.href = url;
      }
    } else {
      ToastNotify({ message: 'Cancelado' });
    }
  };

  const getPurchaseItemByProviderList = async () =>{
    const itemsByProviders = await show(
      'purchases/getPurchaseItemByProviderListBySolicitudId/' + id,
    );
    console.log('items -> ', itemsByProviders)

    let object = itemsByProviders.data 


    const groupedItemsByProvider = [];

    object.forEach(item => {
      const providerId = item.provider_id;
      const provider = item.provider.name
      if (!(provider in groupedItemsByProvider)) {
     
        groupedItemsByProvider[provider] = []; // Inicializa un array para el proveedor si aún no existe
      }
      groupedItemsByProvider[provider].push(item); // Agrega el item al array del proveedor correspondiente
    });

    console.log('Items agrupados por proveedor:', groupedItemsByProvider);

    // setItemsByProviders(itemsByProviders.data)
    setItemsByProviders(groupedItemsByProvider)

  }

  const saveObject = async () => {
    const f = confirm ('¿Está seguro que desea hacer esta asignación?');
    if (f) {
      let selectedItems = submitedItems.filter(array => array.selected === true);
      const promises = selectedItems.map(async item => {
        console.log('current item => ', item);
        const array = {
          creator_name: user.first_name + ' ' + user.last_name,
          creator_username: user.email,
          creator_id: user.id,
          created_new_date: new Date(),
          creator_company_id: user.company.id, 
          created: date,
          purchase_solicitud_item_id: item.id,
          provider_id: selectedProvider.id, 
          solicitud_id: id
        };
        
        return postWithData('purchases/createPurchaseItemByProvider', array);
      });
      
      // Esperar a que todas las promesas se resuelvan antes de continuar
      await Promise.all(promises);
      
      // Una vez completadas todas las operaciones asíncronas, ejecutar getPurchaseItemByProviderList
      getPurchaseItemByProviderList();
      
      ToastNotify({ message: 'Guardado', position: 'top-right' });
    } else { 
      ToastNotify({ message: 'Cancelado', position: 'top-right' });
    }
  };
  
 
  const submitAprobador = async () => {
    // setFormAprobacionData((prevData) => {
    //   // Actualizar el estado de formData
    //   const updatedData = { ...prevData, purchase_solicitud_id: id };
    //   return updatedData;
    // });
    // formAprobacionData.purchase_solicitud_id = id
    formAprobacionData.purchase_solicitud_id = parseInt(
      formAprobacionData.purchase_solicitud_id,
      10,
    );
  };

  const handleItemSaved = async (item) => {
    if (submitedItems.length != 0) {
      setSubmitedItems((prevItems) => [...prevItems, item]);

      setExistSubmitedItems(true);
    } else {
      setSubmitedItems([item]);

      setExistSubmitedItems(true);
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleFileChange = async (url) => {
    // const handleFileChange = async (e) => {
    if (url != null) {
      setAttachmentUrl(url);

      // Actualizar el estado con la URL del archivo
      // setFormData((prevData) => ({
      //   ...prevData,
      //   attachment_url: url,
      // }));

      setFormData((prevData) => {
        // Actualizar el estado de formData
        const updatedData = { ...prevData, attachment_url: url };

        return updatedData;
      });
    }
  };

  const handleDeleteFile = async () => {
    setAttachmentUrl('');

    setFormData((prevData) => ({
      ...prevData,
      attachment_url: '',
    }));
  };

  const renderDownloadButton = () => {
    if (formData.attachment_url) {
      return (
        <a
          href={formData.attachment_url}
          target='_blank'
          rel='noopener noreferrer'
          className='bg-green-500 text-white px-4 py-2 rounded-md mt-2 inline-block'
        >
          Descargar Archivo
        </a>
      );
    }
    return null;
  };

  const handleStepClick = (step) => {
    setShowStage(step - 1);
    // setFormData((prevData) => {
    //   // Actualizar el estado de formData
    //   const updatedData = { ...prevData, stage: step - 1};
    //   return updatedData;
    // });
  };

  useEffect(() => {
    getUserList();
    setUser();
    getPermisology()
    companies();
    
    if (id) {
      setIscreate(false);
      getPurchaseSolicitudById();
    }
    async function consulCurrenPermisology(aprobator1Id) {
      let response = await show(
        `purchases/getPurchaseAprobadorById/` + aprobator1Id,
      );
      
      if (response) {

     
        if (user){
          if (response.user.id == user.id) {
            setValidApprover(true);
          }
        }
   
      }
    }
    async function setUser() {
 
      setFormData({
        creator_name: `${user.first_name} ${user.last_name}`,
        creator_username: `${user.email}`,
        creator_id: `${user.id}`,
        creator_company_id: 0,
        created: date,
        created_new_date: new Date(),

        company_id: 0,
        req_name: '',
        delivery_date: '',
        attachment_url: '',
        comments: '',
        stage: 0,
      });
    }
    async function getPurchaseSolicitudById() {
      try {
        const response = await show('purchases/getPurchaseSolicitudById/' + id);
        console.log('solicitud => ', response)
        if (response.stage == 2) {
          let aprobacion = await show(
            'purchases/getPurchaseAprobacionByPurchaseSolicitudId/' + id,
          );
          aprobacion = aprobacion[0];
     
          setFormAprobacionData(() => ({
            creator_name: aprobacion.creator_name,
            creator_username: aprobacion.creator_username,
            creator_id: aprobacion.creator_id,
            created: aprobacion.created,
            created_new_date: aprobacion.created_new_date,
            comments: aprobacion.comments,
            response: aprobacion.response,
            changedExistence: aprobacion.changedExistence,
            purchase_solicitud_id: aprobacion.purchase_solicitud_id,
          }));

          getProveedores()
        }
        // Verifica si la respuesta tiene datos
        if (response && response.id) {
        
        
          console.log('response => ', response.stage)
          // Actualiza el estado del formData con los datos de la solicitud
          setFormData(prevFormData => {
       
            const newData = {
              creator_name: response.creator_name,
              creator_username: response.creator_username,
              creator_id: response.creator_id,
              creator_company_id: response.creator_company_id,
              created: response.created,
              created_new_date: response.created_new_date,
          
              company_id: response.company_id,
              req_name: response.req_name,
              delivery_date: response.delivery_date,
              attachment_url: response.attachment_url,
              comments: response.comments,
              stage: response.stage,
              aprobator1Id: response.aprobator1Id,
            };
     
     
            if (response.stage === 2) {
            
              newData.compras_user_name = user.first_name + " " + user.last_name;
              newData.compras_user_email = user.email;
              newData.compras_user_id = user.id;
              newData.compras_user_company_id = user.company.id;
              newData.compras_user_company_name = user.company.company;
              newData.compras_asignacion_date =  date;
    

            }
          
            return newData;
          });

          const items = await show(
            'purchases/getPurchaseItemByPurchaseSolicitudId/' + id,
          );

      

          items.forEach((element) => {
            element.cost_center_temporal_name = element.PurchaseCostCenter.name;
          });
          setSubmitedItems(items);
          setExistSubmitedItems(true);
         
          await consulCurrenPermisology(response.aprobator1Id);
        }
      } catch (error) {
        console.error('Error al obtener la solicitud por ID:', error);
      }
    }

    async function getProveedores(){
      let response = await show(`providers/getProvidersList`);
 
      response.data.forEach(element => {
        if (element.provider_category){

        }else{ 
          element.provider_category = ({
            name: "n/a"
          })
        }
      })
      // let providers = response.data.filter(array => array.approval_status != "Pendiente")
      setProviders(response.data)
      setOriginalProviders(response.data)

      let providersCategories =  await show(`providers/allCategories`);
      setProvidersCategories(providersCategories)

      getPurchaseItemByProviderList()

    }
    async function getUserList() {
      let response = await show(`purchases/getPurchaseAprobadorList`);
      console.log('response =-> ', response)
      let filteredUsers = response.data.filter(
        (aprobador) => aprobador.first_approver === true,
      );
      setUsers(filteredUsers);
      setUsersLoader(false);
    }
    async function companies() {
      const companies = await show('companies/getCompanies');
      
      setCompanies(companies);
    }
    async function getPermisology(){
   
      if (user.Permisology_purchase){
        if (user.Permisology_purchase.compras_user){
          setComprasUser(user.Permisology_purchase.compras_user)
        }
      }
    }
  
  }, []);

  function handleCategorieSelected(categorie){
 
    let filtered = originalProviders.filter(array => array.provider_category_id == categorie.target.value);

    // Ordenar la lista filtrada colocando los proveedores "Critico" primero y los "Regular" después
    filtered.sort((a, b) => {
        if (a.provider_type === 'Critico' && b.provider_type !== 'Critico') {
            return -1; // a debe ir antes que b
        } else if (a.provider_type !== 'Critico' && b.provider_type === 'Critico') {
            return 1; // b debe ir antes que a
        } else {
            return 0; // No hay diferencia de orden
        }
    });
    
    setProviders(filtered);
     
  }

  // Verificar si todos los campos necesarios están presentes y no están vacíos
  useEffect(() => {
    const { req_name, delivery_date, department_id, comments, aprobator1Id } =
      formData;

    // Verificar si al menos un item existe
    const hasItems = submitedItems.length > 0;

    // Verificar si los campos del formulario y al menos un item son válidos
    const isValid =
      req_name.trim() !== '' &&
      delivery_date.trim() !== '' &&
      department_id !== '' &&
      comments.trim() !== '' &&
      aprobator1Id !== '' &&
      hasItems;

    setIsFormValid(isValid);
  }, [formData, items]);

  useEffect(() => {
    const { response, comments } = formAprobacionData;

    // Verificar si los campos del formulario y al menos un item son válidos
    const isValid = response.trim() !== '' && comments.trim() !== '';

    setIsFormAprobacionDataValid(isValid);
  }, [formAprobacionData]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className='content'>
          <>
          {isComprasUser ? (
            <Stepper
              currentStep={showStage}
              totalSteps={3}
              stepTexts={['Solicitud', 'Asignación de proveedores', 'Shopping']}
              onStepClick={handleStepClick}
            />
            ) : (
              <Stepper
              currentStep={showStage}
              totalSteps={1}
              stepTexts={['Solicitud']}
              onStepClick={handleStepClick}
            />
            )}
            {/* header */}
            <div className='bg-white border rounded shadow'>
              <div className='header w-full flex'>
                {/* dealles iniciales */}
                <div className='w-2/3 flex-col p-4'>
                  <h1 className='text-2xl font-bold mb-3 p-4'>
                    {' '}
                    Detalles iniciales de la solicitud{' '}
                  </h1>

                  {/* First row */}
                  <div className='flex w-full mb-4 space-x-4'>
                    <div className='flex-1'>
                      <label className='block text-sm font-medium text-gray-600'>
                        ID:
                      </label>
                      <input
                        type='text'
                        name='creator_name'
                        value={4912}
                        onChange={handleChange}
                        disabled // Deshabilitar la entrada del usuario
                        className='mt-1 p-2 w-full border rounded-md'
                      />
                    </div>
                  </div>
                  <div className='flex w-full mb-4 space-x-4'>
                    {/* Creator Name */}
                    <div className='flex-1'>
                      <label className='block text-sm font-medium text-gray-600'>
                        Creador:
                      </label>
                      <input
                        type='text'
                        name='creator_name'
                        value={formData.creator_name}
                        onChange={handleChange}
                        disabled // Deshabilitar la entrada del usuario
                        className='mt-1 p-2 w-full border rounded-md'
                      />
                    </div>

                    {/* Fecha de Solicitud */}
                    <div className='flex-1'>
                      <label className='block text-sm font-medium text-gray-600'>
                        Fecha de Solicitud:
                      </label>
                      <input
                        type='text'
                        name='creator_name'
                        value={formData.created}
                        onChange={handleChange}
                        disabled // Deshabilitar la entrada del usuario
                        className='mt-1 p-2 w-full border rounded-md'
                      />
                    </div>
                  </div>
                </div>
                {/* stages */}
                <div className='stages-box  w-1/3  text-center flex-col  '>
                  <div className='mt-3 mb-2'>Etapa Actual:</div>
                  <div
                    className={`w-full  ${
                      formData.stage === 0 ? 'text-bold active-option' : ''
                    }`}
                  >
                    Creacion de soliciutd
                  </div>
                  <div
                    className={`w-full  ${
                      formData.stage === 1 ? 'text-bol active-option' : ''
                    }`}
                  >
                    Aprobacion
                  </div>
                  <div
                    className={`w-full  ${
                      formData.stage === 2 ? 'text-bol active-option' : ''
                    }`}
                  >
                    
                    Asignación de proveedores
                  </div>
                  <div
                    className={`w-full  ${
                      formData.stage === 3 ? 'text-bol active-option' : ''
                    }`}
                  >
                    aprobacion compras
                  </div>
                  <div
                    className={`w-full  ${
                      formData.stage === 4 ? 'text-bol active-option' : ''
                    }`}
                  >
                    aprobacion general
                  </div>
                  <div
                    className={`w-full  ${
                      formData.stage === 5 ? 'text-bol active-option' : ''
                    }`}
                  >
                    Shopping
                  </div>
                  <div
                    className={`w-full  ${
                      formData.stage === 6 ? 'text-bol active-option' : ''
                    }`}
                  >
                    Cerrado
                  </div>
                </div>
              </div>
            </div>
            {/* form */}
            {showStage === 0 ? (
              <>
                <div className='bg-white border rounded shadow'>
                  <div className='container w-full p-4'>
                    {/* Seccond row */}
                    <div className='flex w-full mb-4 space-x-4'>
                      <div className='flex-1'>
                        <label className='block text-sm font-medium text-gray-600'>
                          Empresa:
                        </label>
                        <select
                          name='company_id'
                          value={formData.company_id}
                          disabled={consultIfActive()}
                          onChange={handleChange}
                          className='mt-1 p-2 w-full border rounded-md text-sm'
                        >
                          <option value='' selected disabled>
                            Seleccione Empresa
                          </option>

                          {companies.length > 0 &&
                            companies.map((company) => (
                              <option key={company.id} value={company.id}>
                                {company.company}
                              </option>
                            ))}
                        </select>
                      </div>
                      {/*  Nombre de requisicion (max 100 caracteres): */}
                      <div className='flex-1'>
                        <label className='block text-sm font-medium text-gray-600'>
                          Nombre de requisicion (max 100 caracteres):
                        </label>
                        <input
                          type='text'
                          name='req_name'
                          value={formData.req_name}
                          onChange={handleChange}
                          maxLength={100}
                          disabled={consultIfActive()}
                          className='mt-1 p-2 w-full border rounded-md'
                        />
                      </div>
                      {/*  Fecha de entrega estimada */}
                      <div className='flex-1'>
                        <label className='block text-sm font-medium text-gray-600'>
                          Fecha de entrega estimada:
                        </label>
                        <input
                          type='date'
                          name='delivery_date'
                          value={formData.delivery_date}
                          min={formatDate(new Date())}
                          onChange={handleChange}
                          disabled={consultIfActive()}
                          className='mt-1 p-2 w-full border rounded-md'
                        />
                      </div>
                    </div>

                    {/* third row */}
                    <div className='flex w-full mb-4 space-x-4'>
                      {/* Archivo adjunto */}
                      {isCreate ? (
                        <div className='flex-1'>
                          <AttachmentHandler
                            onFileChange={handleFileChange}
                            onFileDelete={handleDeleteFile}
                          />
                        </div>
                      ) : (
                        <div className='flex-1'>
                          {formData.attachment_url ? (
                            <a
                              href={formData.attachment_url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='bg-green-500 text-white px-4 py-2 rounded-md'
                            >
                              Descargar Archivo
                            </a>
                          ) : (
                            // Si no hay attachment_url, mostrar un elemento en blanco
                            <span></span>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Commentario */}
                    <div className='flex w-full mb-4 space-x-4'>
                      <div className='flex-1'>
                        <label className='block text-sm font-medium text-gray-600'>
                          Comentario (maximo 500 caracteres):
                        </label>
                        <textarea
                          maxLength={500}
                          type='text'
                          name='comments'
                          value={formData.comments}
                          disabled={consultIfActive()}
                          onChange={handleChange}
                          className='mt-1 p-2 w-full border rounded-md'
                        />
                      </div>
                    </div>

                    {ExistSubmitedItems ? (
                      <div className='w-full  '>
                        Items Agregados: {submitedItems.length}
                        <div className='items-box w-full'>
                          <div className='items-head flex'>
                            <div className='flex-auto item-question-size'>
                              Departamento
                            </div>
                            <div className='flex-auto item-question-size'>
                              Nombre
                            </div>
                            <div className='flex-auto item-question-size'>
                              Cantidad
                            </div>
                            <div className='flex-auto item-question-size'>
                              Unidad De Medida
                            </div>
                            <div className='flex-auto item-question-size'>
                              Centro de costo
                            </div>
                            <div className='flex-auto item-question-size'>
                              Descripcion
                            </div>
                            <div className='flex-auto item-question-size'>
                              Adjunto
                            </div>
                            {/* <div className="flex-auto">Acciones</div> */}
                          </div>
                          <div className='subitems-box'>
                            {submitedItems.map((item) => (
                              <div key={item.id} className='item flex'>
                                <div className='flex-auto item-question-size ml-2'>
                                  {item.department.department}
                                </div>
                                <div className='flex-auto item-question-size'>
                                  {item.wh_material_description}
                                </div>
                                <div className='flex-auto item-question-size'>
                                  {item.quantity}
                                </div>
                                <div className='flex-auto item-question-size'>
                                  {item.wh_measurement_unit}
                                </div>
                                <div className='flex-auto item-question-size'>
                                  {item.cost_center_temporal_name}
                                </div>
                                <div className='flex-auto item-question-size'>
                                  {item.description}
                                </div>
                                <div className='flex-auto item-question-size'>
                                  {item.attachment_url ? (
                                    <a
                                      href={item.attachment_url}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='bg-green-500 text-white px-3 py-1 rounded-md   inline-block'
                                    >
                                      Descargar
                                    </a>
                                  ) : (
                                    <> </>
                                  )}
                                </div>
                                <div className='flex-auto  '>
                                  {isCreate ? (
                                    <a
                                      onClick={() => deleteItem(item)}
                                      title='Eliminar item'
                                      className='pointer w-[20px] flex-center bg-green-500 text-white px-3 py-1 rounded-md   inline-block'
                                    >
                                      x
                                    </a>
                                  ) : (
                                    <> </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                    {/* {renderItems()} */}

                    {isCreate ? (
                      <>
                        <h1>Items list</h1>
                        <ItemsList
                          items={items}
                          onRemoveItem={handleRemoveItem}
                          // onItemChange={handleItemChange}
                          onItemSaved={handleItemSaved}
                        />
                      </>
                    ) : (
                      <> </>
                    )}
                  </div>
                </div>

                <div className='flex-col justify-end bg-white border rounded shadow p-4'>
                  {/*  Aprobador */}
                  <div className='w-full'>
                    <label className='block text-sm font-medium text-gray-600'>
                      Aprobador:
                    </label>
                    <select
                      name='aprobator1Id'
                      value={formData.aprobator1Id}
                      onChange={handleChange}
                      disabled={!isCreate}
                      className='mt-1 p-2 w-full border rounded-md'
                    >
                      <option value='' selected disabled>
                        Seleccione aprobador
                      </option>

                      {!usersLoader &&
                        users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.user.first_name} {user.user.last_name}
                          </option>
                        ))}
                    </select>
                    {validApprover ? (
                      <>
                        <div className='container w-full p-4'>
                          {/* first row */}
                          <div className='flex w-full mb-4 space-x-4'>
                            {/*  Respuesta */}
                            <div className='flex-1'>
                              <label className='block text-sm font-medium text-gray-600'>
                                Respuesta:
                              </label>
                              <select
                                name='response'
                                value={formAprobacionData.response}
                                onChange={handleAprobadorChange}
                                disabled={formData.stage != 1}
                                className='mt-1 p-2 w-full border rounded-md'
                              >
                                <option selected value='' disabled>
                                  Seleccionar Respuesta
                                </option>
                                <option value='Aprobado'>Aprobado</option>
                                <option value='Rechazado'>Rechazado</option>
                              </select>
                            </div>

                            {/*  Desea hacer algun cambio? */}
                            {formAprobacionData.response == 'Aprobado' ? (
                              <div className='flex-1'>
                                <label className='block text-sm font-medium text-gray-600'>
                                  Desea hacer algun cambio?
                                </label>
                                <select
                                  name='changedExistence'
                                  value={formAprobacionData.changedExistence}
                                  onChange={handleAprobadorChange}
                                  // disabled={ formData.stage != 0 }
                                  disabled={formData.stage != 1}
                                  className='mt-1 p-2 w-full border rounded-md'
                                >
                                  <option selected value='' disabled>
                                    Seleccionar
                                  </option>
                                  <option value='true'>Si</option>
                                  <option value='false'>No</option>
                                </select>
                              </div>
                            ) : (
                              <>
                                <div className='flex-1'></div>
                              </>
                            )}
                            <div className='flex-1'></div>
                          </div>

                          {/* second row */}
                          <div className='flex w-full mb-4 space-x-4'>
                            <div className='flex-1'>
                              <label className='block text-sm font-medium text-gray-600'>
                                Comentario (maximo 500 caracteres):
                              </label>
                              <textarea
                                maxLength={500}
                                type='text'
                                name='comments'
                                value={formAprobacionData.comments}
                                disabled={formData.stage != 1}
                                onChange={handleAprobadorChange}
                                className='mt-1 p-2 w-full border rounded-md'
                              />
                            </div>
                          </div>
                          {showInternalButton ? (
                            <>
                              <button
                                onClick={() => submit()}
                                className={`bg-gray-800 text-white px-4 py-2 rounded-md ${
                                  !IsFormAprobacionDataValid
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                }`}
                                // disabled={!IsFormAprobacionDataValid}
                              >
                                Enviar
                              </button>
                            </>
                          ) : (
                            <></>
                          )}

                          {/* <div className="w-full mt-5">
                          {  IsFormAprobacionDataValid ? (
                          <button
                          onClick={() => submitAprobador( )}
                            className={`bg-gray-800 text-white px-4 py-2 rounded-md ${
                              !IsFormAprobacionDataValid ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={!IsFormAprobacionDataValid}
                          >
                            Enviar
                          </button>
                          ):(<>

                          <button
                   
                            className={`bg-gray-800 text-white px-4 py-2 rounded-md ${
                              !IsFormAprobacionDataValid ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={!IsFormAprobacionDataValid}
                          >
                            Enviar
                          </button>

                          </>)}

                          </div> */}
                        </div>
                      </>
                    ) : (
                      <> </>
                    )}
                  </div>

                  <div className='w-full mt-5'>
                    {isCreate ? (
                      <button
                        onClick={() => submit()}
                        className={`bg-gray-800 text-white px-4 py-2 rounded-md ${
                          !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={!isFormValid}
                      >
                        Enviar
                      </button>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </>
            ) : showStage === 1 ? (
              <>
               <div className='bg-white border rounded shadow'>
                  <div className='container w-full p-4'>
                  <div className='text-1xl font-bold mb-3 p-1'>
                      Procura: Asignación de proveedores 
                  </div>
                {/* procura Header user */}
                  <div className='flex w-full mb-4 space-x-4'>
                    {/*  Usuario Procura: */}
                  <div className='flex-1'>
                      <label className='block text-sm font-medium text-gray-600'>
                        Usuario Procura:
                      </label>
                      <input
                        type='text'
                        name='compras_user_name'
                        value={formData.compras_user_name}
                        onChange={handleChange}
                        disabled // Deshabilitar la entrada del usuario
                        className='mt-1 p-2 w-full border rounded-md'
                      />
                    </div>
                    {/*  Empresa Usuario Procura: */}
                    <div className='flex-1'>
                      <label className='block text-sm font-medium text-gray-600'>
                       Empresa Usuario Procura:
                      </label>
                      <input
                        type='text'
                        name='compras_user_company_name'
                        value={formData.compras_user_company_name}
                        onChange={handleChange}
                        disabled // Deshabilitar la entrada del usuario
                        className='mt-1 p-2 w-full border rounded-md'
                      />
                    </div>
                    {/*  Fecha de Asignación de proveedores: */}
                    <div className='flex-1'>
                      <label className='block text-sm font-medium text-gray-600'>
                        Fecha de Asignación de proveedores:
                      </label>
                      <input
                        type='text'
                        name='compras_asignacion_date'
                        value={formData.compras_asignacion_date}
                        onChange={handleChange}
                        disabled // Deshabilitar la entrada del usuario
                        className='mt-1 p-2 w-full border rounded-md'
                      />
                    </div>
                  </div>
                  </div>
                </div>

                {/* item / provider */}
                <div className='bg-white border rounded shadow'>


                  <div className=' w-full  '>
                  <Stepper
                                currentStep={selectionStage}
                                totalSteps={3}
                                stepTexts={['Selecciona Items', 'Asignar Proveedor', 'Guardar']}
                                onStepClick={handleStepClick}
                              />


                    
                      <div className='w-full flex'>    
                         {/* items */}    
                        <div className="flex-col w-1/2 pt-6">

                          {ExistSubmitedItems ? (
                              <div className='  w-full  mt-2 '>
                               
                                <div className=' w-full'>
                                <b> Selecciona uno o varios items. </b>   
                                
                                    <div className=' subitems-box'>


                                    <div className='items-head flex'>
                                      <div className='flex-auto item-question-size'>
                                      Dpt.
                                      </div>
                                      <div className='flex-auto item-question-size'>
                                        Nombre
                                      </div>
                                      {/* <div className='flex-auto item-question-size'>
                                        Cantidad
                                      </div> */}
                                      {/* <div className='flex-auto item-question-size'>
                                        U. Medida
                                      </div> */}
                                   
                                    </div>
                                    

                                

                                      <div className='subitems-box-list'> 
                                        {submitedItems.map((item) => (
                                            <div
                                            key={item.id}
                                            className={`item flex ${item.selected === true ? 'active-item-light' : ''}`} // Aplicar clase 'active' si el ítem está seleccionado
                                            onClick={() => handleItemClick(item)} // Manejador de eventos onClick para capturar la selección del ítem
                                          >


                                            <div className='flex-auto item-question-size '>
                                              {item.department.department}
                                      
                                            </div>
                                            <div className='flex-auto item-question-size-long'>
                                              {item.wh_material_description}
                                            </div>
                                            {/* <div className='flex-auto item-question-size'>
                                              {item.quantity}
                                            </div> */}
                                            {/* <div className='flex-auto item-question-size'>
                                              {item.wh_measurement_unit}
                                            </div> */}
                                            {/* <div className='flex-auto item-question-size'>
                                              {item.cost_center_temporal_name}
                                            </div> */}
                                            {/* <div className='flex-auto item-question-size'>
                                              {item.description}
                                            </div> */}
                                            <div className='flex-auto item-question-size'>
                                              {item.attachment_url ? (
                                                <a
                                                  href={item.attachment_url}
                                                  target='_blank'
                                                  rel='noopener noreferrer'
                                                  className='bg-green-500 text-white px-3 py-1 rounded-md   inline-block'
                                                >
                                                  Descargar
                                                </a>
                                              ) : (
                                                <> </>
                                              )}
                                            </div>
                                            <div className='flex-auto  '>
                                              {isCreate ? (
                                                <a
                                                  onClick={() => deleteItem(item)}
                                                  title='Eliminar item'
                                                  className='pointer w-[20px] flex-center bg-green-500 text-white px-3 py-1 rounded-md   inline-block'
                                                >
                                                  x
                                                </a>
                                              ) : (
                                                <> </>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div> 
                                  </div>

                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                        </div>

                        {/* proveedores */}
                        <div className="flex-col w-1/2">
                        
                          {ExistSubmitedItems ? (
                              <div className='w-full mt-4'>
                               
                                <div className="w-full flex">
                                <div className="2/3 mt-[auto]">
                                  <b> Asignar proveedor </b>   
                                </div>
                             
                                  {/* Categoria */}
                                  <div className="w-1/3 ml-[auto]">
                                      
                                      <select
                                        // name='categorieSelected'
                                        // value={categorieSelected}
                                        onChange={handleCategorieSelected}
                                        className='mt-1 p-2 w-full border rounded-md text-sm'
                                      >
                                        <option value='' selected disabled>
                                          Seleccione Categoria
                                        </option>

                                        {providerCategories.length > 0 &&
                                          providerCategories.map((categorie) => (
                                            <option key={categorie.id} value={categorie.id}>
                                              {categorie.name}
                                            </option>
                                          ))}
                                      </select>
                                  </div>
                                 

                                </div>



                                <div className='w-full'>

                                  <div className='subitems-box'>
                                    <div className='items-head flex'>
                                    
                                      <div className='flex-auto item-question-size'>
                                        Nombre
                                      </div>
                                      <div className='flex-auto item-question-size'>
                                        Categoria
                                      </div>
                                      <div className='flex-auto item-question-size'>
                                        Tipo
                                      </div>
                      
                                    </div>
                                    <div className='subitems-box-list'>
                                        {providers.map((item) => (
                                            <div
                                            key={item.id}
                                            className={`item flex ${selectedProvider === item ? 'active-item-light' : ''}`} // Aplicar clase 'active' si el ítem está seleccionado
                                            onClick={() => handleProviderClick(item)} // Manejador de eventos onClick para capturar la selección del ítem
                                          >
                                            <div className='flex-auto item-question-size ml-2'>
                                              {item.name}
                                            </div>
                                            <div className='flex-auto item-question-size ml-2'>
                                              {item.provider_category.name}
                                            </div>
                                            <div className='flex-auto item-question-size ml-2'>
                                              {item.provider_type}
                                            </div>
                                          
                                          </div>
                                        ))}
                                    </div>
                                  </div>

                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                        </div>
                      </div> 


                       {/*  button */}
                       <div className="flex-col w-full mt-2 mb-2 flex-center">
                            <div className=''> 
                              <button
                                onClick={() => saveObject()}
                                className={`bg-gray-800 w-full text-white px-4 py-2 rounded-md 
                                ${ selectionStage != 2  ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={!selectionStage === 2}
                              >
                                Agregar 
                              </button>
                            </div>
                        
                      </div>

                  </div>
                </div>
              


                {/* asignaciones realizadas */}
                <div className="bg-white border rounded shadow">
      
                        <div className="flex w-full">

                      
                              <div className='w-full mt-5'>
                              <b> Asignaciones realizadas:  </b>
                                <div className='w-full'>
                                  <div className='  subitems-box'>
                                    <div className='items-head flex'>

                                  
                                      <div className='flex-auto item-question-size'>
                                        Proveedor
                                      </div>
                                      
                                      <div className='flex-auto item-question-size'>
                                        Acciones
                                      </div>
                      
                                    </div>
                                    <div className='subitems-box-list'>
                                      {Object.keys(itemsByProviders).map(providerName => (
                                        <>
                                      
                                        <div key={providerName} className='item'>
                                          <div className='w-[55%]  pt-1 pb-1  flex'> 
                                          <h3 className='ml-2 '>{providerName}</h3>
                                          <div className='ml-[auto]'>      
                                          <button
                                            type='button'
                                            title= "Expandir"
                                            onClick={() => handleShowItemsClick(providerName)} // Manejador de clic para alternar la visibilidad de los subítems
                                          >
                                            {showItemsByProvider[providerName] ? <FaMinusCircle className='mr-2'/> : <FaPlusCircle className='mr-2'/>}
                                          </button>
                                          </div>  
                                          </div>
                                      
                                          {showItemsByProvider[providerName] && ( // Mostrar los subítems solo si están visibles
                                            itemsByProviders[providerName].map(item => (
                                              <div key={item.id} className='item flex'>
                                                <div className='flex-auto item-question-size ml-5'>
                                                  {item.item.wh_material_description}
                                                </div>
                                                <div className='flex-auto item-question-size ml-2'>
                                                  <button
                                                    type='button'
                                                    className='ml-2 bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm'
                                                    style={{ fontSize: '12px' }}
                                                    title="Eliminar Centro de Costo"
                                                    onClick={() => handleDeleteItemByProvider(item)} 
                                                  >
                                                    <FaTrash />
                                                  </button>
                                                </div>
                                              </div>
                                            ))
                                          )}

                        
                                      

                                        </div>
                                    
                                        </>
                                      ))}
                                    </div>

                                  </div>

                                </div>
                              </div>

                        </div>

                </div>
              
              </>
            ) : (
              <></>
            )}
          </>
        </div>
      </form>
    </>
  );
}

export default SolicitudForm;
