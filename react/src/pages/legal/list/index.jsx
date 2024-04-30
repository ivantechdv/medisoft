import { Link, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { show, putWithData, postWithData } from '../../../api';
import './index.css';
import ToastNotify from '../../../components/toaster/toaster';
import { useUser } from '../../../context/userContext';
import Stepper from '../../../components/stepper/stepper';
import { FaEdit, FaTrash  } from 'react-icons/fa';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';

function LegalStorageList() {
  const [StorageList, setStorageList] = useState([]);
  const [OriginalStorageList, setOriginalStorageList] = useState([]);
  const [loader, setLoader] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);  
  const [totalPages, setTotalPages] = useState(1);
  const [storages, setStorages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showType, setShowType] = useState(1); //1 my company  2 all companys
  const { user } = useUser();
  let showAll = false;
  const isDesktop = window.innerWidth > 768;
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [reloadData, setReloadData] = useState(false);
  const [showDeletes, setShowDeletes ] = useState(false)
  const [stage, setStage ] = useState(0)
  const [showDelete, setShowDelete] = useState(false)
  useEffect(() => {
    async function getStorages() {
      let url = `legal/getStorages?page=${currentPage}&pageSize=${pageSize}&id=${searchTerm}&field=title`;

      // Agrega el filtro de empresa si se ha seleccionado una
      if (selectedCompany) {
        url += `&company_id=${selectedCompany}`;
      }

      const storages = await show(url);

      if (!showAll) {
        let data = storages.data.filter(
          (array) => array.company_id == user.company_id,
        );
        storages.data = data;
      }

      const { data, meta } = storages;

      setOriginalStorageList(data);
      setStorages(data);
      setTotalPages(meta.totalPages);
      setLoader(false);
    }

    async function getSoftDeleteStorages(){
      let url = `legal/getSoftDeleteStorages?page=${currentPage}&pageSize=${pageSize}&id=${searchTerm}&field=title`;

      // Agrega el filtro de empresa si se ha seleccionado una
      if (selectedCompany) {
        url += `&company_id=${selectedCompany}`;
      }

      const storages = await show(url);

      if (!showAll) {
        let data = storages.data.filter(
          (array) => array.company_id == user.company_id,
        );
      
        storages.data = data;
      }

      const { data, meta } = storages;

      setOriginalStorageList(data);
      setStorages(data);
      setTotalPages(meta.totalPages);
      setLoader(false);
    }


 
    if (user != null && user.Permisology_legal) {

      if (user.Permisology_legal.can_storage_show_deletes){
        setShowDeletes(true)
        
      }
      if (user.Permisology_legal.can_storage_delete){
          setShowDelete(true)
      }


      if (
        user.Permisology_legal.can_access_list_all_companys ||
        user.Permisology_legal.can_access_list_my_company
      ) {
        if (
          !user.Permisology_legal.can_access_list_all_companys &&
          user.Permisology_legal.can_access_list_my_company
        ) {
    
              if (stage == 1){
                getSoftDeleteStorages()
              }else {
                getStorages();
              }
              setShowType(1);
              showAll = false;
        } else if (user.Permisology_legal.can_access_list_all_companys) {
    
        
            if (stage == 1){
              getSoftDeleteStorages()
            }else {
              getStorages();
            }
          
          setShowType(2);
          showAll = true;
        } else {
          alert('no tiene permisos suficientes');
          setShowType(0);
          let url = '/legal/layout';
          window.location.href = url;
        }
      }
    } else {
      setLoader(true);
    }

    if (reloadData) {
      getStorages();
      setReloadData(false);
    }


  }, [currentPage, pageSize, searchTerm, selectedCompany, reloadData, stage]);

  useEffect(() => {
    const fetchSelect = async () => {
      const com = await show('companies/getCompanies');
      setCompanies(com);
      const cat = await show('legal/getCategories');
      setCategories(cat);
    };

    fetchSelect();
  }, []);

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

  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reiniciar a la primera página al cambiar el término de búsqueda
  };
  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
  };
  const sendDeleted = async (id) => {
    const array = ({ 
      user_id: user.id, 
      question: 'deleted',
      type: 'deleted',
      original:'deleted',
      nuevo:'deleted',
      createdAt: new Date(), 
      storage_id: parseInt(id, 10),
    })
    await postWithData('legal/postChangeLog', array);

}

 

  const handleDelete = async (storage) => {
 
    const f = confirm("Esta seguro que desea eliminar este storage?")
    if (f){
      storage.soft_delete = true
      await putWithData('legal/softDeleteStorage/' + storage.id ,storage  )
      ToastNotify({ message: "Eliminado!", position: 'top-right' });
      setReloadData(true); // Esto activará el useEffect para volver a cargar los datos
      await sendDeleted(storage.id)
    }else{ 
      ToastNotify({ message: "Cancelado", position: 'top-right' });
    }
  }

  
  const handleStepClick = (step) => {
    setStage(step - 1);
  };

  return (
    <>
      <div className='max-w-6xl mx-auto p-6 mt-6 text-sm'>
        <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
          {showDeletes && (
            <Stepper
            currentStep={stage}
            totalSteps={2}
            stepTexts={['Lista de Registros','Registros eliminados']}
            onStepClick={handleStepClick}
            />
          )}

        {!showDeletes && (
            <Stepper
            currentStep={1}
            totalSteps={1}
            stepTexts={['Lista de Registros']}
            />
          )}

          {!loader && (
            <>
              <div className='   w-[98%]  border-gray-300     '>
                <div className='flex'>
                  <input
                    type='text'
                    placeholder='Busqueda por Titulo'
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                    className={`mt-1 p-1 ${
                      isDesktop ? 'w-1/2' : 'w-full'
                    } border rounded-md focus:outline-none focus:border-blue-500 transition duration-300`}
                  />
                  <Link to='/legal/storage' className=' ml-auto'>
                    <button
                      className='bg-blue-700 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded transition duration-300 text-sm mt-2'
                      href='/legal/storage'
                    >
                      Nuevo
                    </button>
                  </Link>
                </div>

                <div className='flex'>
                  <div className='w-2/4'>
                    {showType == 2 && (
                      <>
                        <select
                          id='company_id'
                          name='company_id'
                          className='mt-1 p-1 w-full border rounded-md'
                          onChange={handleCompanyChange}
                          value={selectedCompany}
                        >
                          <option>Seleccione...</option>
                          {companies.length > 0 &&
                            companies.map((company) => (
                              <option key={company.id} value={company.id}>
                                {company.company}
                              </option>
                            ))}
                        </select>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className='mb-4 overflow-x-auto  bg-gray-50 p-2 text-sm'>
                <table className='  w-full bg-white border border-gray-300 '>
                  <thead>
                    <tr className='bg-gray-800 text-gray-100 text-sm'>
                      <th className='border border-gray-300 p-2'>ID</th>
                      <th className='border border-gray-300 p-2'>Categoria</th>
                      <th className='border border-gray-300 p-2'>Compania</th>
                      <th className='border border-gray-300 p-2'>Titulo</th>
                      <th className='border border-gray-300 p-2'>Fecha</th>
                      <th className='border border-gray-300 p-2'>
                        Fecha
                        <br />
                        expiración
                      </th>
                      <th className='border border-gray-300 p-2'>
                        Periodo
                        <br />
                        alertar
                      </th>
                      <th className='border border-gray-300 p-2'>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storages.map((storage) => (
                      <tr
                        key={storage.id}
                        className='bg-white hover:bg-slate-500 hover:text-white dark:hover:bg-gray-600 text-sm'
                      >
                        <td className='border border-gray-300 p-2 text-center'>
                          {storage.id}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {storage.legal_category.name}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {storage.company.company}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {storage.title}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {formatDate(storage.createdAt)}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {storage.date_expiration != null
                            ? formatDate(storage.date_expiration)
                            : 'N/A'}
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          {storage.alert_period != null
                            ? storage.alert_period
                            : 'N/A'}
                        </td>
                        <td className='border border-gray-300 p-2 flex-center flex'>
                          <Link to={`/legal/storage/${storage.id}`}>
                            <button
                              type='button'
                              className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm'
                              style={{ fontSize: '12px' }}
                              title="Ver"
                            >
                              <FaEdit />
                            </button>
                          </Link>
                          
                          {stage == 0 && (
                            <>
                              {showDelete && (
                                <button
                                  type='button'
                                  className='ml-2 bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm'
                                  style={{ fontSize: '12px' }}
                                  title="Eliminar storage"
                                  onClick={() => handleDelete(storage)} 
                                  >
                                  <FaTrash  />
                                </button>
                              )}
                            </>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {renderPagination()}
              </div>
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
  );
}

export default LegalStorageList;
