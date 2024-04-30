 
import './index.css';
import ToastNotify from '../../../components/toaster/toaster';
import { Link, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { show, putWithData, postWithData } from '../../../api';
import Stepper from '../../../components/stepper/stepper';
import { useUser } from '../../../context/userContext';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { FaEdit, FaTrash  } from 'react-icons/fa';

function PurchaseAprobador() {
    const initialValues = {
        creator_name: '',
        creator_username: '',
        creator_id: '',
        created_new_date: new Date(),
        created: '',
        cost_center_id:  0,
        company_id: 0,
        user_id: 0,
        department_id: 0,
        level0: false,
        level1: false,
        level2: false,
        level3: false,
        first_approver: false,
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
      const [Aprobadores, setAprobadores] = useState([])
      const [originalAprobadores, setOriginalAprobadores] = useState([])
      const [reloadData, setReloadData] = useState(false);
      const [searchTerm, setSearchTerm] = useState('');
      const [showDelete, setShowDelete ] = useState(false)
      const [isEdit, setIsEdit ] = useState(false)
      const [Companies, setCompanies] = useState([])
      const [CostCenters, setCostCenters] = useState([])
      const [Departments, SetDepartments] = useState([])
      const formatDate = (date) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(date).toLocaleDateString('es-ES', options);
      };

      //getAprobadores
      useEffect(() => {

        async function  getAprobadores() {
    
          let url = `purchases/getPurchaseAprobador?page=${currentPage}&pageSize=${pageSize}&id=${searchTerm}&field=title`;
          const response = await show(url);
      
          const { data, meta } = response;
          let actives = data.filter(array => array.soft_delete != true)
          console.log('actives= ? ', actives)
          setAprobadores(actives)
          setOriginalAprobadores(actives);
          setTotalPages(meta.totalPages);
          setLoader(false)
        }
        if (user != null){
            if (!user.Permisology_purchase.can_create_aprobador){
                ToastNotify({message:"No tiene permisos suficientes"})
                let url = '/purchases/layout';
                window.location.href = url;
            }
        }
        if (user != null && user.Permisology_purchase) {
        
         
          if (user.Permisology_purchase.can_delete_aprobador){
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
          getAprobadores()
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
          await putWithData('purchases/updatePurchaseAprobador/'+ formData.id, formData)
          ToastNotify({message:"Actualizado"})
          setFormData(initialValues);
          setIsEdit(false)
        }else{ 
          formData.creator_name = user.first_name + " " + user.last_name
          formData.creator_username = user.email 
          formData.creator_id = user.id 
          formData.created  = formatDate(new Date())
          formData.aprobator_id = parseInt(formData.aprobator_id, 10);
        
      
          await postWithData('purchases/createPurchaseAprobador', formData)
     
          ToastNotify({message:"Guardado"})
          setFormData(initialValues);
        }
    
    
    
      }
    

      const handleDelete = async (data) => {
        const f = confirm("Esta seguro que desea eliminar este Aprobador?")
        if (f){
            data.soft_delete = true
          await putWithData('purchases/softDeleteAprobador/' + data.id ,data  )
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

      // getAllUsers
      useEffect(() => {

        const fetchSelect = async () => {
          const com = await show('users/getAllUsers');
          setUsers(com.data);
      
     
          const companys = await show('companies/getCompanies')
          setCompanies(companys) 

          const cost_centers = await show('purchases/getPurchaseCostCentersList')
          setCostCenters(cost_centers.data) 
          

          const department = await show('departments/getDepartmentsList')
          SetDepartments(department.data)
        };
    
        fetchSelect();
        
      }, []);

      // Verificar si los campos del formulario son válidos
      useEffect(() => {
    
        const {
          cost_center_id,
          company_id,
          user_id,
          department_id,
       
            
        } = formData;
        
        
    
       
     
        const isValid =
        cost_center_id  && 
        company_id  && 
        user_id  && 
        department_id  
     
        
         
        setIsFormAprobacionDataValid(isValid);
      }, [formData]);


      return (
        <>
          <div className='max-w-6xl mx-auto p-6 mt-6 text-sm'>
            <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
                <Stepper
                currentStep={showStage}
                totalSteps={2}
                stepTexts={['Agregar Aprobador', 'Lista de Aprobadores']}
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
                                Company: 
                                </div>
                            
                                <select
                                      id='company_id'
                                      name='company_id'
                                      className='mt-1 p-1 w-full border rounded-md'
                                      onChange={handleChange}
                                      value={formData.company_id}
                                    >
                                      <option>Seleccione...</option>
                                      {Companies.length > 0 &&
                                        Companies.map((company) => (
                                          <option key={company.id} value={company.id}>
                                            {company.company}  
                                          </option>
                                        ))}
                                </select>
                              </div>
    
                              <div className="w-1/2 p-4">
                                <div className='ml-2'> 
                                Aprobador: 
                                </div>
                            
                                <select
                                      id='user_id'
                                      name='user_id'
                                      className='mt-1 p-1 w-full border rounded-md'
                                      onChange={handleChange}
                                      value={formData.user_id}
                                    >
                                      <option>Seleccione...</option>
                                      {users.length > 0 &&
                                        users.map((user) => (
                                          <option key={user.id} value={user.id}>
                                            {user.first_name} {user.last_name} - ({user.company.company})
                                          </option>
                                        ))}
                                </select>
                              </div>
                              <div className="w-1/2 p-4">
                                <div className='ml-2'> 
                                Department: 
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
                                        Departments.map((Department) => (
                                          <option key={Department.id} value={Department.id}>
                                            {Department.department}  
                                          </option>
                                        ))}
                                </select>
                              </div>
                              <div className="w-1/2 p-4">
                                <div className='ml-2'> 
                                Cost Center: 
                                </div>
                            
                                <select
                                      id='cost_center_id'
                                      name='cost_center_id'
                                      className='mt-1 p-1 w-full border rounded-md'
                                      onChange={handleChange}
                                      value={formData.cost_center_id}
                                    >
                                      <option>Seleccione...</option>
                                      {CostCenters.length > 0 &&
                                        CostCenters.map((costCenter) => (
                                          <option key={costCenter.id} value={costCenter.id}>
                                            {costCenter.name}  
                                          </option>
                                        ))}
                                </select>
                              </div>
                     
                            </div>
    
                            <div className='border w-full'> </div>
                              
                            {/*  Aprobador inicial:  */}
                            <div className="flex-col ">
                              <div className="w-full">
                                <div className='ml-2'> 
                                  <b>
                                  Aprobador inicial:
                                  </b>
                                </div>
                              </div>
                              <div className="flex">
                                <div className="w-1/4 p-2 flex-col-center">
                                    <div className='ml-1'> 
                                    first_approver
                                    </div>
                                  
                                    <div className='w-full flex-col-center  mt-2'> 
                                      <input
                                          type='checkbox'
                                          name='first_approver'
                                          id='first_approver'
                                          checked={formData.first_approver}
                                          onChange={handleChange}
                                          className='mr-2'
                                        />
                                    </div>
    
                                </div>                               
                              </div>
                            </div>

                            <div className='border w-full'> </div>

                              {/*   Niveles de Aprobacion:  */}
                            <div className="flex-col ">
                              <div className="w-full">
                                <div className='ml-2'> 
                                  <b>
                                  Niveles de Aprobacion: 
                                  </b>
                                </div>
                              </div>
                              <div className="flex">
                                <div className="w-1/4 p-2 flex-col-center">
                                    <div className='ml-1'> 
                                    level0
                                    </div>
                                    <div className='ml-1'> 
                                    (&lt; 500):
                                    </div>
                                    <div className='w-full flex-col-center  mt-2'> 
                                      <input
                                          type='checkbox'
                                          name='level0'
                                          id='level0'
                                          checked={formData.level0}
                                          onChange={handleChange}
                                          className='mr-2'
                                        />
                                    </div>
    
                                </div>
                                <div className="w-1/4 p-2 flex-col-center">
                                    <div className='ml-1'> 
                                    level1:
                                    () 
                                    </div>
                                    <div className='ml-1'> 
                                    (501 &gt; y &lt; 2500)
                                    </div>
    
                                    <div className='w-full flex-col-center  mt-2'> 
                                      <input
                                          type='checkbox'
                                          name='level1'
                                          id='level1'
                                          checked={formData.level1}
                                          onChange={handleChange}
                                          className='mr-2'
                                        />
                                    </div>
    
                                </div>
                                <div className="w-1/4 p-2 flex-col-center">
                                    <div className='ml-1'> 
                                    level2: 
                                    </div>
                                    <div className='ml-1'> 
                                    (2501 &gt; y &lt; 4999)
                                    </div>
    
                                    <div className='w-full flex-col-center  mt-2'> 
                                      <input
                                          type='checkbox'
                                          name='level2'
                                          id='level2'
                                          checked={formData.level2}
                                          onChange={handleChange}
                                          className='mr-2'
                                        />
                                    </div>
    
                                </div>
                                <div className="w-1/4 p-2 flex-col-center">
                                    <div className='ml-1'> 
                                    level3: 
                                    </div>
                                    <div className='ml-1'> 
                                    (5000 &gt;)
                                    </div>
    
                                    <div className='w-full flex-col-center mt-2'> 
                                      <input
                                          type='checkbox'
                                          name='level3'
                                          id='level3'
                                          checked={formData.level3}
                                          onChange={handleChange}
                                          className='mr-2'
                                        />
                                    </div>
    
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
                                      disabled={!IsFormAprobacionDataValid}
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
                                  disabled={!IsFormAprobacionDataValid}
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
                          <th className='border border-gray-300 p-2'>Company</th>
                          <th className='border border-gray-300 p-2'>Aprobador</th>
                          <th className='border border-gray-300 p-2'>Department</th>
                          <th className='border border-gray-300 p-2'>Centro de Costo</th>
                          <th className='border border-gray-300 p-2'>Aprobador Inicial</th>
                     
                          <th className='border border-gray-300 p-2'>
                            <div>nivel 0</div>
                            <div>
                            (&lt; 500)
                            </div>
                          </th>
                          <th className='border border-gray-300 p-2'>
                            <div>nivel 1</div>
                            <div>
                            (501 &gt; y &lt; 2500)
                            </div>
                          </th>
                          <th className='border border-gray-300 p-2'>
                            <div>nivel 2</div>
                            <div>
                            (2501 &gt; y &lt; 4999)
                            </div>
                          </th>
                          <th className='border border-gray-300 p-2'>
                            <div>nivel 3</div>
                            <div>
                            (5000 &gt;)
                            </div>
                          </th>
                          <th className='border border-gray-300 p-2'>Fecha</th>
                          <th className='border border-gray-300 p-2'>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Aprobadores.map((Aprobador) => (
                          <tr
                            key={Aprobador.id}
                            className='bg-white hover:bg-slate-500 hover:text-white dark:hover:bg-gray-600 text-sm'
                          >
                            <td className='border border-gray-300 p-2 text-center'>
                              {Aprobador.id}
                            </td>
                            <td className='border border-gray-300 p-2 text-center'>
                              {Aprobador.creator_name}
                            </td>
                            <td className='border border-gray-300 p-2 text-center'>
                              {Aprobador.company.company}
                            </td>
                            <td className='border border-gray-300 p-2 text-center'>
                              {Aprobador.user.first_name}         {Aprobador.user.last_name}
                            </td>
                            <td className='border border-gray-300 p-2 text-center'>
                              {Aprobador.department.department}
                            </td>
                            <td className='border border-gray-300 p-2 text-center'>
                              {Aprobador.PurchaseCostCenter.name}
                            </td>
                            <td className='border border-gray-300 p-2 text-center'>
                              {Aprobador.first_approver ? 'x' : ''}
                            </td>
                            <td className='border border-gray-300 p-2 text-center'>
                              {Aprobador.level0 ? 'x' : ''}
                            </td>
                            <td className='border border-gray-300 p-2 text-center'>
                              {Aprobador.level1 ? 'x' : ''}
                            </td>
                            <td className='border border-gray-300 p-2 text-center'>
                              {Aprobador.level2 ? 'x' : ''}
                            </td>
                            <td className='border border-gray-300 p-2 text-center'>
                              {Aprobador.level3 ? 'x' : ''}
                            </td>
    
                            <td className='border border-gray-300 p-2 text-center'>
                              {formatDate(Aprobador.created_new_date)}
                            </td>
                           
                          
                          
                        
                              
                             
                                <>
                               
                                  <td className='border border-gray-300 p-2 flex-center flex'>
                                      {showDelete && (
                                          <button
                                            type='button'
                                            className='ml-2 bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm'
                                            style={{ fontSize: '12px' }}
                                            title="Eliminar Centro de Costo"
                                            onClick={() => handleDelete(Aprobador)} 
                                            >
                                            <FaTrash  />
                                          </button>
                                        )}
                                       <button
                                        type='button'
                                        className='ml-2 bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm'
                                        style={{ fontSize: '12px' }}
                                        title="Editar Centro de Costo"
                                        onClick={() => handleEdit(Aprobador)} 
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


export default PurchaseAprobador