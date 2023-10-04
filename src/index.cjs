const { replaceDotWithComma } = require('./replaceDotWithComma.cjs');
const { connectToSqlServer} = require('./connectToHda.cjs');
const { processDevices } = require('./processDevices.cjs');

const fs = require('fs').promises;
const path = require('path');

const settingsFilePath = path.resolve(__dirname, '../data/settings.json');
const jsonFilePath = path.resolve(__dirname, '../coverages/');
const listDeviceFilePath = path.resolve(__dirname, '../data/listDevice.json');
const listDeviceFilePathUpdate = path.resolve(__dirname, '../data/listDeviceUpdate.json');



async function connect() {
  try {
   const data = await fs.readFile(settingsFilePath, 'utf8');
        const settings = JSON.parse(data);
    const { userId, password, pageLogin, pageKfs } = settings;

   // connectToSqlServer(settingsFilePath,listDeviceFilePath);
   const deviceData = await fs.readFile(listDeviceFilePath, 'utf8');
   // processDevices(userId,password,pageLogin,pageKfs,deviceData,jsonFilePath,listDeviceFilePathUpdate,fs);
  replaceDotWithComma(listDeviceFilePathUpdate, fs);
    // lista device 
     } catch (error) {
    console.error('Errore:', error);
          console.error('Problema di connessione, numero massimo di tentativi raggiunto.');
    }
  }

connect();