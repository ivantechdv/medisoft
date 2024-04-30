import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useParams } from "react-router-dom";
import { useDropzone } from 'react-dropzone';
import { postWithData, putWithData, show } from '../../../api';
import ToastNotify from '../../../components/toaster/toaster';
import Stepper from '../../../components/stepper/stepper';

const URI = 'companies/updateCompany';

const CompanyUpdate = () => {
  const { id } = useParams(); // Obtiene el ID de los parámetros de la URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    state_id: ``,
    statu: ``,
    acronym: ``,
    company: ``,
    rif: ``,
    phone: ``,
    other_phone: ``,
    address: ``,
    email: ``,
    password: ``,
    website: ``,
    social_media: ``,
    isotipo: ``,
    banner: ``,
    logotipo: ``,
    corporate_style: ``,
    corporate_color: ``,
    title: ``,
    description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await show(`companies/getCompanyById/${id}`);
        setFormData(response);
      } catch (error) {
        console.error('Error al obtener datos para la edición', error);
      }
    };
    fetchData();
  }, [id]);

  const onDrop = useCallback(acceptedFiles => {
    setFormData(prevData => ({
      ...prevData,
      logotipo: acceptedFiles[0].name,
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({ onDrop });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const handleUpdate = async () => {
      try {
        await putWithData(URI + `/${id}`, formData);
        ToastNotify({ message: 'La Entidad fue actualizada.' });
        navigate('../configs/companies/CompaniesView/' + id);
      } catch (error) {
        console.error('Error al actualizar la entidad', error);
      }
    };
    await handleUpdate();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-100 mx-auto p-4">
         <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white border rounded shadow">
               <Stepper currentStep={formData.stage} totalSteps={2} stepTexts={['Configuraciones', 'Entidades']} />
               <h1 className="text-2xl font-bold mb-3 p-4">{'Crear Entidad'}</h1>
               <div className="container w-full p-4">
                  <div className="flex w-full mb-4 space-x-4">
                     {/* Nombre de la empresa o entidad */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Nombre de empresa o entidad:
                        </label>
                        <input 
                           type="text" 
                           id="company"
                           name="company" 
                           value={formData.company}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" placeholder=" " required />
                     </div>

                     {/* Acrónimo */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Acrónimo:
                        </label>
                        <input 
                           id="acronym" 
                           name="acronym"
                           value={formData.acronym}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " 
                           required />
                     </div>
                  </div>

                  <div className="flex w-full mb-4 space-x-4">
                     {/* RIF */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           R.I.F.:
                        </label>
                        <input 
                           type="text" 
                           id="rif"
                           name="rif" 
                           value={formData.rif}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" placeholder=" " required />
                     </div>

                     {/* Estado Ubicación */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Estado (Ubicación):
                        </label>
                        <input 
                           id="state_id" 
                           name="state_id"
                           value={formData.state_id}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " 
                           required />
                     </div>
                  </div>

                  <div className="flex w-full mb-4 space-x-4">
                     {/* Teléfono */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Teléfono:
                        </label>
                        <input 
                           type="text" 
                           id="phone"
                           name="phone" 
                           value={formData.phone}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" placeholder=" " />
                     </div>

                     {/* Otro teléfono */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Teléfono (otro):
                        </label>
                        <input 
                           id="other_phone" 
                           name="other_phone"
                           value={formData.other_phone}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " />
                     </div>
                  </div>

                  <div className="flex w-full mb-4 space-x-4">
                     {/* Dirección */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Dirección:
                        </label>
                        <input 
                           type="text" 
                           id="address"
                           name="address" 
                           value={formData.address}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" placeholder=" " />
                     </div>
                  </div>

                  <div className="flex w-full mb-4 space-x-4">
                     {/* Email */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Correo electrónico:
                        </label>
                        <input 
                           type="text" 
                           id="email"
                           name="email" 
                           value={formData.email}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" placeholder=" " required />
                     </div>

                     {/* Contraseña */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Contraseña:
                        </label>
                        <input 
                           type="text" 
                           id="password"
                           name="password" 
                           value={formData.password}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" placeholder=" " required />
                     </div>
                  </div>

                  <div className="flex w-full mb-4 space-x-4">
                     {/* Sitio web */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Sitio Web:
                        </label>
                        <input 
                           type="text" 
                           id="website"
                           name="website" 
                           value={formData.website}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" placeholder=" " />
                     </div>

                     {/* Social Media */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Redes Sociales:
                        </label>
                        <input 
                           type="text" 
                           id="social_media"
                           name="social_media" 
                           value={formData.social_media}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" placeholder=" " />
                     </div>
                  </div>

                  <div className="flex w-full mb-4 space-x-4">
                     {/* Isotipo */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Isotipo:
                        </label>
                        <input 
                           type="text" 
                           id="isotipo"
                           name="isotipo" 
                           value={formData.isotipo}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" placeholder=" " />
                     </div>

                     {/* Banner */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Banner:
                        </label>
                        <input 
                           type="text" 
                           id="banner"
                           name="banner" 
                           value={formData.banner}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" placeholder=" " />
                     </div>

                     {/* Logotipo */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Logotipo:
                        </label>
                        <input 
                           type="text" 
                           id="logotipo"
                           name="logotipo" 
                           value={formData.logotipo}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" placeholder=" " />
                     </div>
                  </div>

                  <div className="flex w-full mb-4 space-x-4">
                     {/* corporate_style */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Estilo Corporativo:
                        </label>
                        <input 
                           type="text" 
                           id="corporate_style"
                           name="corporate_style" 
                           value={formData.corporate_style} 
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" placeholder=" " />
                     </div>

                     {/* corporate_color */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Color Corporativo:
                        </label>
                        <input 
                           type="text" 
                           id="corporate_color"
                           name="corporate_color" 
                           value={formData.corporate_color}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" placeholder=" " />
                     </div>

                     {/* title */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Título:
                        </label>
                        <input 
                           type="text" 
                           id="title"
                           name="title" 
                           value={formData.title}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" placeholder=" "  />
                     </div>
                  </div>
                  
                  <div className="flex w-full mb-4 space-x-4">
                     {/* Descripcion */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Descripción:
                        </label>
                        <textarea 
                           id="description" 
                           name="description"
                           value={formData.description || ''}
                           onChange={handleChange}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " />
                     </div>
                  </div>   
               </div>  
               <div className="flex justify-end bg-white border rounded shadow p-4">
                  <button
                     onClick={handleSubmit}
                     className={`bg-gray-800 text-white px-4 py-2 rounded-md `}
                  >
                     Actualizar Entidad
                  </button>
                  <Link type="button" to={'../companies/companiesindex'} className="bg-gray-400 text-white px-4 py-2 rounded-md ml-2">Regresar</Link>
               </div>
            </div>  
         </div>  
      </form>
    </>
  );
};

export default CompanyUpdate;
