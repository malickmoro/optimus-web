// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],

  define: {
    'process.env.REACT_APP_BACKEND_URL': JSON.stringify('https://optimus-backend-49b31c7c7d3a.herokuapp.com'),
    'process.env.REACT_APP_API_KEY': JSON.stringify('pFYuSfBn1Iw2XBlN-CAokQ'),
    'process.env.VITE_ENV': JSON.stringify('production'),
    'process.env.REACT_APP_CEDI_RATE': JSON.stringify('16.5'),
    'process.env.REACT_APP_MERCHANT_ID': JSON.stringify('2022959')
  },
  build: {
    chunkSizeWarningLimit: 1000, // Set limit to 1000kB
  }
});