/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        body: '#F1F4F8',
        topNav: '#F6F8FB',
        content: 'rgba(255,255,255,1)',
        panel: 'rgba(255,255,255,1)',
        sidebar: '#F4F7FB',
        sidebarText: '#1F2937',
        primary: '#274C8F',
        secondary: 'rgba(55, 65, 81, 0.9) ',
        title: 'rgba(17, 24, 39,1) ',
        subtitle: 'rgba(107, 114, 128,1) ',
        textWhite: 'rgba(255,255,255) ',
        breadcrum: '#334155',
        breadcrum_active: '#B68A2F',
        tableHeader: '#EDF2F7',
        tab: '#B68A2F',
        brandGold: '#B68A2F',
        brandGoldSoft: '#F7F1E3',
        brandGoldBorder: '#E5D4A8',
        brandNavy: '#334155',
      },
    },
  },
  plugins: [],
};
