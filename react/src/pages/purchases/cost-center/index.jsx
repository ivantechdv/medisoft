 
import './index.css';
import ToastNotify from '../../../components/toaster/toaster';
import { Link, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { show, putWithData, postWithData } from '../../../api';
import Stepper from '../../../components/stepper/stepper';
import { useUser } from '../../../context/userContext';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { FaEdit, FaTrash  } from 'react-icons/fa';



function PurchasesCostCenter() {
  const initialValues = {
    creator_name: '',
    creator_username: '',
    creator_id: '',
    created_new_date: new Date(),
    created: '',
    name: '',
    company_id: 0, 
    department_id: 0, 
    soft_delete:false, 
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
  const [costCenters, setCostCenters] = useState([])
  const [originalCostCenters, setOriginalCostCenters] = useState([])
  const [reloadData, setReloadData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDelete, setShowDelete ] = useState(false)
  const [isEdit, setIsEdit ] = useState(false)
  const [Companys, setCompanys] = useState([])
  const [Departments, setDepartments] = useState([])
  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
  };
  useEffect(() => {

    async function  getPurchaseCostCenters() {

      let url = `purchases/getPurchaseCostCenters?page=${currentPage}&pageSize=${pageSize}&id=${searchTerm}&field=title`;
      const response = await show(url);
   
      const { data, meta } = response;
      let actives = data.filter(array => array.soft_delete != true)
      setCostCenters(actives)
      setOriginalCostCenters(actives);
      setTotalPages(meta.totalPages);
      setLoader(false)
      



    }
    if (user != null){
      if (!user.Permisology_purchase.can_create_cost_center){
          ToastNotify({message:"No tiene permisos suficientes"})
          let url = '/purchases/layout';
          window.location.href = url;
      }
  }
    if (user != null && user.Permisology_purchase) {

     
      if (user.Permisology_purchase.can_delete_cost_center){
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
      getPurchaseCostCenters()
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
      await putWithData('purchases/updatePurchaseCostCenter/'+ formData.id, formData)
      ToastNotify({message:"Actualizado"})
      setFormData(initialValues);
      setIsEdit(false)
    }else{ 
      formData.creator_name = user.first_name + " " + user.last_name
      formData.creator_username = user.email 
      formData.creator_id = user.id 
      formData.created  = formatDate(new Date())
      formData.aprobator_id = parseInt(formData.aprobator_id, 10);
    
  
      await postWithData('purchases/createPurchaseCostCenter', formData)
 
      ToastNotify({message:"Guardado"})
      setFormData(initialValues);
    }



  }

  const handleDelete = async (costCenter) => {


    const f = confirm("Esta seguro que desea eliminar este Centro de Costo?")
    if (f){
      costCenter.soft_delete = true
      await putWithData('purchases/softDeletePurchaseCostCenter/' + costCenter.id ,costCenter  )
      ToastNotify({ message: "Eliminado!", position: 'top-right' });
      setReloadData(true); // Esto activará el useEffect para volver a cargar los datos
     
    }else{ 
      ToastNotify({ message: "Cancelado", position: 'top-right' });
    }


  }

  const handleEdit = async (costCenter) =>{
  
    setIsEdit(true)
    setFormData(costCenter)
  
    setShowStage(0)
  }

  useEffect(() => {

    const fetchSelect = async () => {
      const com = await show('users/getAllUsers');
      setUsers(com.data);
      
      const compays = await show('companies/getCompanies')
      setCompanys(compays)

      const departments = await show('departments/getDepartmentsList')
      setDepartments(departments.data)
    };

    fetchSelect();
    
  }, []);
  
  // Verificar si los campos del formulario son válidos
  useEffect(() => {
    
    const {
      company_id,
      department_id,
      name,
    } = formData;
    
  
    const isValid = company_id  && department_id  &&  name.trim() !== '' 

     
    setIsFormAprobacionDataValid(isValid);
  }, [formData]);

    return (
    <>
      <div className='max-w-6xl mx-auto p-6 mt-6 text-sm'>
        <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
            <Stepper
            currentStep={showStage}
            totalSteps={2}
            stepTexts={['Agregar Centro de Costo', 'Lista de Centros De Costo']}
            onStepClick={handleStepClick}

            />
            { showStage === 0  ? (
              <> 
                {!loader && (
                  <>
                  <div className='w-full  border-gray-300'>
                  <form className='md:grid md:grid-cols-3 gap-2   flex-col'>

              
                      {/* <div className='flex mt-2 ml-2 mb-2'>
                        <b>Agregar Centro de Costo:</b>
                      </div> */}

                        <div className="flex">
                    

                          <div className="w-1/2 p-4">
                            <div className='ml-2'> 
                            Nombre Centro de Costo: 
                            </div>
                        
                            <div className='w-full '>
                              <input
                                type='text'
                                id='name'
                                name='name'
                                onChange={handleChange}
                                value={formData.name}
                                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                              />
                            </div>

                          </div>

                          <div className="w-1/2 p-4">
                            <div className='ml-2'> 
                            Compania: 
                            </div>
                        
                            <select
                                  id='company_id'
                                  name='company_id'
                                  className='mt-1 p-1 w-full border rounded-md'
                                  onChange={handleChange}
                                  value={formData.company_id}
                                >
                                  <option>Seleccione...</option>
                                  {Companys.length > 0 &&
                                    Companys.map((company) => (
                                      <option key={company.id} value={company.id}>
                                         {company.company}
                                      </option>
                                    ))}
                            </select>
                          </div>


                          <div className="w-1/2 p-4">
                            <div className='ml-2'> 
                            Departamento: 
                            </div>
                        
                            <select
                                  id='department_id'
                                  name='department_id'
                                  className='mt-1 p-1 w-full border rounded-md'
                                  onChange={handleChange}
                                  value={formData.department_id}
                                >
                                  <option>Seleccione...</option>
                                  {Departments.length > 0 &&
                                    Departments.map((department) => (
                                      <option key={department.id} value={department.id}>
                                         {department.department}
                                      </option>
                                    ))}
                            </select>
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
                      <th className='border border-gray-300 p-2'>Creador</th>
                      <th className='border border-gray-300 p-2'>Centro de Costo</th>
                      <th className='border border-gray-300 p-2'>Compania</th>
                      <th className='border border-gray-300 p-2'>Departamento</th>
                    
                      <th className='border border-gray-300 p-2'>Fecha</th>
                      <th className='border border-gray-300 p-2'>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costCenters.map((costCenter) => (
                      <tr
                        key={costCenter.id}
                        className='bg-white hover:bg-slate-500 hover:text-white dark:hover:bg-gray-600 text-sm'
                      >
                        <td className='border border-gray-300 p-2 text-center'>
                          {costCenter.id}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {costCenter.creator_name}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {costCenter.name}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {costCenter.company.company}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {costCenter.department.department}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {formatDate(costCenter.created_new_date)}
                        </td>
                       
                      
                      
                    
                          
                         
                            <>
                           
                              <td className='border border-gray-300 p-2 flex-center flex'>
                                  {showDelete && (
                                      <button
                                        type='button'
                                        className='ml-2 bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm'
                                        style={{ fontSize: '12px' }}
                                        title="Eliminar Centro de Costo"
                                        onClick={() => handleDelete(costCenter)} 
                                        >
                                        <FaTrash  />
                                      </button>
                                    )}
                                   <button
                                    type='button'
                                    className='ml-2 bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm'
                                    style={{ fontSize: '12px' }}
                                    title="Editar Centro de Costo"
                                    onClick={() => handleEdit(costCenter)} 
                                    >
                                    <FaEdit  />
                                  </button>

                                </td>
                           
                            </>
                        
                     
                      </tr>
                    ))}
                  </tbody>
                </table>
                {renderPagination()}
              </>
            )}
            {/* {loader && (
            <div className='text-center'>
              <div className='loader mx-auto'></div>
            </div>
            )} */}

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

export default PurchasesCostCenter