const fs = require('fs/promises');
const path = require('path');
const { insertToDB } = require('./InsertToDB.cjs');
const { listDevices, listDevicesGroup } = require('./listDevices.cjs');
const { processDevices } = require('./processDevices.cjs');
const { writeToLog } = require('./writeToLog.cjs');
const settingsFilePath = path.resolve(__dirname, '../data/settings.json');
const jsonFilePath = path.resolve(__dirname, '../coverages/'); 
const listDevicePath = path.resolve(__dirname, '../data/listDevices.json');
const listDeviceFilePathUpdate = path.resolve(__dirname, '../data/listDeviceUpdate.json'); 

async function stepsExtraction(group) {
  try {
    const settingsData = await fs.readFile(settingsFilePath, 'utf8');
    const settings = JSON.parse(settingsData);
    const { userId, password, pageLogin, pageKfs } = settings;

    if (group) {
      console.log('---listDevicesGroup Start ---');
    const result= await listDevicesGroup(listDevicePath, group);
      console.log('--- listDevicesGroup fine ---',result);
    //  return result;
    } else {
      console.log('---listDevices Start ---');
      const result=  await listDevices(listDevicePath);
      console.log('--- listDevices fine ---',result);
     // return result;
    }

    console.log('--- Process Devices start---');
   await processDevices(userId, password, pageLogin, pageKfs, jsonFilePath, listDeviceFilePathUpdate, listDevicePath);
    console.log('--- Process Devices fine ---');

    console.log('--- InsertToDB start---',jsonFilePath);
    await insertToDB(true);
    console.log('--- InsertToDB fine ---');
  } catch (error) {
    console.error('Errore index --->:', error);
    writeToLog('Errore index --->:', { error });
  }
}

module.exports = { stepsExtraction };
