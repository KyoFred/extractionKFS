import fs from 'fs/promises';
import { insertToDB } from './InsertToDB.cjs';
import { avviaServer } from './api/hdaCoverage.cjs';
import { writeToLog } from './writeToLog.cjs';

// ... resto del codice


const settingsFilePath = new URL('../data/settings.json', import.meta.url).pathname;
const jsonFilePath = new URL('../coverages/', import.meta.url).pathname; 
const listDevicePath = new URL('../data/listDevices.json', import.meta.url).pathname; 
const listDeviceFilePathUpdate = new URL('../data/listDeviceUpdate.json', import.meta.url).pathname;   
// Percorso del file di log






async function startProcessKfs() {
  try {
    const settingsData = await fs.readFile(settingsFilePath, 'utf8');
    const settings = JSON.parse(settingsData);
    const { userId, password, pageLogin, pageKfs } = settings;

    try {
      console.log('---ListDevices Start ---');
    // await listDevices(listDevicePath);
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

//startProcessKfs();
avviaServer();
 cron.schedule('16 18 * * 0', () => {  startProcessKfs();});
 