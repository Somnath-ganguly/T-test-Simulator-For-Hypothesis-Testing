import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const api = {
  checkHealth: async () => {
    const res = await client.get('/health');
    return res.data;
  },

  generateData: async (params) => {
    const res = await client.post('/generate-data', params);
    return res.data;
  },

  runTTest: async (payload) => {
    const res = await client.post('/ttest', payload);
    return res.data;
  },

  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
