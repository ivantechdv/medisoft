import { getCachedData } from '../api';
import { getUserPreferences, saveUserPreferences } from '../api/userPreferences';

export const UI_THEME_STORAGE_KEY = 'erp_ui_theme';
export const UI_THEME_ENTITY = 'ui_theme';

export const FONT_SIZE_MIN = 8;
export const FONT_SIZE_MAX = 28;

export const DEFAULT_UI_THEME = {
  fontFamily: 'Manrope',
  fontSize: '11px',
  formLabelSize: '10px',
  formTitleSize: '13px',
  formInputSize: '11px',
  labelColor: '#374151',
  titleColor: '#111827',
  panelTitleColor: '#274C8F',
  panelTextColor: '#334155',
  cardTitleSize: '13px',
  cardTitleColor: '#1f2937',
  cardTextSize: '12px',
  cardTextColor: '#4b5563',
  cardPadding: '8px',
  tableHeaderSize: '10px',
  tableHeaderColor: '#334155',
  tableCellSize: '10.5px',
  tableCellColor: '#1f2937',
  pageBackgroundColor: '#f1f4f8',
  pageBackgroundPattern: 'none',
  sidebarBackgroundColor: '#f8f9fb',
  topNavBackgroundColor: '#f6f8fb',
  sidebarFontFamily: 'Manrope',
  sidebarFontSize: '12px',
  sidebarTextColor: '#243447',
  toolbarFontFamily: 'Manrope',
  toolbarFontSize: '10.5px',
  toolbarTextColor: '#1f2937',
  toolbarBackgroundColor: '#ffffff',
};

export const PAGE_BACKGROUND_PATTERN_OPTIONS = [
  { value: 'none', label: 'Ninguno (sólido)' },
  { value: 'dots', label: 'Puntos' },
  { value: 'grid', label: 'Cuadrícula' },
  { value: 'doodle', label: 'Doodle (estilo chat)' },
];

/** Patterns SVG sutiles (tipo WhatsApp) sobre el color de fondo */
export const PAGE_BACKGROUND_PATTERNS = {
  none: 'none',
  dots: `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'><circle cx='2' cy='2' r='1.2' fill='rgba(36,52,71,0.12)'/></svg>`,
  )}")`,
  grid: `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M24 0H0V24' fill='none' stroke='rgba(36,52,71,0.08)' stroke-width='1'/></svg>`,
  )}")`,
  doodle: `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='rgba(36,52,71,0.10)' stroke-width='1.4' stroke-linecap='round'><circle cx='18' cy='22' r='6'/><path d='M40 18h16M40 26h10'/><path d='M70 20c6-8 16-8 22 0'/><rect x='14' y='50' width='14' height='10' rx='2'/><path d='M42 55h18'/><circle cx='90' cy='56' r='5'/><path d='M20 90c8 0 8 10 0 10M40 88l8 12M70 92h22M98 84v16'/></g></svg>`,
  )}")`,
};

export const FONT_FAMILY_OPTIONS = [
  { value: 'Manrope', label: 'Manrope' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Source Sans 3', label: 'Source Sans 3' },
  { value: 'Work Sans', label: 'Work Sans' },
  { value: 'Segoe UI', label: 'Segoe UI' },
  { value: 'system-ui', label: 'System UI' },
];

const GOOGLE_FONT_FAMILIES = {
  Manrope: 'Manrope:wght@400;500;600;700',
  Inter: 'Inter:wght@400;500;600;700',
  Roboto: 'Roboto:wght@400;500;700',
  'Open Sans': 'Open+Sans:wght@400;500;600;700',
  Lato: 'Lato:wght@400;700',
  Poppins: 'Poppins:wght@400;500;600;700',
  Nunito: 'Nunito:wght@400;500;600;700',
  Montserrat: 'Montserrat:wght@400;500;600;700',
  'Source Sans 3': 'Source+Sans+3:wght@400;500;600;700',
  'Work Sans': 'Work+Sans:wght@400;500;600;700',
};

const loadedFontLinks = new Set();

const loadGoogleFont = (fontFamily) => {
  const googleFont = GOOGLE_FONT_FAMILIES[fontFamily];
  if (!googleFont || loadedFontLinks.has(fontFamily)) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${googleFont}&display=swap`;
  document.head.appendChild(link);
  loadedFontLinks.add(fontFamily);
};

export const pxToNumber = (value, fallback) => {
  const parsed = Number.parseFloat(String(value ?? '').replace(/px$/i, ''));
  if (Number.isNaN(parsed)) {
    return Number.parseFloat(String(fallback).replace(/px$/i, '')) || 11;
  }
  return parsed;
};

export const clampFontSize = (value, fallback) => {
  const numeric = pxToNumber(value, fallback);
  const clamped = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, numeric));
  const rounded = Math.round(clamped * 10) / 10;
  return `${rounded}px`;
};

export const getUiThemeStorageKey = (userId) =>
  userId ? `${UI_THEME_STORAGE_KEY}_${userId}` : UI_THEME_STORAGE_KEY;

export const normalizeUiTheme = (theme = {}) => ({
  fontFamily: theme.fontFamily || DEFAULT_UI_THEME.fontFamily,
  fontSize: clampFontSize(theme.fontSize, DEFAULT_UI_THEME.fontSize),
  formLabelSize: clampFontSize(theme.formLabelSize, DEFAULT_UI_THEME.formLabelSize),
  formTitleSize: clampFontSize(theme.formTitleSize, DEFAULT_UI_THEME.formTitleSize),
  formInputSize: clampFontSize(theme.formInputSize, DEFAULT_UI_THEME.formInputSize),
  labelColor: theme.labelColor || DEFAULT_UI_THEME.labelColor,
  titleColor: theme.titleColor || DEFAULT_UI_THEME.titleColor,
  panelTitleColor: theme.panelTitleColor || DEFAULT_UI_THEME.panelTitleColor,
  panelTextColor: theme.panelTextColor || DEFAULT_UI_THEME.panelTextColor,
  cardTitleSize: clampFontSize(theme.cardTitleSize, DEFAULT_UI_THEME.cardTitleSize),
  cardTitleColor: theme.cardTitleColor || DEFAULT_UI_THEME.cardTitleColor,
  cardTextSize: clampFontSize(theme.cardTextSize, DEFAULT_UI_THEME.cardTextSize),
  cardTextColor: theme.cardTextColor || DEFAULT_UI_THEME.cardTextColor,
  cardPadding: clampFontSize(theme.cardPadding, DEFAULT_UI_THEME.cardPadding),
  tableHeaderSize: clampFontSize(theme.tableHeaderSize, DEFAULT_UI_THEME.tableHeaderSize),
  tableHeaderColor: theme.tableHeaderColor || DEFAULT_UI_THEME.tableHeaderColor,
  tableCellSize: clampFontSize(theme.tableCellSize, DEFAULT_UI_THEME.tableCellSize),
  tableCellColor: theme.tableCellColor || DEFAULT_UI_THEME.tableCellColor,
  pageBackgroundColor:
    theme.pageBackgroundColor || DEFAULT_UI_THEME.pageBackgroundColor,
  pageBackgroundPattern: PAGE_BACKGROUND_PATTERN_OPTIONS.some(
    (option) => option.value === theme.pageBackgroundPattern,
  )
    ? theme.pageBackgroundPattern
    : DEFAULT_UI_THEME.pageBackgroundPattern,
  sidebarBackgroundColor:
    theme.sidebarBackgroundColor || DEFAULT_UI_THEME.sidebarBackgroundColor,
  topNavBackgroundColor:
    theme.topNavBackgroundColor || DEFAULT_UI_THEME.topNavBackgroundColor,
  sidebarFontFamily:
    theme.sidebarFontFamily || DEFAULT_UI_THEME.sidebarFontFamily,
  sidebarFontSize: clampFontSize(
    theme.sidebarFontSize,
    DEFAULT_UI_THEME.sidebarFontSize,
  ),
  sidebarTextColor:
    theme.sidebarTextColor || DEFAULT_UI_THEME.sidebarTextColor,
  toolbarFontFamily:
    theme.toolbarFontFamily || DEFAULT_UI_THEME.toolbarFontFamily,
  toolbarFontSize: clampFontSize(
    theme.toolbarFontSize,
    DEFAULT_UI_THEME.toolbarFontSize,
  ),
  toolbarTextColor:
    theme.toolbarTextColor || DEFAULT_UI_THEME.toolbarTextColor,
  toolbarBackgroundColor:
    theme.toolbarBackgroundColor || DEFAULT_UI_THEME.toolbarBackgroundColor,
});

export const applyUiTheme = (theme = {}, userId) => {
  const normalized = normalizeUiTheme(theme);
  const root = document.documentElement;

  loadGoogleFont(normalized.fontFamily);
  loadGoogleFont(normalized.sidebarFontFamily);
  loadGoogleFont(normalized.toolbarFontFamily);

  const toFontStack = (fontFamily) =>
    fontFamily === 'system-ui'
      ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      : `"${fontFamily}", Inter, "Segoe UI", system-ui, sans-serif`;

  const fontStack = toFontStack(normalized.fontFamily);
  const sidebarFontStack = toFontStack(normalized.sidebarFontFamily);
  const toolbarFontStack = toFontStack(normalized.toolbarFontFamily);

  root.style.setProperty('--erp-font-family', fontStack);
  root.style.setProperty('--erp-font-size-base', normalized.fontSize);
  root.style.setProperty('--erp-form-label-size', normalized.formLabelSize);
  root.style.setProperty('--erp-form-title-size', normalized.formTitleSize);
  root.style.setProperty('--erp-form-input-size', normalized.formInputSize);
  root.style.setProperty('--erp-color-label', normalized.labelColor);
  root.style.setProperty('--erp-color-title', normalized.titleColor);
  root.style.setProperty('--erp-color-panel-title', normalized.panelTitleColor);
  root.style.setProperty('--erp-color-panel-text', normalized.panelTextColor);
  root.style.setProperty('--erp-card-title-size', normalized.cardTitleSize);
  root.style.setProperty('--erp-card-title-color', normalized.cardTitleColor);
  root.style.setProperty('--erp-card-text-size', normalized.cardTextSize);
  root.style.setProperty('--erp-card-text-color', normalized.cardTextColor);
  root.style.setProperty('--erp-card-padding', normalized.cardPadding);
  root.style.setProperty('--erp-table-header-size', normalized.tableHeaderSize);
  root.style.setProperty('--erp-table-header-color', normalized.tableHeaderColor);
  root.style.setProperty('--erp-table-cell-size', normalized.tableCellSize);
  root.style.setProperty('--erp-table-cell-color', normalized.tableCellColor);
  root.style.setProperty(
    '--erp-page-background',
    normalized.pageBackgroundColor,
  );
  root.style.setProperty(
    '--erp-page-background-pattern',
    PAGE_BACKGROUND_PATTERNS[normalized.pageBackgroundPattern] ||
      PAGE_BACKGROUND_PATTERNS.none,
  );
  root.style.setProperty(
    '--erp-sidebar-background',
    normalized.sidebarBackgroundColor,
  );
  root.style.setProperty(
    '--erp-topnav-background',
    normalized.topNavBackgroundColor,
  );
  root.style.setProperty('--erp-sidebar-font-family', sidebarFontStack);
  root.style.setProperty('--erp-sidebar-font-size', normalized.sidebarFontSize);
  root.style.setProperty('--erp-sidebar-text-color', normalized.sidebarTextColor);
  root.style.setProperty('--erp-toolbar-font-family', toolbarFontStack);
  root.style.setProperty('--erp-toolbar-font-size', normalized.toolbarFontSize);
  root.style.setProperty('--erp-toolbar-text-color', normalized.toolbarTextColor);
  root.style.setProperty(
    '--erp-toolbar-background',
    normalized.toolbarBackgroundColor,
  );

  localStorage.setItem(getUiThemeStorageKey(userId), JSON.stringify(normalized));
  return normalized;
};

export const loadUiThemeFromStorage = (userId) => {
  try {
    const raw = localStorage.getItem(getUiThemeStorageKey(userId));
    if (!raw) {
      applyUiTheme(DEFAULT_UI_THEME, userId);
      return DEFAULT_UI_THEME;
    }
    return applyUiTheme(JSON.parse(raw), userId);
  } catch (error) {
    console.error('Error cargando tema UI desde localStorage:', error);
    return applyUiTheme(DEFAULT_UI_THEME, userId);
  }
};

export const loadUiThemeForUser = async (userId) => {
  if (userId) {
    try {
      const preferences = await getUserPreferences(UI_THEME_ENTITY);
      if (preferences && typeof preferences === 'object' && Object.keys(preferences).length) {
        return applyUiTheme(preferences, userId);
      }
    } catch (error) {
      console.warn('No se pudo cargar ui_theme del usuario:', error);
    }
  }

  try {
    const config = await getCachedData('configs/active', 10 * 60 * 1000);
    if (config?.ui_config && typeof config.ui_config === 'object') {
      return applyUiTheme(config.ui_config, userId);
    }
  } catch (error) {
    console.warn('No se pudo cargar ui_config de empresa:', error);
  }

  return loadUiThemeFromStorage(userId);
};

export const saveUiThemeForUser = async (theme, userId) => {
  const normalized = applyUiTheme(theme, userId);
  await saveUserPreferences(UI_THEME_ENTITY, normalized);
  return normalized;
};

export const loadUiThemeFromConfig = async (getCachedDataFn = getCachedData) => {
  try {
    const config = await getCachedDataFn('configs/active', 10 * 60 * 1000);
    const uiConfig = config?.ui_config;
    if (uiConfig && typeof uiConfig === 'object') {
      return applyUiTheme(uiConfig);
    }
  } catch (error) {
    console.warn('No se pudo cargar ui_config desde backend:', error);
  }

  return loadUiThemeFromStorage();
};
