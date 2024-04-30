import React, { useEffect, useState } from 'react';
import AttachmentHandler from '../../../components/AttachmentHandler/AttachmentHandler';
import './solicitud.css';
import { show, warehouseGetAllMaterials } from '../../../api';
import Select from '../../../components/Select';
function Item({ id, item_name, onRemove, onItemSaved }) {
  const [costCenters, setCostCenters] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [settedMaterials, setSettedMaterials] = useState([]);
  const [materiaslLoader, setMaterialsLoader] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    id: new Date(),
    item_name: ``,
    quantity: 0,
    unit_measure: 0,
    description: '',
    cost_center: 0,
    cost_center_temporal_name: '',
    attachment_url: '',
    wh_material_id: 0,
    wh_material_code: '',
    wh_material_description: '',
    wh_measurement_unit: '',
    department_id: 0,
    department: '',
    material_existence: true,
    new_material: '',
  });

  const [DeleteUpload, setDeleteUpload] = useState(false);

  const handleFileChange = async (url) => {
    if (url != null) {
      setFormData((prevData) => ({
        ...prevData,
        attachment_url: url,
      }));
    }
  };
  const handleChange = (e) => {
    let { name, value } = e.target;
    if (value == 'true') value = true;
    if (value == 'false') value = false;

    if (name == 'material_existence' && value == false) {
      setFormData((prevData) => ({
        ...prevData,
        wh_material_id: 0,
        wh_measurement_unit: '',
      }));
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // onChange(id, fieldName, e.target.value);
  };
  const handleDeleteFile = async () => {
    setFormData((prevData) => ({
      ...prevData,
      attachment_url: '',
    }));
  };

  const handleSubmit = () => {
    let temporalName = costCenters.filter(
      (array) => array.id == formData.cost_center,
    )[0].name;
    // let departmentName = departments.filter(
    //   (array) => array.id == formData.department_id,
    // )[0].department;

    formData.cost_center_temporal_name = temporalName;
    // formData.department = departmentName;
 
    onItemSaved(formData);

    setFormData({
      id: new Date(),
      item_name: ``,
      quantity: 0,
      unit_measure: 0,
      description: '',
      cost_center: 0,
      cost_center_temporal_name: '',
      attachment_url: '',
      wh_material_id: 0,
      wh_material_code: '',
      wh_material_description: '',
      wh_measurement_unit: '',
      department_id: 0,
      department: '',
      material_existence: true,
      new_material: '',
    });
    setFormData((prevData) => ({
      ...prevData,
      attachment_url: '',
    }));
    setDeleteUpload(true);
  };

  let getMaterials = false;

  useEffect(() => {}, [DeleteUpload]);

  useEffect(() => {
    const { id, quantity, wh_measurement_unit, description, cost_center } =
      formData;

    const isValid =
      quantity !== 0 &&
      wh_measurement_unit !== 0 &&
      description.trim() !== '' &&
      cost_center !== 0;

    setIsFormValid(isValid);
  });

  useEffect(() => {
    async function getCostCenters() {
      const list = await show('purchases/getPurchaseCostCentersList');

      setCostCenters(list.data);
    }
    async function getDepartments() {
      const depa = await show('departments/getDepartments');

      setDepartments(depa);
      console.log(depa);
    }

    getCostCenters();
    getDepartments();
  }, []);

  useEffect(() => {
    async function GetAllMaterials() {
      getMaterials = true;
      setMaterialsLoader(true);
      const materials = await warehouseGetAllMaterials();
      setMaterials(materials);
      let object = [];
      materials.forEach((element) => {
        const array = {
          value: element.id,
          label: element.description,
        };
        object.push(array);
      });

      setSettedMaterials(object);
      setMaterialsLoader(false);
    }

    if (!getMaterials) {
      GetAllMaterials();
    }
  }, []);

  const handleChangeSelect = (selectedOption) => {
    let resultMaterial = materials.filter(
      (array) => array.id == selectedOption.value,
    )[0];

    let wh_material_id = resultMaterial.id;
    let wh_material_code = resultMaterial.code;
    let wh_material_description = resultMaterial.description;
    let wh_measurement_unit = resultMaterial.wh_measurement_unit.name;

    setFormData((prevFormData) => ({
      ...prevFormData,
      wh_material_id: wh_material_id,
      wh_material_code: wh_material_code,
      wh_material_description: wh_material_description,
      wh_measurement_unit: wh_measurement_unit,
    }));
  };

  return (
    <div key={id} className='bg-gray-100 p-4 mb-4 rounded stages-box'>
      {/* Renderizar detalles del item */}

      {/* head */}
      <div className='flex-col w-full mb-4 space-x-4 '>
        <div className='w-full  mb-2'>
          <div className='w-full'>
            <strong>Agregar Item:</strong>
          </div>
        </div>

        <div className='flex w-full mb-4 space-x-4 '>
          {/* Departamento */}
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-600'>
              Departamento:
            </label>
            <select
              name='department_id'
              value={formData.department_id}
              onChange={handleChange}
              className='mt-1 p-1 w-full border rounded-md text-sm'
            >
              <option value='' selected disabled>
                Seleccione Departamento
              </option>

              {departments.length > 0 &&
                departments.map((deparment) => (
                  <option key={deparment.id} value={deparment.id}>
                    {deparment.department}
                  </option>
                ))}
            </select>
          </div>
          {/* select  */}
          {formData.material_existence == true && (
            <div className='flex-1 mr-5'>
              {!materiaslLoader && (
                <>
                  <label className='block text-sm font-medium text-gray-600'>
                    Seleccione el elemento:
                  </label>
                  <Select
                    disabled={formData.material_existence == 'false'}
                    id='wh_material_id'
                    name='wh_material_id'
                    options={settedMaterials}
                    // value={formData.wh_material_id}
                    onChange={handleChangeSelect}
                  />
                </>
              )}
              {materiaslLoader && (
                <div className='text-center'>
                  <div className='loader mx-auto'></div>
                </div>
              )}
            </div>
          )}
          {/* existencai */}
          <div className='flex-1  ml-5'>
            <label className='block text-sm font-medium text-gray-600'>
              El elemento existe en la lista?
            </label>
            <select
              name='material_existence'
              value={formData.material_existence}
              onChange={handleChange}
              className='p-2 border rounded bg-gray-200 text-bold ml-2'
            >
              <option value={true}>Si</option>
              <option value={false}>No</option>
            </select>
          </div>

          {/* new material */}
          {formData.material_existence == false && (
            <div className='flex-1  ml-5'>
              <label className='block text-sm font-medium text-gray-600'>
                Nombre del item:
              </label>
              <input
                type='text'
                name='wh_material_description'
                value={formData.wh_material_description}
                onChange={handleChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* first  */}
      <div className='flex w-full mb-4 space-x-4 '>
        {/* Cantidad */}
        <div className='flex-1'>
          <label className='block text-sm font-medium text-gray-600'>
            Cantidad:
          </label>
          <input
            type='number'
            name='quantity'
            value={formData.quantity}
            onChange={handleChange}
          />
        </div>

        {/* Unidad de Medida */}
        {formData.material_existence != false && (
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-600'>
              Unidad de Medida:
            </label>
            <input
              type='text'
              disabled
              name='unit_measure'
              // value={formData.unit_measure}
              value={formData.wh_measurement_unit}
              onChange={handleChange}
            />
          </div>
        )}
        {formData.material_existence == false && (
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-600'>
              Unidad de Medida:
            </label>
            <input
              type='text'
              name='wh_measurement_unit'
              // value={formData.unit_measure}
              value={formData.wh_measurement_unit}
              onChange={handleChange}
            />
          </div>
        )}
        {/*  Centro de Costo: */}
        <div className='flex-1'>
          <label className='block text-sm font-medium text-gray-600'>
            Centro de Costo:
          </label>
          <select
            value={formData.cost_center}
            name='cost_center'
            onChange={handleChange}
          >
            {costCenters.map((cost) => (
              <option key={cost.id} value={cost.id}>
                {cost.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* descripcion  */}
      <div className='flex w-full mb-4 space-x-4'>
        <div className='flex-1'>
          <label className='block text-sm font-medium text-gray-600'>
            Descripción:
          </label>
          <textarea
            value={formData.description}
            onChange={handleChange}
            maxLength={500}
            name='description'
            className='mt-1 p-2 w-full border rounded-md'
          />
        </div>
      </div>

      {/* attachment */}
      <div className='flex-1'>
        <AttachmentHandler
          onFileChange={handleFileChange}
          onFileDelete={handleDeleteFile}
          deleteUpload={DeleteUpload}
        />
      </div>

      <div className='flex justify-end bg-white border rounded shadow p-4'>
        <button
          onClick={() => handleSubmit()}
          className={`bg-gray-800 text-white px-4 py-2 rounded-md ${
            !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!isFormValid}
        >
          Agregar
        </button>
      </div>
    </div>
  );
}

function ItemsList({ items, onRemoveItem, attachmentUrl, onItemSaved }) {
  return (
    <div>
      {items.map((item) => (
        <Item
          key={item.id}
          id={item.id}
          item_name={item.item_name}
          quantity={item.quantity}
          unit_measure={item.unit_measure}
          description={item.description}
          attachmentUrl={attachmentUrl} // Pasa la URL del archivo adjunto a cada Item
          costCenter={item.cost_center}
          department={item.deparment}
          onRemove={onRemoveItem}
          onItemSaved={onItemSaved}
          // onChange={(fieldName, value) => onItemChange(item.id, fieldName, value)}
        />
      ))}
    </div>
  );
}

export default ItemsList;
