import { Link, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { show } from '../../../api';
import './index.css';
import ToastNotify from '../../../components/toaster/toaster';

function SolicitudList() {
  const [PurchasesList, setPurchasesList] = useState([]);
  const [OriginalPurchasesList, setOriginalPurchaseList] = useState([]);

  const [loader , setLoader ] = useState(true)


  let date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  date = `${day}/${month}/${year}`;

  // filter form 
  const [formData, setFormData] = useState({
    creator_name: ` `,
    creator_username: ` `,
    creator_id: ` `,
    creator_company_id: 0,
    created: date,
    created_new_date: new Date(),
   
    department_id: 0,
    req_name: '',
    delivery_date: '',
    attachment_url: '',
    comments: '',
    stage: 0,
  });



  let cached = false 
  useEffect(() => {
    async function getPurchases() {

    

      const list = await show('purchases/getPurchaseSolicitudes');
      let originalquantity = 0 
        for (const element of list) {
          let object = [];

          element.itemQuantity = originalquantity;
          // Utilizamos Promise.all para esperar a que todas las operaciones asíncronas se completen
            let items = await show('purchases/getPurchaseItemByPurchaseSolicitudId/' + element.id)
            if (items){ 
              for (const item of items){
                object.push(item)
                element.itemQuantity = element.itemQuantity  + 1 
                element.itemsObject = object
              }

            }
          element.itemsObject = object;
        }
        setOriginalPurchaseList(list)
        setPurchasesList(list);
        setLoader(false)
      
    
    }

  

    getPurchases();
 
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


 

  const cleanFilters   = () => {
    setPurchasesList(OriginalPurchasesList)
    ToastNotify({ message: "lista restaurada", position: 'top-right' });

  }

  const submitFilters = () => {
  
    console.log(formData)

     // Filtrar la lista original en función de los valores del formulario
    const filteredList = OriginalPurchasesList.filter((purchase) => {
      // Verificar si el valor del formulario coincide con el valor de la etapa (stage)
      return formData.stage === '' || parseInt(formData.stage, 10) === purchase.stage;
    });

    // Actualizar la lista de compras con la lista filtrada
    setPurchasesList(filteredList);



    ToastNotify({ message: "Filtros aplicados", position: 'top-right' });

  }


  return (
    <>
      <div className="max-w-8xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-3 p-4">Lista de Solicitudes</h1>

        {!loader && (
        <div className="flex">

          {/* lista  */}
       
          <div className="purchases-list flex-col w-3/4   overflow-auto">       
            {PurchasesList.map((purchase) => (
              <Link   to={`/purchases/solicitud/view/${purchase.id}`}> 
              
         
                <div key={purchase.id} className="item-for-list">
                  {/* Primera fila */}
                  <div className="flex justify-between items-center p-1">
                    <div className="text-xl font-bold text-gray-800">#{purchase.id}</div>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                      {purchase.stage === 0 ? 'Creando Solicitud' : 'Espera de Revisión'}
                    </button>
                  </div>

                  {/* Segunda fila */}
                  <div className="flex justify-between items-center p-4">
               
                    <div>
                      <p className="font-bold">Nombre:</p>
                      <p>{purchase.creator_name}</p>
                    </div>
                    <div>
                      <p className="font-bold">Departamento:</p>
                      <p>{purchase.department_id}</p>
                    </div>
                  </div>

                  {/* Tercera fila */}
                  <div className="flex justify-between items-center p-4">
                    <div>
                      <p className="font-bold">Nombre de Requisición:</p>
                      <p>{purchase.req_name}</p>
                    </div>
                    <div>
                      <p className="font-bold">Fecha de Entrega Estimada:</p>
                      <p>{purchase.delivery_date}</p>
                    </div>
                    <div>
                      <p className="font-bold">Cantidad de Items:</p>
                      <p>{purchase.itemQuantity}</p>
                    </div>
                  </div>
                </div>
              </Link>

            ))}
          </div>

          {/* filtros */}
          <form  >
            <div className="filters-box w-1/4   ml-10 flex-col">
            

                {/* header  */}
                <div className="w-full filter-header font-bold">
                    Filtros: 
                </div>
                  {/* Creator  */}
                  <div className="flex w-full mb-4 space-x-4">
                    
                      <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600">
                            Creador:
                          </label>
                          <input
                            type="text"
                            name="creator_name"
                            value={formData.creator_name}
                            onChange={handleChange}
                            disabled={true}
                            className="mt-1 p-2 w-full border rounded-md"
                            />
                      </div>
                  </div>

                {/* Stage */}
                  <div className="flex w-full mb-4 space-x-4">
                    
                      <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600">
                            Etapa:
                          </label>
                          <select
                              name="stage"
                              value={formData.stage}
                              onChange={handleChange}
                              
                              className="mt-1 p-2 w-full border rounded-md"
                            >
                            <option value="" disabled>
                            Selecciona
                            </option>
                            <option value="0" >
                            Creando Solicitud
                            </option>
                            <option value="1" >
                            Espera de Revisión
                            </option>
                          </select>
                      </div>
                  </div>

                  {/* Fechas */}
                  <div className=" w-full mb-4 space-x-4 flex-col">
                  Fechas:
                  <div className='flex'> 
                      <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600">
                            Fechas Inicio:
                          </label>
                          <input
                            type="text"
                            name="creator_name"
                            value={formData.creator_name}
                            onChange={handleChange}
                
                            className="mt-1 p-2 w-full border rounded-md"
                            />
                      </div>
                      <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600">
                            Fechas Fin:
                          </label>
                          <input
                            type="text"
                            name="creator_name"
                            value={formData.creator_name}
                            onChange={handleChange}
                
                            className="mt-1 p-2 w-full border rounded-md"
                            />
                      </div>
                  </div>
                  

                </div>




                  {/* buttons */}
                  <div className="flex w-full mb-4 space-x-4 mt-[auto]" >
              
                    
                  <div className="flex-1 justify-between items-center p-1">
                    <button  type="button" onClick={() => cleanFilters( )}  className="bg-blue-500 text-white px-4 py-2 rounded-md">
                      Limpiar
                    </button>
                  </div>

                      
                  <div className="flex-1 justify-between items-center p-1">
                    <button  type="button" onClick={() => submitFilters( )} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                      Filtrar 
                    </button>
                  </div>

                  </div>


          
            </div>
          </form>
        
        </div>
         )}

        {/* Mostrar el loader mientras los datos están cargando */}
        {loader && (
        <div className="text-center">
          <div className="loader mx-auto"></div>
        </div>
      )}


      </div>
    </>
  );
  
}

export default SolicitudList;
