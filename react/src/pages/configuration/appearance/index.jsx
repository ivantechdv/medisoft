import React, { useEffect, useState, useCallback } from 'react';
import { getCachedData, putData } from '../../../api';
import Spinner from '../../../components/Spinner/Spinner';
import ToastNotify from '../../../components/toast/toast';
import {
  applyUiTheme,
  DEFAULT_UI_THEME,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  CARD_PADDING_OPTIONS,
  TABLE_SIZE_OPTIONS,
  normalizeUiTheme,
} from '../../../utils/uiTheme';

const Appearance = () => {
  const [configId, setConfigId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingUiTheme, setSavingUiTheme] = useState(false);
  const [uiTheme, setUiTheme] = useState(DEFAULT_UI_THEME);

  const initializeForm = useCallback(async () => {
    try {
      setLoading(true);
      const configResponse = await getCachedData('configs/active', 10 * 60 * 1000);

      if (configResponse) {
        setConfigId(configResponse.id);
        if (configResponse.ui_config) {
          const normalizedTheme = normalizeUiTheme(configResponse.ui_config);
          setUiTheme(normalizedTheme);
          applyUiTheme(normalizedTheme);
        }
      }
    } catch (error) {
      console.error('Error cargando apariencia:', error);
      ToastNotify({
        message: 'No se pudo cargar la apariencia',
        type: 'error',
        position: 'top-left',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  const handleUiThemeChange = (field, value) => {
    setUiTheme((prev) => {
      const nextTheme = normalizeUiTheme({ ...prev, [field]: value });
      applyUiTheme(nextTheme);
      return nextTheme;
    });
  };

  const handleUiThemeSubmit = async () => {
    if (!configId) {
      ToastNotify({
        message:
          'Primero guarda la configuración general para poder persistir la apariencia en el servidor',
        type: 'error',
        position: 'top-left',
      });
      applyUiTheme(uiTheme);
      return;
    }

    try {
      setSavingUiTheme(true);

      await putData(`configs/${configId}`, {
        ui_config: uiTheme,
      });

      applyUiTheme(uiTheme);

      ToastNotify({
        message: 'Apariencia actualizada',
        type: 'success',
        position: 'top-left',
      });
    } catch (error) {
      console.error('Error guardando apariencia:', error);
      ToastNotify({
        message: 'No se pudo guardar la apariencia',
        type: 'error',
        position: 'top-left',
      });
    } finally {
      setSavingUiTheme(false);
    }
  };

  if (loading) {
    return (
      <div className='py-16'>
        <Spinner />
      </div>
    );
  }

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow p-6 space-y-6'>
      <div>
        <h2 className='text-xl font-semibold text-gray-700'>Apariencia</h2>
        <p className='text-sm text-gray-500 mt-1'>
          Tipografía global. Colores de formularios, paneles, cards y tablas van por separado.
          Los botones no se modifican aquí.
        </p>
      </div>

      <div className='space-y-4'>
        <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
          Tipografía (global)
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='fontFamily'>Familia de fuente</label>
            <select
              id='fontFamily'
              value={uiTheme.fontFamily}
              onChange={(event) => handleUiThemeChange('fontFamily', event.target.value)}
              className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            >
              {FONT_FAMILY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='fontSize'>Tamaño de fuente base</label>
            <select
              id='fontSize'
              value={uiTheme.fontSize}
              onChange={(event) => handleUiThemeChange('fontSize', event.target.value)}
              className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            >
              {FONT_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className='space-y-4 border-t pt-4'>
        <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
          Colores de formularios
        </h4>
        <p className='text-xs text-gray-500'>
          Solo afectan labels y títulos dentro de formularios (pestañas General, etc.).
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='labelColor'>Color de labels</label>
            <div className='mt-1 flex items-center gap-3'>
              <input
                id='labelColor'
                type='color'
                value={uiTheme.labelColor}
                onChange={(event) => handleUiThemeChange('labelColor', event.target.value)}
                className='h-10 w-14 rounded border border-gray-300 cursor-pointer'
              />
              <input
                type='text'
                value={uiTheme.labelColor}
                onChange={(event) => handleUiThemeChange('labelColor', event.target.value)}
                className='block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              />
            </div>
          </div>
          <div>
            <label htmlFor='titleColor'>Color de títulos</label>
            <div className='mt-1 flex items-center gap-3'>
              <input
                id='titleColor'
                type='color'
                value={uiTheme.titleColor}
                onChange={(event) => handleUiThemeChange('titleColor', event.target.value)}
                className='h-10 w-14 rounded border border-gray-300 cursor-pointer'
              />
              <input
                type='text'
                value={uiTheme.titleColor}
                onChange={(event) => handleUiThemeChange('titleColor', event.target.value)}
                className='block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              />
            </div>
          </div>
        </div>
        <div className='rounded-md border border-gray-200 p-4 erp-form'>
          <p style={{ color: uiTheme.titleColor, fontWeight: 600, marginBottom: 8 }}>
            Vista previa título de formulario
          </p>
          <label style={{ color: uiTheme.labelColor, display: 'block' }}>
            Vista previa label de formulario
          </label>
        </div>
      </div>

      <div className='space-y-4 border-t pt-4'>
        <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
          Colores de paneles / fichas
        </h4>
        <p className='text-xs text-gray-500'>
          Independientes de los formularios. Afectan la ficha lateral de cliente/cuidador
          (nombre, “Datos de contacto”, dirección, etc.).
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='panelTitleColor'>Color de títulos del panel</label>
            <div className='mt-1 flex items-center gap-3'>
              <input
                id='panelTitleColor'
                type='color'
                value={uiTheme.panelTitleColor}
                onChange={(event) => handleUiThemeChange('panelTitleColor', event.target.value)}
                className='h-10 w-14 rounded border border-gray-300 cursor-pointer'
              />
              <input
                type='text'
                value={uiTheme.panelTitleColor}
                onChange={(event) => handleUiThemeChange('panelTitleColor', event.target.value)}
                className='block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              />
            </div>
          </div>
          <div>
            <label htmlFor='panelTextColor'>Color de texto del panel</label>
            <div className='mt-1 flex items-center gap-3'>
              <input
                id='panelTextColor'
                type='color'
                value={uiTheme.panelTextColor}
                onChange={(event) => handleUiThemeChange('panelTextColor', event.target.value)}
                className='h-10 w-14 rounded border border-gray-300 cursor-pointer'
              />
              <input
                type='text'
                value={uiTheme.panelTextColor}
                onChange={(event) => handleUiThemeChange('panelTextColor', event.target.value)}
                className='block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              />
            </div>
          </div>
        </div>
        <div className='rounded-md border border-gray-200 p-4 erp-profile-panel'>
          <label className='font-semibold text-base block' style={{ marginBottom: 6 }}>
            Nombre en ficha
          </label>
          <label className='text-primary text-base block' style={{ marginBottom: 6 }}>
            Datos de contacto
          </label>
          <label className='block'>Dirección / texto del panel</label>
        </div>
      </div>

      <div className='space-y-4 border-t pt-4'>
        <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
          Cards internas (Datos Familiar)
        </h4>
        <p className='text-xs text-gray-500'>
          Independiente del panel y de los formularios. Controla la card gris del familiar:
          tamaño, título y texto interno.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='cardPadding'>Tamaño / padding de la card</label>
            <select
              id='cardPadding'
              value={uiTheme.cardPadding}
              onChange={(event) => handleUiThemeChange('cardPadding', event.target.value)}
              className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            >
              {CARD_PADDING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='cardTitleSize'>Tamaño del título de la card</label>
            <select
              id='cardTitleSize'
              value={uiTheme.cardTitleSize}
              onChange={(event) => handleUiThemeChange('cardTitleSize', event.target.value)}
              className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            >
              {FONT_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='cardTitleColor'>Color del título de la card</label>
            <div className='mt-1 flex items-center gap-3'>
              <input
                id='cardTitleColor'
                type='color'
                value={uiTheme.cardTitleColor}
                onChange={(event) => handleUiThemeChange('cardTitleColor', event.target.value)}
                className='h-10 w-14 rounded border border-gray-300 cursor-pointer'
              />
              <input
                type='text'
                value={uiTheme.cardTitleColor}
                onChange={(event) => handleUiThemeChange('cardTitleColor', event.target.value)}
                className='block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              />
            </div>
          </div>
          <div>
            <label htmlFor='cardTextSize'>Tamaño del texto interno</label>
            <select
              id='cardTextSize'
              value={uiTheme.cardTextSize}
              onChange={(event) => handleUiThemeChange('cardTextSize', event.target.value)}
              className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            >
              {FONT_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='cardTextColor'>Color del texto interno</label>
            <div className='mt-1 flex items-center gap-3'>
              <input
                id='cardTextColor'
                type='color'
                value={uiTheme.cardTextColor}
                onChange={(event) => handleUiThemeChange('cardTextColor', event.target.value)}
                className='h-10 w-14 rounded border border-gray-300 cursor-pointer'
              />
              <input
                type='text'
                value={uiTheme.cardTextColor}
                onChange={(event) => handleUiThemeChange('cardTextColor', event.target.value)}
                className='block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              />
            </div>
          </div>
        </div>
        <div className='erp-familiar-card bg-gray-100 shadow-md rounded-md max-w-xs'>
          <h2 className='erp-familiar-card-title font-semibold'>SUSANA RODRIGUEZ BENITEZ</h2>
          <p className='erp-familiar-card-text'>675 93 84 75</p>
        </div>
      </div>

      <div className='space-y-4 border-t pt-4'>
        <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
          Tablas (Clientes / Cuidadores)
        </h4>
        <p className='text-xs text-gray-500'>
          Afecta el listado de clientes y cuidadores: cabeceras y celdas.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='tableHeaderSize'>Tamaño de cabecera</label>
            <select
              id='tableHeaderSize'
              value={uiTheme.tableHeaderSize}
              onChange={(event) => handleUiThemeChange('tableHeaderSize', event.target.value)}
              className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            >
              {TABLE_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='tableHeaderColor'>Color de cabecera</label>
            <div className='mt-1 flex items-center gap-3'>
              <input
                id='tableHeaderColor'
                type='color'
                value={uiTheme.tableHeaderColor}
                onChange={(event) => handleUiThemeChange('tableHeaderColor', event.target.value)}
                className='h-10 w-14 rounded border border-gray-300 cursor-pointer'
              />
              <input
                type='text'
                value={uiTheme.tableHeaderColor}
                onChange={(event) => handleUiThemeChange('tableHeaderColor', event.target.value)}
                className='block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              />
            </div>
          </div>
          <div>
            <label htmlFor='tableCellSize'>Tamaño de celdas</label>
            <select
              id='tableCellSize'
              value={uiTheme.tableCellSize}
              onChange={(event) => handleUiThemeChange('tableCellSize', event.target.value)}
              className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            >
              {TABLE_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='tableCellColor'>Color de texto en celdas</label>
            <div className='mt-1 flex items-center gap-3'>
              <input
                id='tableCellColor'
                type='color'
                value={uiTheme.tableCellColor}
                onChange={(event) => handleUiThemeChange('tableCellColor', event.target.value)}
                className='h-10 w-14 rounded border border-gray-300 cursor-pointer'
              />
              <input
                type='text'
                value={uiTheme.tableCellColor}
                onChange={(event) => handleUiThemeChange('tableCellColor', event.target.value)}
                className='block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              />
            </div>
          </div>
        </div>
        <div className='overflow-hidden rounded-md border border-gray-200 erp-list-page'>
          <table className='w-full'>
            <thead>
              <tr>
                <th className='text-left'>ID</th>
                <th className='text-left'>Nombre</th>
                <th className='text-left'>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div>500</div>
                </td>
                <td>
                  <div>SUSANA RODRIGUEZ</div>
                </td>
                <td>
                  <div>675 93 84 75</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className='flex justify-end border-t pt-4'>
        <button
          type='button'
          onClick={handleUiThemeSubmit}
          disabled={savingUiTheme}
          className={`px-6 py-2 rounded-md text-white font-semibold ${
            savingUiTheme ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {savingUiTheme ? 'Guardando…' : 'Guardar apariencia'}
        </button>
      </div>
    </div>
  );
};

export default Appearance;
