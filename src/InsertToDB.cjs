const path = require('path');
const fs = require('fs');
const http = require('http');
const fetch = require('node-fetch');
const { Sema } = require('async-sema');
let totalRequestsPut = 0;
let totalRequestsPost = 0;

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
  if (
    jsonData.status === 'error' ||
    jsonData.status === 'null' ||
    jsonData.length <= 0 ||
    !jsonData.data
  ) {
    console.error(
      'Errore o "data" null per DeviceId:',
      jsonData.DeviceId,
      '--',
      jsonData.status,
      '--',
      jsonData.data
    );
    return;
  } else if (Object.keys(coverage).length !== 0) {
    const checkDevice = await checkDeviceId(jsonData.DeviceId);
    const checkData = await controllaCoverageData(jsonData);
    const optionsPost = {
      hostname: 'localhost',
      port: 4001,
      path: '/api/inDevice',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const optionsPut = {
      hostname: 'localhost',
      port: 4001,
      path: `/api/deviceUpdate/${jsonData.DeviceId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    let options;
    if (checkDevice) {
      console.log('Risposta: put checkDevice', checkDevice);
      options = optionsPut;
     
    } else {
      console.log('Risposta: post checkDevice', checkDevice);
      options = optionsPost;
      totalRequestsPost++;
    }
    if(checkDevice !=jsonData.data.lastUpdate){
      console.log('da aggiornare', checkDevice,' lastUpdate:', jsonData.data.lastUpdate);
      totalRequestsPut++;
    const agent = new http.Agent({ keepAlive: true });
    const req = http.request({ ...options, agent }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Risposta:', data, '-->', options.method);
      });
    });
    req.on('error', (error) => {
      console.error('--Errore-insert DeviceId: ', jsonData.DeviceId, options.method);
      console.error('Errore:', error.message);
    });
    req.write(JSON.stringify(checkData));
    req.end();


    return new Promise((resolve, reject) => {
      req.on('response', (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          resolve(responseData);
        });
      });
      req.on('error', (error) => {
        reject(error);
      });
    });
  }else{
    console.log('non è aggiornato', checkDevice,' lastUpdate:', jsonData.data.lastUpdate);
    return 'non è aggiornato';
  }
  }
}

async function insertToDB(q) {
  const filePath = path.join(__dirname, '../data/listDeviceUpdate.json');
  console.log('filePath', filePath);
  const jsonData = await leggiJSONDaFile(filePath);
  if (!jsonData) {
    console.error('Non è stato possibile leggere i dati JSON dal file.', jsonData);
    return;
  }
  
  let totalRequests = 0;
  let completedRequests = 0;

  if (q) {
    const limit = new Sema(Math.min(jsonData.length, 10));
    let requestCount = 0;
    for (const elementoJSON of jsonData) {
      await limit.acquire();
     const responseData = await gestisciElementoJSON(elementoJSON);
      limit.release();
      requestCount++;
      completedRequests++;
      if (requestCount % 100 === 0) {
        await sleep(20000); // Timeout of 5 seconds
      }
      totalRequests++;
      responseData && console.log('responseData:',responseData,' totalRequests: '+totalRequests );
    }
  }

  console.log(`Totale richieste eseguite: ${completedRequests}, uptodate: ${totalRequestsPut}, insert: ${totalRequestsPost}, Totale richieste da eseguire: ${totalRequests}`);
  writeToLog(`Totale richieste eseguite: ${completedRequests}, uptodate: ${totalRequestsPut}, insert: ${totalRequestsPost}, Totale richieste da eseguire: `,totalRequests);
}

async function controllaCoverageData(jsonData) {
  const coverageDataSchema = {
    blackTotalAverage: '',
    blackTotalUsagePage: '',
    cyanTotalAverage: '',
    cyanTotalUsagePage: '',
    magentaTotalAverage: '',
    magentaTotalUsagePage: '',
    yellowTotalAverage: '',
    yellowTotalUsagePage: '',
    blackTotalCopyAverage: '',
    blackTotalCopyUsagePage: '',
    cyanCopyAverage: '',
    cyanCopyUsagePage: '',
    magentaCopyAverage: '',
    magentaCopyUsagePage: '',
    yellowCopyAverage: '',
    yellowCopyUsagePage: '',
    blackTotalFAXAverage: '',
    blackTotalFAXUsagePage: '',
    blackTotalPrinterAverage: '',
    blackTotalPrinterUsagePage: '',
    cyanPrinterAverage: '',
    cyanPrinterUsagePage: '',
    magentaPrinterAverage: '',
    magentaPrinterUsagePage: '',
    yellowPrinterAverage: '',
    yellowPrinterUsagePage: '',
  };
  const coverageData = jsonData.data.coverageData;
  for (const key of Object.keys(coverageDataSchema)) {
    if (!(key in coverageData)) {
      coverageData[key] = '0';
    } else {
      coverageData[key] = coverageData[key].toString().replace('.', ',');
    }
  }
  return jsonData;
}

async function checkDeviceId(id) {
  try {
    const response = await fetch(`http://localhost:4001/api/device/${id}`);
    const data = await response.json();
    console.log('checkDevice id:', id, '-->', data.lastUpdate);
    return data.lastUpdate;
  } catch (error) {
    console.error('Si è verificato un errore:', id, '--', error);
    writeToLog('Si è verificato un errore: ', { error });
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  insertToDB,
};