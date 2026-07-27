export const UI_THEME_STORAGE_KEY = 'erp_ui_theme';

export const DEFAULT_UI_THEME = {
  fontFamily: 'Manrope',
  fontSize: '11px',
  // Solo formularios
  labelColor: '#374151',
  titleColor: '#111827',
  // Solo paneles/fichas (cliente, cuidador)
  panelTitleColor: '#274C8F',
  panelTextColor: '#334155',
  // Cards internas (ej. Datos Familiar)
  cardTitleSize: '13px',
  cardTitleColor: '#1f2937',
  cardTextSize: '12px',
  cardTextColor: '#4b5563',
  cardPadding: '8px',
  // Tablas de listados (clientes / cuidadores)
  tableHeaderSize: '10px',
  tableHeaderColor: '#334155',
  tableCellSize: '10.5px',
  tableCellColor: '#1f2937',
};

export const FONT_FAMILY_OPTIONS = [
  { value: 'Manrope', label: 'Manrope' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Segoe UI', label: 'Segoe UI' },
  { value: 'system-ui', label: 'System UI' },
];

export const FONT_SIZE_OPTIONS = [
  { value: '10px', label: '10 px (compacto)' },
  { value: '11px', label: '11 px (predeterminado)' },
  { value: '12px', label: '12 px' },
  { value: '13px', label: '13 px' },
  { value: '14px', label: '14 px (grande)' },
];

export const CARD_PADDING_OPTIONS = [
  { value: '6px', label: 'Compacto (6px)' },
  { value: '8px', label: 'Normal (8px)' },
  { value: '12px', label: 'Amplio (12px)' },
  { value: '16px', label: 'Grande (16px)' },
];

export const TABLE_SIZE_OPTIONS = [
  { value: '9px', label: '9 px' },
  { value: '10px', label: '10 px' },
  { value: '10.5px', label: '10.5 px' },
  { value: '11px', label: '11 px' },
  { value: '12px', label: '12 px' },
  { value: '13px', label: '13 px' },
];

const GOOGLE_FONT_FAMILIES = {
  Manrope: 'Manrope:wght@400;500;600;700',
  Inter: 'Inter:wght@400;500;600;700',
  Roboto: 'Roboto:wght@400;500;700',
  'Open Sans': 'Open+Sans:wght@400;500;600;700',
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

export const normalizeUiTheme = (theme = {}) => ({
  fontFamily: theme.fontFamily || DEFAULT_UI_THEME.fontFamily,
  fontSize: theme.fontSize || DEFAULT_UI_THEME.fontSize,
  labelColor: theme.labelColor || DEFAULT_UI_THEME.labelColor,
  titleColor: theme.titleColor || DEFAULT_UI_THEME.titleColor,
  panelTitleColor: theme.panelTitleColor || DEFAULT_UI_THEME.panelTitleColor,
  panelTextColor: theme.panelTextColor || DEFAULT_UI_THEME.panelTextColor,
  cardTitleSize: theme.cardTitleSize || DEFAULT_UI_THEME.cardTitleSize,
  cardTitleColor: theme.cardTitleColor || DEFAULT_UI_THEME.cardTitleColor,
  cardTextSize: theme.cardTextSize || DEFAULT_UI_THEME.cardTextSize,
  cardTextColor: theme.cardTextColor || DEFAULT_UI_THEME.cardTextColor,
  cardPadding: theme.cardPadding || DEFAULT_UI_THEME.cardPadding,
  tableHeaderSize: theme.tableHeaderSize || DEFAULT_UI_THEME.tableHeaderSize,
  tableHeaderColor: theme.tableHeaderColor || DEFAULT_UI_THEME.tableHeaderColor,
  tableCellSize: theme.tableCellSize || DEFAULT_UI_THEME.tableCellSize,
  tableCellColor: theme.tableCellColor || DEFAULT_UI_THEME.tableCellColor,
});

export const applyUiTheme = (theme = {}) => {
  const normalized = normalizeUiTheme(theme);
  const root = document.documentElement;

  loadGoogleFont(normalized.fontFamily);

  const fontStack =
    normalized.fontFamily === 'system-ui'
      ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      : `${normalized.fontFamily}, Inter, "Segoe UI", system-ui, sans-serif`;

  root.style.setProperty('--erp-font-family', fontStack);
  root.style.setProperty('--erp-font-size-base', normalized.fontSize);
  // Formularios
  root.style.setProperty('--erp-color-label', normalized.labelColor);
  root.style.setProperty('--erp-color-title', normalized.titleColor);
  // Paneles / fichas
  root.style.setProperty('--erp-color-panel-title', normalized.panelTitleColor);
  root.style.setProperty('--erp-color-panel-text', normalized.panelTextColor);
  // Cards (familiar, etc.)
  root.style.setProperty('--erp-card-title-size', normalized.cardTitleSize);
  root.style.setProperty('--erp-card-title-color', normalized.cardTitleColor);
  root.style.setProperty('--erp-card-text-size', normalized.cardTextSize);
  root.style.setProperty('--erp-card-text-color', normalized.cardTextColor);
  root.style.setProperty('--erp-card-padding', normalized.cardPadding);
  // Tablas listados
  root.style.setProperty('--erp-table-header-size', normalized.tableHeaderSize);
  root.style.setProperty('--erp-table-header-color', normalized.tableHeaderColor);
  root.style.setProperty('--erp-table-cell-size', normalized.tableCellSize);
  root.style.setProperty('--erp-table-cell-color', normalized.tableCellColor);

  localStorage.setItem(UI_THEME_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
};

export const loadUiThemeFromStorage = () => {
  try {
    const raw = localStorage.getItem(UI_THEME_STORAGE_KEY);
    if (!raw) {
      applyUiTheme(DEFAULT_UI_THEME);
      return DEFAULT_UI_THEME;
    }
    return applyUiTheme(JSON.parse(raw));
  } catch (error) {
    console.error('Error cargando tema UI desde localStorage:', error);
    return applyUiTheme(DEFAULT_UI_THEME);
  }
};

export const loadUiThemeFromConfig = async (getCachedData) => {
  try {
    const config = await getCachedData('configs/active', 10 * 60 * 1000);
    const uiConfig = config?.ui_config;
    if (uiConfig && typeof uiConfig === 'object') {
      return applyUiTheme(uiConfig);
    }
  } catch (error) {
    console.warn('No se pudo cargar ui_config desde backend:', error);
  }

  return loadUiThemeFromStorage();
};
