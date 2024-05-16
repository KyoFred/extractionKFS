const fs = require('fs');
const axios = require('axios');

async function listDevices(listDeviceFilePath) {
  try {
    const response = await axios.get('http://localhost:4001/api/listDevice');
   // console.log('Risposta:', response.data);
    const jsonData = JSON.stringify(response.data); // Converti l'array in una stringa JSON
    fs.writeFileSync(listDeviceFilePath, jsonData);
    console.log(`Dati della query salvati nel file listDevices.json. Numero di record salvati: ${response.data.length}`);
    return response.data.length;
  } catch (error) {
    console.error(' listDevices Errore durante la richiesta:', error.message);
  }
}
async function listDevicesGroup(listDeviceFilePath,group) {
  try {
    const response = await axios.get(`http://localhost:4001/api/listDeviceGroup/${group}`);
    //console.log('Risposta:', response.data);
    const jsonData = JSON.stringify(response.data); // Converti l'array in una stringa JSON
    fs.writeFileSync(listDeviceFilePath, jsonData);
    console.log(`Dati della query salvati nel file listDevices.json. Numero di record salvati: ${response.data.length}`);
    return response.data.length;
  } catch (error) {
    console.error('Errore durante la richiesta:', error.message);
  }
}

module.exports = {
  listDevices,listDevicesGroup
};

