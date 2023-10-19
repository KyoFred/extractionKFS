const path = require('path');
const fs = require('fs');
const axios = require('axios');

function leggiJSONDaFile(filePath) {
    try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileData);
    } catch (error) {
        console.error('Si è verificato un errore durante la lettura del file JSON:', error);
        return null;
    }
}

function gestisciElementoJSON(jsonData) {
    if (jsonData.status === "error" || jsonData.data === null) {
        console.error('Errore o "data" null per DeviceId:', jsonData.DeviceId, "--", jsonData.status, "--", jsonData.data);
        return;
    } else {       


        // crea una chiamata al api : http://localhost:3000/api/inDevice con una chiama post passandolo come body il jsonData 
        controllaCoverageData(jsonData);
      //  console.log('new json: ',jsonData);

 axios.post('http://localhost:3000/api/inDevice', jsonData)
  .then(response => {
    console.log('Risposta:', response.data);
  })
  .catch(error => {
    console.error("---insert DeviceId: ",jsonData.DeviceId);
    console.error('Errore:', error.message);
  }); 

    }
}



async function elaboraFileJSON() {
    const filePath = path.join(__dirname, '../data/listDeviceUpdate.json');
    const jsonData = leggiJSONDaFile(filePath);

    if (!jsonData) {
        console.error('Non è stato possibile leggere i dati JSON dal file.', jsonData);
        return;
    }

    const promises = jsonData.map(elementoJSON => gestisciElementoJSON(elementoJSON));

    await Promise.all(promises);
}

function controllaCoverageData(jsonData) {
    const coverageDataSchema = {
      "blackTotalAverage": "",
      "blackTotalUsagePage": "",
      "cyanTotalAverage": "",
      "cyanTotalUsagePage": "",
      "magentaTotalAverage": "",
      "magentaTotalUsagePage": "",
      "yellowTotalAverage": "",
      "yellowTotalUsagePage": "",
      "blackTotalCopyAverage": "",
      "blackTotalCopyUsagePage": "",
      "cyanCopyAverage": "",
      "cyanCopyUsagePage": "",
      "magentaCopyAverage": "",
      "magentaCopyUsagePage": "",
      "yellowCopyAverage": "",
      "yellowCopyUsagePage": "",
      "blackTotalFAXAverage": "",
      "blackTotalFAXUsagePage": "",
      "blackTotalPrinterAverage": "",
      "blackTotalPrinterUsagePage": "",
      "cyanPrinterAverage": "",
      "cyanPrinterUsagePage": "",
      "magentaPrinterAverage": "",
      "magentaPrinterUsagePage": "",
      "yellowPrinterAverage": "",
      "yellowPrinterUsagePage": ""
    };
  
    const coverageData = jsonData.data.coverageData;
  
    for (const key in coverageDataSchema) {
      if (!(key in coverageData)) {
        coverageData[key] = "0";
      } else {
        coverageData[key] = coverageData[key].toString().replace(".", ",");
      }
    }
  }
elaboraFileJSON();