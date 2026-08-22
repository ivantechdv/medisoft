import React, { useEffect, useState, useCallback } from 'react';
import Spinner from '../../../components/Spinner/Spinner';
import ToastNotify from '../../../components/toast/toast';
import { useUser } from '../../../context/userContext';
import {
  applyUiTheme,
  DEFAULT_UI_THEME,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  normalizeUiTheme,
  pxToNumber,
  loadUiThemeForUser,
  saveUiThemeForUser,
} from '../../../utils/uiTheme';

const inputClass =
  'mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500';

const SizeInput = ({ id, labelText, value, onChange }) => (
  <div>
    <label htmlFor={id}>{labelText}</label>
    <div className='mt-1 flex items-center gap-2'>
      <input
        id={id}
        type='number'
        min={FONT_SIZE_MIN}
        max={FONT_SIZE_MAX}
        step='0.5'
        value={pxToNumber(value)}
        onChange={(event) => onChange(`${event.target.value}px`)}
        className={inputClass}
      />
      <span className='text-gray-500 text-sm shrink-0'>px</span>
    </div>
    <p className='mt-1 text-xs text-gray-400'>
      Entre {FONT_SIZE_MIN} y {FONT_SIZE_MAX}
    </p>
  </div>
);

const ColorInput = ({ id, labelText, value, onChange }) => (
  <div>
    <label htmlFor={id}>{labelText}</label>
    <div className='mt-1 flex items-center gap-3'>
      <input
        id={id}
        type='color'
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className='h-10 w-14 rounded border border-gray-300 cursor-pointer'
      />
      <input
        type='text'
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </div>
  </div>
);

const Appearance = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [savingUiTheme, setSavingUiTheme] = useState(false);
  const [uiTheme, setUiTheme] = useState(DEFAULT_UI_THEME);

  const initializeForm = useCallback(async () => {
    try {
      setLoading(true);
      const theme = await loadUiThemeForUser(user?.id);
      setUiTheme(normalizeUiTheme(theme));
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
  }, [user?.id]);

  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  const handleUiThemeChange = (field, value) => {
    setUiTheme((prev) => {
      const nextTheme = normalizeUiTheme({ ...prev, [field]: value });
      applyUiTheme(nextTheme, user?.id);
      return nextTheme;
    });
  };

  const handleUiThemeSubmit = async () => {
    try {
      setSavingUiTheme(true);
      const saved = await saveUiThemeForUser(uiTheme, user?.id);
      setUiTheme(saved);
      ToastNotify({
        message: 'Apariencia guardada para tu usuario',
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
    <div className='bg-white border border-gray-200 rounded-lg shadow p-6 space-y-6 erp-form'>
      <div>
        <h2 className='text-xl font-semibold'>Apariencia</h2>
        <p className='text-sm text-gray-500 mt-1'>
          Esta configuración es por usuario. Los tamaños se indican en píxeles.
          Los botones y los colores de fila de las tablas no se modifican aquí.
        </p>
      </div>

      <div className='space-y-4 border-t pt-4'>
        <h4 className='text-sm font-semibold uppercase tracking-wide'>
          Layout (fondo, menú y barra superior)
        </h4>
        <p className='text-xs text-gray-500'>
          Colores del shell de la aplicación: fondo general, menú lateral y barra superior.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <ColorInput
            id='pageBackgroundColor'
            labelText='Fondo de pantalla'
            value={uiTheme.pageBackgroundColor}
            onChange={(value) => handleUiThemeChange('pageBackgroundColor', value)}
          />
          <ColorInput
            id='sidebarBackgroundColor'
            labelText='Panel lateral (menú)'
            value={uiTheme.sidebarBackgroundColor}
            onChange={(value) =>
              handleUiThemeChange('sidebarBackgroundColor', value)
            }
          />
          <ColorInput
            id='topNavBackgroundColor'
            labelText='Panel superior (top)'
            value={uiTheme.topNavBackgroundColor}
            onChange={(value) =>
              handleUiThemeChange('topNavBackgroundColor', value)
            }
          />
        </div>
        <div
          className='rounded-md border border-gray-200 overflow-hidden'
          style={{ backgroundColor: uiTheme.pageBackgroundColor }}
        >
          <div className='flex h-20'>
            <div
              className='w-16 shrink-0 border-r border-gray-200'
              style={{ backgroundColor: uiTheme.sidebarBackgroundColor }}
              title='Menú lateral'
            />
            <div className='flex-1 flex flex-col'>
              <div
                className='h-7 border-b border-gray-200'
                style={{ backgroundColor: uiTheme.topNavBackgroundColor }}
                title='Barra superior'
              />
              <div className='flex-1 flex items-center justify-center text-xs text-gray-500'>
                Vista previa del layout
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='space-y-4 border-t pt-4'>
        <h4 className='text-sm font-semibold uppercase tracking-wide'>
          Tipografía (global)
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='fontFamily'>Familia de fuente</label>
            <select
              id='fontFamily'
              value={uiTheme.fontFamily}
              onChange={(event) => handleUiThemeChange('fontFamily', event.target.value)}
              className={inputClass}
            >
              {FONT_FAMILY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <SizeInput
            id='fontSize'
            labelText='Tamaño de fuente base'
            value={uiTheme.fontSize}
            onChange={(value) => handleUiThemeChange('fontSize', value)}
          />
        </div>
      </div>

      <div className='space-y-4 border-t pt-4'>
        <h4 className='text-sm font-semibold uppercase tracking-wide'>
          Formularios (toda la aplicación)
        </h4>
        <p className='text-xs text-gray-500'>
          Afecta labels, títulos e inputs de cualquier formulario: clientes, cuidadores,
          configuración, usuarios, servicios, etc.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <SizeInput
            id='formLabelSize'
            labelText='Tamaño de labels'
            value={uiTheme.formLabelSize}
            onChange={(value) => handleUiThemeChange('formLabelSize', value)}
          />
          <SizeInput
            id='formTitleSize'
            labelText='Tamaño de títulos'
            value={uiTheme.formTitleSize}
            onChange={(value) => handleUiThemeChange('formTitleSize', value)}
          />
          <SizeInput
            id='formInputSize'
            labelText='Tamaño de campos (inputs)'
            value={uiTheme.formInputSize}
            onChange={(value) => handleUiThemeChange('formInputSize', value)}
          />
          <ColorInput
            id='labelColor'
            labelText='Color de labels'
            value={uiTheme.labelColor}
            onChange={(value) => handleUiThemeChange('labelColor', value)}
          />
          <ColorInput
            id='titleColor'
            labelText='Color de títulos'
            value={uiTheme.titleColor}
            onChange={(value) => handleUiThemeChange('titleColor', value)}
          />
        </div>
        <div className='rounded-md border border-gray-200 p-4'>
          <h3 style={{ marginBottom: 8 }}>Vista previa título de formulario</h3>
          <label style={{ display: 'block', marginBottom: 6 }}>
            Vista previa label de formulario
          </label>
          <input type='text' defaultValue='Campo de ejemplo' className={inputClass} readOnly />
        </div>
      </div>

      <div className='space-y-4 border-t pt-4'>
        <h4 className='text-sm font-semibold uppercase tracking-wide'>
          Colores de paneles / fichas
        </h4>
        <p className='text-xs text-gray-500'>
          Independientes de los formularios. Afectan la ficha lateral de cliente/cuidador.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <ColorInput
            id='panelTitleColor'
            labelText='Color de títulos del panel'
            value={uiTheme.panelTitleColor}
            onChange={(value) => handleUiThemeChange('panelTitleColor', value)}
          />
          <ColorInput
            id='panelTextColor'
            labelText='Color de texto del panel'
            value={uiTheme.panelTextColor}
            onChange={(value) => handleUiThemeChange('panelTextColor', value)}
          />
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
        <h4 className='text-sm font-semibold uppercase tracking-wide'>
          Cards internas (Datos Familiar)
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <SizeInput
            id='cardPadding'
            labelText='Padding de la card'
            value={uiTheme.cardPadding}
            onChange={(value) => handleUiThemeChange('cardPadding', value)}
          />
          <SizeInput
            id='cardTitleSize'
            labelText='Tamaño del título de la card'
            value={uiTheme.cardTitleSize}
            onChange={(value) => handleUiThemeChange('cardTitleSize', value)}
          />
          <ColorInput
            id='cardTitleColor'
            labelText='Color del título de la card'
            value={uiTheme.cardTitleColor}
            onChange={(value) => handleUiThemeChange('cardTitleColor', value)}
          />
          <SizeInput
            id='cardTextSize'
            labelText='Tamaño del texto interno'
            value={uiTheme.cardTextSize}
            onChange={(value) => handleUiThemeChange('cardTextSize', value)}
          />
          <ColorInput
            id='cardTextColor'
            labelText='Color del texto interno'
            value={uiTheme.cardTextColor}
            onChange={(value) => handleUiThemeChange('cardTextColor', value)}
          />
        </div>
        <div className='erp-familiar-card bg-gray-100 shadow-md rounded-md max-w-xs'>
          <h2 className='erp-familiar-card-title font-semibold'>SUSANA RODRIGUEZ BENITEZ</h2>
          <p className='erp-familiar-card-text'>675 93 84 75</p>
        </div>
      </div>

      <div className='space-y-4 border-t pt-4'>
        <h4 className='text-sm font-semibold uppercase tracking-wide'>
          Tablas (Clientes / Cuidadores)
        </h4>
        <p className='text-xs text-gray-500'>
          Solo tipografía. No cambia los colores de estado de las filas.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <SizeInput
            id='tableHeaderSize'
            labelText='Tamaño de cabecera'
            value={uiTheme.tableHeaderSize}
            onChange={(value) => handleUiThemeChange('tableHeaderSize', value)}
          />
          <ColorInput
            id='tableHeaderColor'
            labelText='Color de cabecera'
            value={uiTheme.tableHeaderColor}
            onChange={(value) => handleUiThemeChange('tableHeaderColor', value)}
          />
          <SizeInput
            id='tableCellSize'
            labelText='Tamaño de celdas'
            value={uiTheme.tableCellSize}
            onChange={(value) => handleUiThemeChange('tableCellSize', value)}
          />
          <ColorInput
            id='tableCellColor'
            labelText='Color de texto en celdas'
            value={uiTheme.tableCellColor}
            onChange={(value) => handleUiThemeChange('tableCellColor', value)}
          />
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
