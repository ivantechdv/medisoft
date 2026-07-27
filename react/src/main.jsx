import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';
import './index.css';
import 'tailwindcss/tailwind.css';
import { loadUiThemeFromStorage } from './utils/uiTheme';

loadUiThemeFromStorage();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />,
);
