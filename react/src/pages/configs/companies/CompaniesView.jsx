import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { show } from '../../../api';
import Stepper from '../../../components/stepper/stepper';
import { useNavigate, Link } from "react-router-dom";

function CompaniesView() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    async function getCompaniesView() {
      try {
        const response = await show(`companies/getCompanyById/${id}`);
        
        if (response) {
          console.log(response);
          setCompany(response);
          setLoader(false);
        } else {
          console.error('La respuesta no tiene la estructura esperada:', response);
          setLoader(false);
        }
      } catch (error) {
        console.error('Error al obtener los detalles de la empresa', error);
        setLoader(false);
      }
    }
    
    getCompaniesView();
  }, [id]);

  return (
    <>
   {loader ? (
        <div className="text-center">
          <div className="loader mx-auto"></div>
        </div>
      ) : (
         <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white border rounded shadow mt-5">
               <Stepper currentStep={1} totalSteps={3} stepTexts={['Entidades', 'Ver',  company.id]}/> 
               <h1 className="text-2xl font-bold mb-3 p-4">Detalles de la Entidad</h1>
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
                           defaultValue={company.company}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" "
                           readOnly />
                     </div>

                     {/* Acrónimo */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Acrónimo:
                        </label>
                        <input 
                           id="acronym" 
                           name="acronym"
                           defaultValue={company.acronym}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" "
                           readOnly />
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
                           defaultValue={company.rif}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" "
                           readOnly />
                     </div>

                     {/* Estado Ubicación */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Estado (Ubicación):
                        </label>
                        <input 
                           id="state_id" 
                           name="state_id"
                           defaultValue={company.state_id}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" "
                           readOnly />
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
                           defaultValue={company.phone}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " 
                           readOnly />
                     </div>

                     {/* Otro teléfono */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Teléfono (otro):
                        </label>
                        <input 
                           id="other_phone" 
                           name="other_phone"
                           defaultValue={company.other_phone}
                           className="mt-1 p-2 w-full border rounded-md"
                           placeholder=" " 
                           readOnly />
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
                           defaultValue={company.address}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " 
                           readOnly />
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
                           defaultValue={company.email}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" "
                           readOnly />
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
                           defaultValue={company.password}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" "
                           readOnly />
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
                           defaultValue={company.website}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " 
                           readOnly />
                     </div>
                  </div>

                  <div className="flex w-full mb-4 space-x-4">
                     {/* Social Media */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Redes Sociales:
                        </label>
                        <textarea 
                           type="text" 
                           id="social_media"
                           name="social_media" 
                           defaultValue={company.social_media}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " 
                           readOnly />
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
                           defaultValue={company.isotipo}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " 
                           readOnly />
                     </div>
                  </div>

                  <div className="flex w-full mb-4 space-x-4">
                     {/* Banner */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Banner:
                        </label>
                        <input 
                           type="text" 
                           id="banner"
                           name="banner" 
                           defaultValue={company.banner}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " 
                           readOnly />
                     </div>
                  </div>

                  <div className="flex w-full mb-4 space-x-4">
                     {/* Logotipo */}
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600">
                           Logotipo:
                        </label>
                        <input 
                           type="text" 
                           id="logotipo"
                           name="logotipo" 
                           defaultValue={company.logotipo}
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " 
                           readOnly />
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
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " 
                           readOnly />
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
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " 
                           readOnly />
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
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " 
                           readOnly />
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
                           className="mt-1 p-2 w-full border rounded-md" 
                           placeholder=" " 
                           readOnly
                           rows={4} />
                     </div>
                  </div>   
               </div>
               <div className="flex justify-end bg-white border rounded shadow p-4">
                  <Link type="button" to={'../companies/companiesindex'} className="bg-gray-400 text-white px-4 py-2 rounded-md ml-2">Editar</Link>
                  <Link type="button" to={'../companies/companiesindex'} className="bg-gray-400 text-white px-4 py-2 rounded-md ml-2 ">Regresar</Link>
               </div>
            </div>
         </div>   
      )}
    </>
  );
}

export default CompaniesView;
