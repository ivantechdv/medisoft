 
import './index.css';
import ToastNotify from '../../../components/toaster/toaster';
import { Link, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { show, putWithData, postWithData } from '../../../api';
import Stepper from '../../../components/stepper/stepper';
import { useUser } from '../../../context/userContext';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { FaEdit, FaTrash  } from 'react-icons/fa';


function PurchaseCuentaContable() {
    const initialValues = {
        creator_name: '',
        creator_username: '',
        creator_id: '',
        created_new_date: new Date(),
        created: '',
        code: '',
        description:'',
        type: '',
        soft_delete:false, 
        pl_line_id:0, 
      };
    

      const [loader, setLoader] = useState(false);
      const { user } = useUser();
      const [currentPage, setCurrentPage] = useState(1);
      const [pageSize, setPageSize] = useState(10);  
      const [totalPages, setTotalPages] = useState(1);
      const [users, setUsers] = useState([]);
      const [formData, setFormData] = useState(initialValues);
 
      const [IsFormAprobacionDataValid, setIsFormAprobacionDataValid] = useState(false)
      const [showStage, setShowStage] = useState(0)

      const [CuentaContable, setCuentaContable] = useState([])
      const [originalCuentaContable, setOriginalCuentaContable] = useState([])
      const [reloadData, setReloadData] = useState(false);
      const [searchTerm, setSearchTerm] = useState('');
      const [showDelete, setShowDelete ] = useState(false)
      const [isEdit, setIsEdit ] = useState(false)

      const [Pls, setPls] = useState([]);

      const formatDate = (date) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(date).toLocaleDateString('es-ES', options);
      };


      useEffect(() => {
    
       
       

        async function  getCuentaContables() {
          let url = `purchases/getPuchaseCuentaContable?page=${currentPage}&pageSize=${pageSize}&id=${searchTerm}&field=title`;
          const response = await show(url);
          const { data, meta } = response;
          let actives = data.filter(array => array.soft_delete != true)
         
          setCuentaContable(actives)
          setOriginalCuentaContable(actives);
          setTotalPages(meta.totalPages);
          setLoader(false)
        }
        if (user != null){
            if (!user.Permisology_purchase.can_create_cuenta_contable){
                ToastNotify({message:"No tiene permisos suficientes"})
                let url = '/purchases/layout';
                window.location.href = url;
            }
        }
        if (user != null && user.Permisology_purchase) {
          if (user.Permisology_purchase.can_delete_cuenta_contable){
              setShowDelete(true)
          }else{ 
            setShowDelete(false)
          }
        } else {
          setShowDelete(false)
          setLoader(true);
        }
    
        if (reloadData) {
          setReloadData(false);
          getCuentaContables()
         
        }
      }, [currentPage, pageSize, searchTerm, reloadData]);
      const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
      };
      
      const renderPagination = () => {
        return (
          <div className='flex justify-center mt-4 text-sm'>
            <button
              className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded '
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

      const handleStepClick = (step) => {
        setShowStage(step - 1)
        setReloadData(true);
      };

      const handleChange = (event) => {
        const { id, value, checked, type } = event.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData((prevFormData) => ({
          ...prevFormData,
          [id]: newValue,
        }));
      };


      const submit  = async () =>{
        if (isEdit){
          await putWithData('purchases/updatePuchaseCuentaContable/'+ formData.id, formData)
          ToastNotify({message:"Actualizado"})
          setFormData(initialValues);
          setIsEdit(false)
        }else{ 
          formData.creator_name = user.first_name + " " + user.last_name
          formData.creator_username = user.email 
          formData.creator_id = user.id 
          formData.created  = formatDate(new Date())
          await postWithData('purchases/createPuchaseCuentaContable', formData)
          ToastNotify({message:"Guardado"})
          setFormData(initialValues);
        }
      }

      const handleDelete = async (data) => {
        const f = confirm("Esta seguro que desea eliminar esta cuenta contable?")
        if (f){
            data.soft_delete = true
            await putWithData('purchases/softDeletePuchaseCuentaContable/' + data.id ,data  )
            ToastNotify({ message: "Eliminado!", position: 'top-right' });
            setReloadData(true); // Esto activará el useEffect para volver a cargar los datos
        }else{ 
          ToastNotify({ message: "Cancelado", position: 'top-right' });
        }
      }

      const handleEdit = async (data) =>{
        setIsEdit(true)
        setFormData(data)
        setShowStage(0)
      }

      useEffect(() => {
        const fetchSelect = async () => {
          const com = await show('users/getAllUsers');
          setUsers(com.data);
     
          let url = `purchases/getPurchasePilLinesList`;
          const response = await show(url);
         
          setPls(response.data)

        };
        fetchSelect();
      }, []);

        // Verificar si los campos del formulario son válidos
      useEffect(() => {
    
        const {
            code,
            description,
            type,
            pl_line_id,
        } = formData;
        
      
        const isValid =
        code.trim() !== ''   &&
        description.trim() !== '' &&
        type.trim() !== '' && pl_line_id
         
        setIsFormAprobacionDataValid(isValid);
      }, [formData]);
    
      return (
        <>
            <div className='max-w-6xl mx-auto p-6 mt-6 text-sm'>
                <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
                    <Stepper
                    currentStep={showStage}
                    totalSteps={2}
                    stepTexts={[`Agregar Cuenta Contable`, `Lista de Cuentas Contables`]}
                    onStepClick={handleStepClick}
                    />

                    { showStage === 0  ? (
                    <>
                        {!loader && (
                            <>
                            <div className='w-full  border-gray-300'>
                                <form className='md:grid md:grid-cols-3 gap-2   flex-col'>
                                    <div className="flex">
                                        {/* Codigo */}
                                        <div className="w-1/2 p-4">
                                            <div className='ml-2'> 
                                                Codigo: 
                                            </div>
                                        
                                            <div className='w-full '>
                                            <input
                                                type='text'
                                                id='code'
                                                name='code'
                                                onChange={handleChange}
                                                value={formData.code}
                                                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                                            />
                                            </div>

                                        </div>
                                        {/* Descripcion */}
                                        <div className="w-1/2 p-4">
                                            <div className='ml-2'> 
                                                Descripcion: 
                                            </div>
                                        
                                            <div className='w-full '>
                                            <input
                                                type='text'
                                                id='description'
                                                name='description'
                                                onChange={handleChange}
                                                value={formData.description}
                                                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                                            />
                                            </div>

                                        </div>
                                        {/* Tipo */}
                                        <div className="w-1/2 p-4">
                                            <div className='ml-2'> 
                                                Tipo: 
                                            </div>
                                        
                                            <div className='w-full '>
                                            <select
                                                id='type'
                                                name='type'
                                                className='mt-1 p-1 w-full border rounded-md'
                                                onChange={handleChange}
                                                value={formData.type}
                                                >
                                                <option>Seleccione...</option>
                                            
                                                <option selected value="" disabled>
                                                    Seleccione
                                                </option>
                                                <option value=" Profit & Loss" >
                                                    Profit & Loss
                                                </option>
                                            
                                                
                                            </select>
                                            </div>

                                        </div>
                                        {/* P&L Line */}
                                        <div className="w-1/2 p-4">
                                            <div className='ml-2'> 
                                                P&L Line: 
                                            </div>
                                        
                                            <div className='w-full '>

                                          


                                            <select
                                                  id='pl_line_id'
                                                  name='pl_line_id'
                                                  className='mt-1 p-1 w-full border rounded-md'
                                                  onChange={handleChange}
                                                  value={formData.pl_line_id}
                                                >
                                                  <option>Seleccione...</option>
                                                  {Pls.length > 0 &&
                                                    Pls.map((data) => (
                                                      <option key={data.id} value={data.id}>
                                                        {data.name} 
                                                      </option>
                                                    ))}
                                            </select>





                                         
                                            </div>

                                        </div>
                                    </div>

                                    <div className='border w-full'> </div>

                                    <div className="w-full center ">
                                    {!isEdit && (
                                        <>
                                        <button
                                        type='button'
                                            onClick={() => submit( )}
                                            className={`bg-gray-800 text-white px-4 py-2 rounded-md ml-2 mt-2 mb-2 ${
                                                !IsFormAprobacionDataValid ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                            // disabled={!IsFormAprobacionDataValid}
                                            >
                                            Crear
                                        </button>    
                                            </> 
                                            )}
                                    {isEdit && (
                                    <>
                                    <button
                                    type='button'
                                        onClick={() => submit( )}
                                        className={`bg-gray-800 text-white px-4 py-2 rounded-md ml-2 mt-2 mb-2 ${
                                            !IsFormAprobacionDataValid ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        // disabled={!IsFormAprobacionDataValid}
                                        >
                                        Actualizar
                                    </button>    
                                        </> 
                                    )}
                                    </div>

                                </form>
                            </div>
                            </>
                        )}
                    </>
                    ) : showStage === 1 ? (
                    <>
                        
                        {!loader && (
                        <>
                         <table className='  w-full bg-white border border-gray-300 '>
                         <thead>
                            <tr className='bg-gray-800 text-gray-100 text-sm'>
                            <th className='border border-gray-300 p-2'>ID</th>
                            <th className='border border-gray-300 p-2'>Codigo</th>
                            <th className='border border-gray-300 p-2'>Descripcion</th>
                            <th className='border border-gray-300 p-2'>Tipo</th>
                            <th className='border border-gray-300 p-2'>P&L Line</th>
                            <th className='border border-gray-300 p-2'>Fecha</th>
                            <th className='border border-gray-300 p-2'>Creador</th>
                            <th className='border border-gray-300 p-2'>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                    {CuentaContable.map((data) => (
                      <tr
                        key={data.id}
                            className='bg-white hover:bg-slate-500 hover:text-white dark:hover:bg-gray-600 text-sm'
                        >
                        <td className='border border-gray-300 p-2 text-center'>
                          {data.id}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {data.code}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {data.description}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {data.type}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {data.purchase_pil_line ? data.purchase_pil_line.name : "Pendiente"}
                      </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {formatDate(data.created_new_date)}
                        </td>
                       
                        <td className='border border-gray-300 p-2 text-center'>
                          {data.creator_name}
                        </td>
        
                        <td className='border border-gray-300 p-2 flex-center flex'>
                                  {showDelete && (
                                      <button
                                        type='button'
                                        className='ml-2 bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm'
                                        style={{ fontSize: '12px' }}
                                        title="Eliminar Cuenta Contable"
                                        onClick={() => handleDelete(data)} 
                                        >
                                        <FaTrash  />
                                      </button>
                                    )}
                                   <button
                                    type='button'
                                    className='ml-2 bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm'
                                    style={{ fontSize: '12px' }}
                                    title="Editar Cuenta Contable"
                                    onClick={() => handleEdit(data)} 
                                    >
                                    <FaEdit  />
                                  </button>

                        </td>                 
                     
                      </tr>
                    ))}
                  </tbody>
                         </table>
                        {renderPagination()}
                        </>
                        )}

                    </>
                    ):(
                        <>   
                            {loader && (
                            <div className='text-center'>
                            <div className='loader mx-auto'></div>
                            </div>
                        )}
                            </>
                    )}

                    {loader && (
                    <div className='text-center'>
                        <div className='loader mx-auto'></div>
                    </div>
                    )}
                </div>
            </div>
            </>
            )

}

export default PurchaseCuentaContable