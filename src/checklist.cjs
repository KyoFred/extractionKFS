const fs = require('fs').promises;
const path = require('path');
async function checkAndCreateFile() {
    try {
      const filePath = path.resolve(__dirname, '../data/listDeviceUpdate.json'); // Inserisci il percorso del tuo file JSON
      const data = await fs.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(data);
      
      const filteredDataOne = jsonData.filter(obj => !obj.hasOwnProperty('status') && !obj.hasOwnProperty('data') && obj.hasOwnProperty('DeviceId'));
      const filteredDataOK = jsonData.filter(obj => obj.status === 'ok' &&  obj.hasOwnProperty('data'));
      const filteredDataNull = jsonData.filter(obj => obj.data === null || obj.status === 'null' );
      console.log('jsonData','-->',jsonData.length);
      const filteredDataError = jsonData.filter(obj => obj.status === 'error');
      console.log('filteredDataError','-->',filteredDataError.length);
      console.log('filteredDataOK','-->',filteredDataOK.length);
      console.log('filteredDataNull','-->',filteredDataNull.length);
      console.log('filteredDataOne','-->',filteredDataOne.length);
  
    /*   if (filteredData.length > 0) {
        
        const checkFilePath = path.resolve(__dirname, '../data/listaCheck.json');
        await fs.writeFile(checkFilePath, JSON.stringify(filteredData, null, 2), 'utf8');
        console.log('File "listaCheck.json" creato con successo!');
      } else {
        console.log('Nessun oggetto con lo stato "ready" senza l\'elemento "data" trovato. Il file "listaCheck.json" rimarrà vuoto.');
      } */
      if (filteredDataError.length > 0) {
        const errorFilePath = path.resolve(__dirname, '../data/listError.json');
        await fs.writeFile(errorFilePath, JSON.stringify(filteredDataError, null, 2), 'utf8');
        console.log('File "listError.json" creato con successo!');
      } else {
        console.log('Nessun oggetto con status "error" trovato. Il file "listError.json" rimarrà vuoto.');
      }
      if (filteredDataOne.length > 0) {
        
        const checkFilePath = path.resolve(__dirname, '../data/listaCheck.json');
        await fs.writeFile(checkFilePath, JSON.stringify(filteredDataOne, null, 2), 'utf8');
        console.log('File "listaCheck.json" creato con successo!');
      } else {
        console.log('Nessun oggetto con lo stato "ready" senza l\'elemento "data" trovato. Il file "listaCheck.json" rimarrà vuoto.');
      }
      if (filteredDataOK.length > 0) {
        
        const checkFilePath = path.resolve(__dirname, '../data/listaData.json');
        await fs.writeFile(checkFilePath, JSON.stringify(filteredDataOK, null, 2), 'utf8');
        console.log('File "listaCheck.json" creato con successo!');
      } else {
        console.log('Nessun oggetto con lo stato "ready" senza l\'elemento "data" trovato. Il file "listaCheck.json" rimarrà vuoto.');
      }
      if (filteredDataNull.length > 0) {
        
        const checkFilePath = path.resolve(__dirname, '../data/listaDataNull.json');
        await fs.writeFile(checkFilePath, JSON.stringify(filteredDataNull, null, 2), 'utf8');
        console.log('File "listaCheck.json" creato con successo!');
      } else {
        console.log('Nessun oggetto con lo stato "ready" senza l\'elemento "data" trovato. Il file "listaCheck.json" rimarrà vuoto.');
      }
    } catch (error) {
      console.error('Errore durante la creazione del file "listaCheck.json":', error);
    }
  }
  
  checkAndCreateFile();