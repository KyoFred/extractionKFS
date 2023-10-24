const fs = require('fs');
const axios = require('axios');

async function listDevices(listDeviceFilePath) {
  try {
    const response = await axios.get('http://localhost:3000/api/listDevice', { timeout: 5000 });
   // console.log('Risposta:', response.data);
    const jsonData = JSON.stringify(response.data); // Converti l'array in una stringa JSON
    fs.writeFileSync(listDeviceFilePath, jsonData);
    console.log(`Dati della query salvati nel file listDevices.json. Numero di record salvati: ${response.data.length}`);
  } catch (error) {
    console.error('Errore durante la richiesta:', error.message);
  }
}

module.exports = {
  listDevices
};

