const { listDevices } = require('./listDevices.cjs');
const { processDevices } = require('./processDevices.cjs');
const fs = require('fs').promises;
const path = require('path');

const settingsFilePath = path.resolve(__dirname, '../data/settings.json');
const jsonFilePath = path.resolve(__dirname, '../coverages/');
const listDeviceFilePath = path.resolve(__dirname, '../data/listDevices.json');
const listDeviceFilePathUpdate = path.resolve(__dirname, '../data/listDeviceUpdate.json');

async function startProcessKfs() {
  try {
    const data = await fs.readFile(settingsFilePath, 'utf8');
    const settings = JSON.parse(data);
    const { userId, password, pageLogin, pageKfs } = settings;

    const listDeviceFileExists = await fs.access(listDeviceFilePath)
      .then(() => true)
      .catch(() => false);

    if (!listDeviceFileExists) {
      console.error('Il file listDevices.json non esiste');
      return;
    }
    // Questo codice esegue un'operazione asincrona per elencare i dispositivi 
   // await listDevices(listDeviceFilePath);

    const deviceData = await fs.readFile(listDeviceFilePath, 'utf8');
// Attende il processo dei dispositivi utilizzando le credenziali dell'utente fornite per l'accesso
   await processDevices(userId, password, pageLogin, pageKfs, deviceData, jsonFilePath, listDeviceFilePathUpdate);
  } catch (error) {
    console.error('Errore nella lettura del file:', error);
  }
}

startProcessKfs();