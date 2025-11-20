import React, { useEffect, useState, useRef } from 'react';
import { getData, postData, putData } from '../../api';
import { FaFilter, FaPlusCircle, FaMinusCircle, FaCheckCircle } from 'react-icons/fa'; // Incluimos FaCheckCircle
import Spinner from '../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import Breadcrumbs from '../../components/Breadcrumbs';
import Modal from './modal';
import { useParams, useLocation } from 'react-router-dom';
// Asegúrate de importar ToastNotify si lo vas a usar
// import ToastNotify from '../../components/toast/toast'; 

const Patologies = () => {
    // Definición de initialValues y estados
    const initialValues = {
        name: '',
    };
    const [rows, setRows] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [title, setTitle] = useState('');
    const [formData, setFormData] = useState(initialValues);
    const { id: pathId } = useParams(); // Renombramos 'id' para evitar conflicto
    const [selectedRows, setSelectedRows] = useState([]); 
    
    // --- ESTADO CLAVE PARA FILTRO DE ACTIVOS/INACTIVOS ---
    // false = Activos, true = Inactivos
    const [showInactive, setShowInactive] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [tableTopPosition, setTableTopPosition] = useState(0);
    const [loading, setLoading] = useState(false);

    const idRef = useRef(''); // Usado para almacenar el ID en edición
    
    // --- SIMULACIÓN DE DEPENDENCIAS ---
    // Debes reemplazar esta simulación con tu lógica real de permisos/usuario
    const user = { id: 1, permissions: [] }; 
    const verifyPermisology = async (permission, user, message) => {
        // Lógica de verificación de permisos real
        console.log(`Simulando verificación de permiso: ${permission}`);
        return true; 
    };
    
    // --- LÓGICA DE POSICIONAMIENTO (Se mantiene) ---
    useEffect(() => {
        const table = document.querySelector('.table-container2'); 
        if (table) {
            const rect = table.getBoundingClientRect();
            setTableTopPosition(rect.top);
        }
    }, [rows]);

    // --- FUNCIÓN CORREGIDA: handlePageSizeChange ---
    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value)); 
        setCurrentPage(1); 
    };
    
    // --- FUNCIÓN PARA ALTERNAR EL FILTRO DE ESTADO ---
    const handleToggleInactive = () => {
        setShowInactive(prev => !prev);
        setCurrentPage(1); 
        setSelectedRows([]); 
    };

    // --- FUNCIÓN PRINCIPAL DE CARGA DE DATOS (ADAPTADA) ---
    const getRows = async () => {
        setLoading(true);
        try {
            // El valor a enviar es 1 (Activo) si NO estamos mostrando inactivos, y 0 (Inactivo) si SÍ
            const isActiveFilter = showInactive ? 0 : 1; 
            
            const response = await getData(
                `patologies?page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}&is_active=${isActiveFilter}`,
            );

            const { data, meta } = response;

            setRows(data);
            setTotalPages(meta.totalPages);
        } catch (error) {
            console.error('Error al obtener patologías:', error);
            // Si usas ToastNotify, descomenta esto:
            // ToastNotify({ message: 'Error al cargar las patologías', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // --- EFECTO DE CARGA DE DATOS ---
    useEffect(() => {
        getRows();
    }, [currentPage, pageSize, searchTerm, showInactive]); // showInactive incluido aquí

    // --- LÓGICA DE ORDENACIÓN (Se mantiene) ---
    const handleSort = (key) => {
        const direction =
            sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
        // Lógica de ordenación en el cliente o pasar a la API
    };

    // --- LÓGICA DE BÚSQUEDA (Se mantiene) ---
    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    // --- MODAL Y FORMULARIO (Se mantiene) ---
    const openModal = async (row, sub) => {
        setIsModalOpen(true);
        idRef.current = ''; // Nuevo registro
        setFormData(initialValues);
    };

    const closeModal = (update = null) => {
        setIsModalOpen(false);
        setFormData(initialValues);
        if (update) {
            getRows();
        }
    };

    const handleChange = (event) => {
        const { id, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [id]: value,
        }));
    };
    
    // --- FUNCIÓN DE SUBMIT ADAPTADA ---
    const handleSubmit = async () => {
        const dataToSend = { ...formData };
        try {
            let response = '';
            let bandera = false;
            const isEditing = idRef.current !== '';

            if (!isEditing) {
                // Creación
                bandera = await verifyPermisology(
                    'can_create_patology', // Permiso adaptado
                    user,
                    'No tiene permiso de crear patología',
                );
                if (!bandera) return;
                response = await postData('patologies', dataToSend);
            } else {
                // Edición
                bandera = await verifyPermisology(
                    'can_update_patology', // Permiso adaptado
                    user,
                    'No tiene permiso de actualizar patología',
                );
                if (!bandera) return;
                response = await putData(`patologies/${idRef.current}`, dataToSend);
            }
            
            if (response) {
                // ToastNotify({ message: `Patología ${isEditing ? 'actualizada' : 'creada'} con éxito.`, type: 'success' });
                getRows();
                closeModal();
            }

        } catch (error) {
            console.error('Error a registrar:', error);
            // ToastNotify({ message: 'Error al guardar la patología.', type: 'error' });
        }
    };

    // --- CAMBIO DE ESTADO MASIVO (Desactivación/Activación) ---
    const handleMassStatusChange = async () => {
        if (selectedRows.length === 0) return;

        // Si estamos viendo INACTIVOS (showInactive=true), la acción es ACTIVAR (newState=1)
        // Si estamos viendo ACTIVOS (showInactive=false), la acción es DESACTIVAR (newState=0)
        const actionVerb = showInactive ? 'activar' : 'desactivar';
        const newState = showInactive ? 1 : 0;
        const permission = showInactive ? 'can_activate_patologies' : 'can_deactivate_patologies';
        const successMessage = showInactive 
            ? `Se activaron ${selectedRows.length} patología(s) con éxito.` 
            : `Se desactivaron ${selectedRows.length} patología(s) con éxito.`;

        const bandera = await verifyPermisology(permission, user, `No tiene permiso para ${actionVerb} patologías`);
        if (!bandera) return;

        if (!window.confirm(`¿Está seguro de que desea ${actionVerb} ${selectedRows.length} patología(s)?`)) {
            return;
        }

        setLoading(true);
        try {
            // Endpoint genérico para cambiar estado masivamente (POST/PUT)
            await postData('patologies/changeStatus', { 
                ids: selectedRows, 
                is_active: newState 
            });

            // ToastNotify({ message: successMessage, type: 'success' });
            setSelectedRows([]); 
            getRows(); 
        } catch (error) {
            console.error(`Error al ${actionVerb} patologías:`, error);
            // ToastNotify({ message: `Error al ${actionVerb} las patologías seleccionadas`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // --- PAGINACIÓN (Se mantiene) ---
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

    // --- MANEJO DE FILAS (Se mantienen) ---
    const handleRowClick = (rowData, event) => {
        setSelectedRow(rowData);
    };
    const handleEdit = (rowData, event) => {
        idRef.current = rowData.id;
        setFormData(rowData);
        setIsModalOpen(true);
    };

    const handleClosePanel = () => {
        setSelectedRow(false);
    };
    
    const handleSelectRow = (rowId) => {
        setSelectedRows((prevSelectedRows) => {
            if (prevSelectedRows.includes(rowId)) {
                return prevSelectedRows.filter((id) => id !== rowId);
            } else {
                return [...prevSelectedRows, rowId];
            }
        });
    };

    // --- FUNCIÓN ELIMINADA (Ya que usamos el mass status change) ---
    // const toggleSwitch = async (id) => { ... } 
    
    // *******************************************************************
    // ELIMINADA la función handleChangeStatu ya que es reemplazada por handleMassStatusChange
    // *******************************************************************

    return (
        <div className='max-w-full mx-auto'>
            <Breadcrumbs
                items={[
                    { label: 'Inicio', route: '/' },
                    { label: 'Patologías', route: '/patologies' },
                ]}
            />
            <div className='max-w-full mx-auto bg-white shadow-md overflow-hidden sm:rounded-lg border-t-2 border-gray-400'>
                <div className='flex justify-between px-4 py-5 sm:px-6'>
                    <div>
                        <h3 className='text-lg font-semibold leading-6 text-gray-900'>
                            Lista de Patologías {showInactive ? '(Inactivas)' : '(Activas)'}
                        </h3>
                        <p className='mt-1 max-w-2xl text-sm text-gray-500'>
                            Gestiones sus patologías
                        </p>
                    </div>
                    <div className='flex space-x-2 items-center'> 
                        
                        {/* Selector de tamaño de página (CORREGIDO) */}
                        <select
                            className='border rounded h-10 px-2 text-sm'
                            value={pageSize}
                            onChange={handlePageSizeChange} 
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>

                        {/* Botón de Agregar */}
                        <button
                            className='bg-blue-600 hover:bg-blue-700 text-sm text-white font-bold py-1 px-3 rounded h-10'
                            onClick={openModal}
                        >
                            <FaPlusCircle />
                        </button>
                        
                        {/* Botón de Desactivar/Activar Masivo */}
                        <button
                            className={`text-sm text-white font-bold py-2 px-3 rounded h-10 ${
                                showInactive ? 'bg-green-500 hover:bg-green-700' : 'bg-red-500 hover:bg-red-700'
                            } ${
                                selectedRows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={handleMassStatusChange}
                            disabled={selectedRows.length === 0}
                            title={showInactive ? 'Activar Seleccionadas' : 'Desactivar Seleccionadas'}
                        >
                            {showInactive ? <FaCheckCircle className='text-lg' /> : <FaMinusCircle className='text-lg' />}
                        </button>
                        
                        <button className='bg-gray-500 hover:bg-gray-700 text-sm text-white font-bold py-1 px-3 rounded h-10'>
                            <FaFilter />
                        </button>
                        
                        {/* Switch de Inactivos/Activos */}
                        <div className='flex items-center space-x-2 border-l pl-2'>
                            <span className='text-sm text-gray-500'> {!showInactive ?'Activos':'Inactivos'}</span>
                            <button 
                                onClick={handleToggleInactive}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                                    !showInactive ? 'bg-green-600' : 'bg-gray-400'
                                }`}
                                role="switch"
                                aria-checked={!showInactive}
                            >
                                <span
                                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                        !showInactive ? 'translate-x-1' : 'translate-x-6'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div className='border-t border-gray-200 overflow-x-auto table-responsive'>
                    <table
                        className='w-full divide-y divide-gray-200 mb-4 table-container2'
                        style={{ tableLayout: 'fixed' }}
                    >
                        <thead className='bg-gray-50'>
                            <tr>
                                {/* Checkbox maestro */}
                                <th className='w-1/6'>
                                    <input 
                                        type='checkbox' 
                                        checked={rows.length > 0 && selectedRows.length === rows.length}
                                        onChange={() => {
                                            if (selectedRows.length === rows.length) {
                                                setSelectedRows([]);
                                            } else {
                                                setSelectedRows(rows.map(row => row.id));
                                            }
                                        }}
                                        className='mx-2'
                                    />
                                </th>
                                <th className='w-1/6 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    ID
                                </th>
                                <th className='w-2/4 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Nombre
                                </th>
                                <th className='w-2/4 px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                            {rows.length > 0 ? (
                                rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'inherit')}
                                        onDoubleClick={(e) => handleEdit(row, e)}
                                        className={`${selectedRows.includes(row.id) ? 'bg-gray-100' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td className='text-center'>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type='checkbox'
                                                    id={`selectrow-${row.id}`}
                                                    name='selectrow'
                                                    checked={selectedRows.includes(row.id)}
                                                    onChange={() => handleSelectRow(row.id)}
                                                />
                                            </div>
                                        </td>
                                        <td className='px-3'>{row.id}</td>
                                        <td className='max-w-xs truncate px-2'>{row.name}</td>
                                        
                                        {/* --- COLUMNA DE ESTADO CON BADGE --- */}
                                        <td className='px-2 py-2 whitespace-nowrap text-center'>
                                            <span 
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    row.is_active === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {row.is_active === true ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        {/* El switch individual ha sido eliminado */}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className='text-center py-4 text-gray-500'>
                                        No se encontraron patologías {showInactive ? 'inactivas' : 'activas'}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {renderPagination()}
                </div>
            </div>
            
            {/* Modal - Asegúrate de que el componente Modal use 'row' para prellenar */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                id={idRef.current}
                row={formData}
                // Si tu Modal necesita los handlers, pásalos:
                // handleChange={handleChange}
                // handleSubmit={handleSubmit}
            />
            {loading && <Spinner />}
        </div>
    );
};

export default Patologies;