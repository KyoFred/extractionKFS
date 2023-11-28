const path = require('path');
const fs = require('fs');
const http = require('http');
const { Sema } = require('async-sema');

async function leggiJSONDaFile(filePath) {
  try {
    const fileData = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Si è verificato un errore durante la lettura del file JSON:', error);
    return null;
  }
}
async function gestisciElementoJSON(jsonData) {
  const coverage = jsonData?.data?.coverageData;
  
  if (jsonData.status === "error" || jsonData.status === "null" || jsonData.length <= 0 || !jsonData.data ) {
    console.error('Errore o "data" null per DeviceId:', jsonData.DeviceId, "--", jsonData.status, "--", jsonData.data);
    return;
  } else if(Object.keys(coverage).length !== 0) {
    
    const checkDevice = await checkDeviceId(jsonData.DeviceId);
    
    const checkData =await controllaCoverageData(jsonData);
    console.log(checkData);
    const optionsPost = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/inDevice',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const optionsPut = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/deviceUpdate/${jsonData.DeviceId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let options;
    if (checkDevice) {
      options = optionsPut;
    } else {
      options = optionsPost;
    }
    const agent = new http.Agent({ keepAlive: true });
    const req = http.request({ ...options, agent }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Risposta:', data,'-->',options.method);
      });
    });
    req.on('error', (error) => {
      console.error("---insert DeviceId: ", jsonData.DeviceId,options.method);
      console.error('Errore:', error.message);
    });
    req.write(JSON.stringify(checkData));
    req.end();
  }
}

async function insertToDB(q) {
  const filePath = path.join(__dirname, '../data/listDeviceUpdate.json');
  console.log('filePath', filePath)
  const jsonData = await leggiJSONDaFile(filePath);
  if (!jsonData) {
    console.error('Non è stato possibile leggere i dati JSON dal file.', jsonData);
    return;
  }
  if (q) {
    const limit = new Sema(Math.min(jsonData.length, 10));
    let requestCount = 0;
    for (const elementoJSON of jsonData) {
      await limit.acquire();
      gestisciElementoJSON(elementoJSON);
      limit.release();

      requestCount++;
      if (requestCount % 1000 === 0) {
        await sleep(10000); // Timeout of 5 seconds
      }
    }
  }
}

async function controllaCoverageData(jsonData) {
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

  for (const key of Object.keys(coverageDataSchema)) {
    if (!(key in coverageData)) {
      coverageData[key] = "0";
    } else {
      coverageData[key] = coverageData[key].toString().replace(".", ",");
    }
  }

  return jsonData;
}
async function checkDeviceId(id) {

  try {
    const response = await fetch(`http://localhost:3001/api/device/${id}`);
    const data = await response.json();

    return (data.length >0);
    console.log('checkDevice id:', id,'-->',data.length);
  } catch (error) {
    console.error('Si è verificato un errore:',id,'--' , error);
    return false;
  }
}


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
module.exports = {
  insertToDB
};