const { listDevices } = require('./listDevices.cjs');
const { processDevices } = require('./processDevices.cjs');
const { insertToDB } = require('./InsertToDB.cjs');
const { writeToLog } = require('./writeToLog.cjs');
const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');

// ... resto del codice

const settingsFilePath = path.resolve(__dirname, '../data/settings.json');
const jsonFilePath = path.resolve(__dirname, '../coverages/');
const listDevicePath = path.resolve(__dirname, '../data/listDevices.json');
const listDeviceFilePathUpdate = path.resolve(__dirname, '../data/listDeviceUpdate.json');
// Percorso del file di log




// Sovrascrivi la funzione console.log per scriverla anche sul file di log
/* console.log = function (data, v) {
  process.stdout.write(data + v + '\n', 'utf8');
  writeToLog(data, { v }, 'utf8');
};

console.error = function (data, error) {
  process.stdout.write(data + error + '\n', 'utf8');
  writeToLog(data, { error }, 'utf8');cls
}; */

async function startProcessKfs() {
  try {
    const settingsData = await fs.readFile(settingsFilePath, 'utf8');
    const settings = JSON.parse(settingsData);
    const { userId, password, pageLogin, pageKfs } = settings;

    try {
      console.log('---ListDevices Start ---');
   //  await listDevices(listDevicePath);
      console.log('--- ListDevices fine ---');
      
    } catch (error) {
      console.error('Errore durante l\'esecuzione di listDevices:', error);
      writeToLog('Errore durante l\'esecuzione di listDevices:', { error });
    }

    try {
      console.log('--- Process Devices start---');
    //  await processDevices(userId, password, pageLogin, pageKfs, jsonFilePath, listDeviceFilePathUpdate,listDevicePath);
      console.log('--- Process Devices fine ---');
    } catch (error) {
      console.error('Errore durante l\'esecuzione di processDevices:', error);
      writeToLog('Errore durante l\'esecuzione di processDevices:', { error });
    }

    try {
      console.log('--- InsertToDB start---');
      const q = true;
      await insertToDB(q);
      console.log('--- InsertToDB fine ---');
    } catch (error) {
      console.error('Errore durante l\'esecuzione di InsertToDB:', error);
      writeToLog('Errore durante l\'esecuzione di InsertToDB:', { error });
    }
  } catch (error) {
    console.error('Errore index --->:', error);
    writeToLog('Errore index --->:', { error });
  }
}

startProcessKfs();
 //cron.schedule('56 18 * * *', () => {  startProcessKfs();});
 