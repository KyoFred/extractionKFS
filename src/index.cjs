const { listDevices } = require('./listDevices.cjs');
const { processDevices } = require('./processDevices.cjs');
const { insertToDB } = require('./InsertToDB.cjs');
const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');
// ... resto del codice
const settingsFilePath = path.resolve(__dirname, '../data/settings.json');
const jsonFilePath = path.resolve(__dirname, '../coverages/');
const listDeviceFilePath = path.resolve(__dirname, '../data/listDevices.json');
const listDeviceFilePathUpdate = path.resolve(__dirname, '../data/listDeviceUpdate.json');

async function startProcessKfs() {
  try {
    const settingsData = await fs.readFile(settingsFilePath, 'utf8');
    const settings = JSON.parse(settingsData);
    const { userId, password, pageLogin, pageKfs } = settings;


    try {
      console.log('---ListDevices Start ---');
      await listDevices(listDeviceFilePath);
      console.log('--- ListDevices Done ---');
    } catch (error) {
      console.error('Errore durante l\'esecuzione di listDevices:', error);
    }

    try {
      console.log('--- Process Devices start---');
      await processDevices(userId, password, pageLogin, pageKfs, jsonFilePath, listDeviceFilePathUpdate);
      console.log('--- Process Devices Done ---');
    } catch (error) {
      console.error('Errore durante l\'esecuzione di processDevices:', error);
    }

    // Rimuovere il commento se si desidera eseguire questa funzione
    // 
    try {
      console.log('--- InsertToDB start---');
      const q=true;
      await insertToDB(q);
      console.log('--- InsertToDB Done ---');
    } catch (error) {
      console.error('Errore durante l\'esecuzione di InsertToDB:', error);
    }
  } catch (error) {
    console.error('Errore index --->:', error);
  }
}
// startProcessKfs();
 cron.schedule('14 18 * * *', () => {
  startProcessKfs();
});
 