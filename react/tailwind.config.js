/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        body: 'rgba(244, 244, 246, 1)',
        topNav: 'rgba(236, 208, 153,1)',
        content: 'rgba(255,255,255,1)',
        panel: 'rgba(255,255,255,1)',
        sidebar: 'rgba(71,71,71, 1)',
        sidebarText: 'rgba(255,255,255,1)',
        primary: 'rgba(71,71,71,1)',
        secondary: 'rgba(55, 65, 81, 0.9) ',
        title: 'rgba(17, 24, 39,1) ',
        subtitle: 'rgba(107, 114, 128,1) ',
        textWhite: 'rgba(255,255,255) ',
        breadcrum: 'rgba(17, 24, 39,1) ',
        breadcrum_active: 'rgba(133, 102, 42,1)',
        tableHeader: 'rgba(249, 250, 251, 1) ',
        tab: 'rgba(133, 102, 42, 1)',
      },
    },
  },
  plugins: [],
};
