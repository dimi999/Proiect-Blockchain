const axios = require('axios');
require('dotenv').config()

const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

const apillonStorageAPI = axios.create({
  baseURL: 'https://api.apillon.io/storage',
  timeout: 3000,
  headers: {
    'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`
  }
});

module.exports = { apillonStorageAPI };