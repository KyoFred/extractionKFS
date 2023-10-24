const { listDevices } = require('./listDevices.cjs');
const { processDevices } = require('./processDevices.cjs');
const { InsertToDB } = require('./InsertToDB.cjs')
const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');
const settingsFilePath = path.resolve(__dirname, '../data/settings.json');
const jsonFilePath = path.resolve(__dirname, '../coverages/');
const listDeviceFilePath = path.resolve(__dirname, '../data/listDevices.json');
const listDeviceFilePathUpdate = path.resolve(__dirname, '../data/listDeviceUpdate.json');

async function startProcessKfs() {
  try {
    // Carica le impostazioni di configurazione una volta sola
    const settingsData = await fs.readFile(settingsFilePath, 'utf8');
    const settings = JSON.parse(settingsData);
    const { userId, password, pageLogin, pageKfs } = settings;

    // Controlla se il file listDevices.json esiste in modo sincrono, una volta sola
    const listDeviceFileExists = fs.existsSync(listDeviceFilePath);
    if (!listDeviceFileExists) {
      console.error('Il file listDevices.json non esiste');
      return;
    }
    
    // Esegue l'operazione di elenco dei dispositivi in modo asincrono 
    await listDevices(listDeviceFilePath);

   // Esegue il processo dei dispositivi usando le credenziali dell'utente fornite per l'accesso in modo asincrono
  await processDevices(userId, password, pageLogin, pageKfs, jsonFilePath, listDeviceFilePathUpdate);

  // Inserisce la lista dispositivi scaricata da kfs in modo asincrono
    await InsertToDB();
 } catch (error) {
    console.error('Errore nella lettura del file:', error);
  }
}

// startProcessKfs();
// Schedula l'esecuzione del processo KFS ogni settimana alle 00:01
cron.schedule('1 0 * * 0', () => {
  startProcessKfs();
});