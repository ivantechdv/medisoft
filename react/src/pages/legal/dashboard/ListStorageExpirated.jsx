import { Link, Navigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { show } from '../../../api';
import { useUser } from '../../../context/userContext';
import { FaPaperclip } from 'react-icons/fa';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import PdfViewer from '../../../components/PdfViewer/PdfViewer';
function LegalStorageListExpirated({ company_id }) {
  const [OriginalStorageList, setOriginalStorageList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Número de usuarios por página
  const [totalPages, setTotalPages] = useState(1);
  const [storages, setStorages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useUser();
  let showAll = false;
  const [selectedCompany, setSelectedCompany] = useState(0);

  const [isImagen, setIsImagen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalPdf, setIsModalPdf] = useState(false);
  const isDesktop = window.innerWidth > 768;
  const srcPreview = useRef('');

  const getStorages = async () => {
    let url = `legal/getStoragesByExpirated?page=${currentPage}&pageSize=${pageSize}&id=${searchTerm}&field=title`;

    // Agrega el filtro de empresa si se ha seleccionado una
    if (company_id != 0 && company_id != null) {
      url += `&company_id=${company_id}`;
    }

    const storages = await show(url);

    const { data, meta } = storages;
    setOriginalStorageList(data);
    setStorages(data);
    setTotalPages(meta.totalPages);
  };
  useEffect(() => {
    setStorages([]);
    setSelectedCompany(company_id);
    getStorages();
    showAll = false;
  }, [currentPage, pageSize, searchTerm, user, company_id]);

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

  const handleViewFile = (url) => {
    setIsImagen(false);
    srcPreview.current = url;
    const DocViewer = ['xls', 'xlsx', 'doc', 'docx']; // Lista de extensiones permitidas
    const ImgViewer = ['png', 'jpg', 'jpeg', 'gif', 'svg']; // Lista de extensiones permitidas para imágenes
    const fileExtension = url.split('.').pop().toLowerCase();

    if (DocViewer.includes(fileExtension)) {
      // Si es un documento compatible con Office, se muestra en el iframe
      const fileSrc = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
        url,
      )}&action=embedview&wdHideTopBar=1&wdHideCommandBar=1&wdHideHeader=1&wdHideNavigationPane=1`;

      srcPreview.current = fileSrc;
      setIsModalOpen(true);
    } else if (fileExtension == 'pdf') {
      setIsModalPdf(true);

      // Abre la URL en una nueva pestaña
      //window.open(googleDocsViewerSrc, '_blank');
    } else if (ImgViewer.includes(fileExtension)) {
      // Si es una imagen, abre la imagen en una nueva pestaña
      //window.open(fileSrc, '_blank');
      setIsImagen(true);
      setIsModalOpen(true);
    }
  };
  return (
    <>
      <div className='max-w-6xl text-sm'>
        <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
          <>
            <div className='   w-[98%]  border-gray-300     '>
              <div className='flex'>
                <input
                  type='text'
                  placeholder='Buscar por título'
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                  className={`mt-1 p-1 ${
                    isDesktop ? 'w-1/2' : 'w-full'
                  } border rounded-md focus:outline-none focus:border-blue-500 transition duration-300`}
                />
              </div>
            </div>
            <div className='mb-4 overflow-x-auto  bg-gray-50 text-sm'>
              <table className=' w-full bg-white border border-gray-300 '>
                <thead>
                  <tr className='bg-gray-800 text-gray-100 text-xs'>
                    <th className='border border-gray-300 p-1'>Empresa</th>
                    <th className='border border-gray-300 p-1'>Categoria</th>
                    <th className='border border-gray-300 p-1'>Título</th>
                    <th className='border border-gray-300 p-1'>Fecha</th>
                    <th className='border border-gray-300 p-1'>
                      Fecha
                      <br />
                      expiración
                    </th>
                    <th className='border border-gray-300 p-1'>
                      Periodo
                      <br />
                      alertar
                    </th>
                    <th className='border border-gray-300 p-1'>Adjunto</th>
                  </tr>
                </thead>
                <tbody>
                  {storages.length > 0 &&
                    storages.map((storage) => (
                      <tr
                        key={storage.id}
                        className='bg-white hover:bg-slate-500 hover:text-white dark:hover:bg-gray-600 text-sm'
                      >
                        <td className='border border-gray-300 p-1 text-center'>
                          {storage.company.company}
                        </td>
                        <td className='border border-gray-300 p-1 text-center'>
                          {storage.legal_category.name}
                        </td>
                        <td className='border border-gray-300 p-1 text-center'>
                          {storage.title}
                        </td>
                        <td className='border border-gray-300 p-1 text-center'>
                          {formatDate(storage.createdAt)}
                        </td>
                        <td className='border border-gray-300 p-1 text-center'>
                          {storage.date_expiration != null
                            ? formatDate(storage.date_expiration)
                            : 'N/A'}
                        </td>
                        <td className='border border-gray-300 p-1 text-center'>
                          {storage.alert_period != null
                            ? storage.alert_period + ' dias'
                            : 'N/A'}
                        </td>
                        <td className='border border-gray-300 p-1 flex-center'>
                          <button
                            type='button'
                            className='bg-gray-500 text-white px-2 py-2 rounded-md'
                            onClick={() => handleViewFile(storage.url)}
                          >
                            <FaPaperclip />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {renderPagination()}
            </div>
          </>
          {isModalOpen && (
            <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center '>
              {isImagen ? (
                <>
                  <div className='bg-white p-2 rounded shadow-lg w-1/2'>
                    <img
                      alt='imagen'
                      src={srcPreview.current}
                      className='w-full'
                      height='500'
                    />
                    <button
                      type='button'
                      onClick={() => setIsModalOpen(false)}
                      className='px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600'
                    >
                      Cerrar vista previa
                    </button>
                  </div>
                </>
              ) : (
                <div className='bg-white p-2 rounded shadow-lg w-full'>
                  <iframe
                    src={srcPreview.current}
                    title='Archivo'
                    width='100%'
                    height='500'
                  ></iframe>
                  <button
                    type='button'
                    onClick={() => setIsModalOpen(false)}
                    className='px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600'
                  >
                    Cerrar vista previa
                  </button>
                </div>
              )}
            </div>
          )}
          {isModalPdf && (
            <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center '>
              <PdfViewer
                url={srcPreview.current}
                onClose={() => setIsModalPdf(false)}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LegalStorageListExpirated;
