import React, { useState, useEffect } from 'react';
import { getData, postData, putData, getStorage } from '../../api';
import {
  FaPlusCircle,
  FaEdit,
  FaMinusCircle,
  FaRegFilePdf,
} from 'react-icons/fa';
import { decrypt, encrypt } from './../../components/crypto';
const ModalLogs = ({ id, onClose, onSave }) => {
  const [logs, setLogs] = useState([]);
  const [expandedLogs, setExpandedLogs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const getEventLogs = async (id) => {
    try {
      const changelogs = await getData(
        `eventLogs/clients/${id}?page=${currentPage}&pageSize=${pageSize}`,
      );

      if (changelogs) {
        const { data, meta } = changelogs;

        console.log(decrypt(data[0].changes.replace(/"/g, '')));
        setLogs(data);
      }
    } catch (error) {
      console.error('Error al obtener los eventlogs:', error);
    } finally {
    }
  };

  useEffect(() => {
    if (id) {
      getEventLogs(id);
    }
  }, [id]);
  const handleExpand = (eventlog_id) => {
    setExpandedLogs((prevId) => (prevId === eventlog_id ? null : eventlog_id));
  };
  return (
    <div
      className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 `}
    >
      <div
        className='absolute top-0 right-0 transform bg-white p-6 rounded-md h-full shadow-md overflow-auto'
        style={{ width: 600 }}
      >
        <h2 className='text-lg font-semibold mb-4'>Registros</h2>
        <div className='mb-2 overflow-x-auto  bg-gray-50 p-2'>
          <table className='w-full bg-white border border-gray-300 text-sm'>
            <thead>
              <tr className='bg-gray-800 text-gray-100'>
                <th className='border border-gray-300 text-center'>
                  <div className='flex items-center justify-center'>
                    <FaPlusCircle
                      className='cursor-pointer mr-2 transition duration-300 ease-in-out transform hover:text-blue-700 hover:scale-110'
                      title='Permite Expandir'
                    />
                  </div>
                </th>
                <th className='border border-gray-300 p-2'>ID</th>
                <th className='border border-gray-300 p-2'>Fecha Edición</th>
                <th className='border border-gray-300 p-2'>Usuario</th>
                <th className='border border-gray-300 p-2'>Empresa</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((change) => (
                <React.Fragment key={change.id}>
                  <tr key={change.id}>
                    <td className='border border-gray-300 text-center'>
                      {change.changes && (
                        <div className='flex items-center justify-center'>
                          <div
                            className='cursor-pointer'
                            onClick={() => handleExpand(change.id)}
                            title='Expandir'
                          >
                            {expandedLogs === change.id ? (
                              <FaMinusCircle className='mr-2' />
                            ) : (
                              <FaPlusCircle className='mr-2' />
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className='border border-gray-300 p-2 text-center'>
                      {change.id}
                    </td>
                    <td className='border border-gray-300 p-2 text-center'>
                      {change.createdAt}
                    </td>
                  </tr>
                  {expandedLogs === change.id && (
                    <>
                      <tr>
                        <td></td>
                        <td colSpan={4}>
                          <table className='w-full bg-white border border-gray-300 text-sm'>
                            <thead>
                              <tr className='bg-gray-400 text-gray-100'>
                                <th className='border border-gray-300 p-1'>
                                  Campo
                                </th>
                                <th className='border border-gray-300 p-1'>
                                  Original
                                </th>
                                <th className='border border-gray-300 p-1'>
                                  Actualizado
                                </th>
                              </tr>
                            </thead>
                            {Object.entries(
                              decrypt(change.changes.replace(/"/g, '')),
                            ).map((field, index) => (
                              <tr className='bg-cyan-100' key={index}>
                                <td className='border border-gray-300'>
                                  {field[0]}
                                </td>
                                <td className='border border-gray-300'>
                                  {field[1].oldValue}
                                </td>
                                <td className='border border-gray-300'>
                                  {field[1].newValue}
                                </td>
                              </tr>
                            ))}
                          </table>
                        </td>
                      </tr>
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModalLogs;
