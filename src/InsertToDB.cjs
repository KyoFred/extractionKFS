const path = require('path');
const fs = require('fs');
const http = require('http');
const { Sema } = require('async-sema');

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
    controllaCoverageData(jsonData);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/inDevice',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Risposta:', data);
      });
    });
    req.on('error', (error) => {
      console.error("---insert DeviceId: ", jsonData.DeviceId);
      console.error('Errore:', error.message);
    });
    req.write(JSON.stringify(jsonData));
    req.end();
  }
}

async function insertToDB(q) {
  const filePath = path.join(__dirname, '../data/listDeviceUpdate.json');
  const jsonData = leggiJSONDaFile(filePath);
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
        await sleep(5000); // Timeout of 5 seconds
      }
    }
  }
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
  for (const key of Object.keys(coverageDataSchema)) {
    if (!(key in coverageData)) {
      coverageData[key] = "0";
    } else {
      coverageData[key] = coverageData[key].toString().replace(".", ",");
    }
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
module.exports = {
  insertToDB
};