const { setCookie } = require('./cookie.cjs');
const MAX_RETRY = 3;
const TIMEOUT = 30000;
const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs').promises;
const jsonFilePathError = '../coverages/error/DeviceError.json';

async function processDevices(userId, password, pageLogin, pageKfs, jsonFilePath, listDeviceFilePathUpdate, listDevicePath) {
  try {
    const devices = await leggiJSON(listDevicePath);
    const devicesUp = await leggiJSON(listDeviceFilePathUpdate);
    const driver = await new Builder().forBrowser('chrome').build();
    try {
      await driver.get(pageLogin);
       await setCookie(driver); // Imposta i cookie nel browser
      await driver.navigate().refresh(); // Aggiorna la pagina per applicare i cookie 
      await driver.findElement(By.id('user-id')).sendKeys(userId);
      await driver.findElement(By.id('password')).sendKeys(password);
      await driver.findElement(By.id('login-btn')).click();
      await driver.wait(until.urlIs(pageLogin), TIMEOUT);
      const loginElement = await driver.wait(until.elementLocated(By.id('hd-login-user-name')), TIMEOUT);
      if (!loginElement) {
       // console.log('Accesso non riuscito.');
        return false;
      } else {
       // console.log('Accesso riuscito.');
        const jsonDataArray = [];
        const jsonDataError = [];
      
        let devicesOk = 0;
        let devicesError = 0;
        for (const device of devices) {
          const totalDevices= devices.length;
          const DeviceId = device['DeviceId'];
          const deviceInDevicesUp = devicesUp.find(device => device.DeviceId === DeviceId);
          if(!deviceInDevicesUp){
            console.log("Non ce... ",DeviceId);
         
          
          const pageKfsn = pageKfs + DeviceId + '/Counter';
          
          let retryCount = 0;
          while (retryCount < MAX_RETRY) {
            try {
              await driver.get(pageKfsn);
              await driver.wait(until.urlIs(pageKfsn), TIMEOUT);
              await driver.wait(until.elementLocated(By.tagName('h1')), TIMEOUT);
              try {
                const coveragesElement = await driver.findElement(By.id('coverages'));
                const coveragesText = await coveragesElement.getAttribute('textContent');
                const jsonData = JSON.parse(coveragesText);
                if (jsonData === null) {
                  device['status'] = 'null';
                  device['data'] = {};
                  devicesError ++;
               console.log('jsonData null ','--',devicesError,'Di: ', totalDevices);
               jsonDataError.push(device);
                } else {
                  devicesOk ++;
               console.log('jsonData ok ','--',devicesOk,'Di: ', totalDevices);
                  device['status'] = 'ok';
                  device['data'] = jsonData;
                  jsonDataArray.push(device);
                }
               
                break; // Esci dal ciclo while in caso di successo
              } catch (error) {
                if (error.name === 'NoSuchElementError') {
                //  console.log('Elemento #coverages non trovato. Salvataggio del testo dai tag h1 e h2.');
                  const h1Text = await driver.findElement(By.tagName('h1')).getText();
                  const h2Text = await driver.findElement(By.tagName('h2')).getText();
                  const errorData = { h1: h1Text, h2: h2Text, DeviceId: DeviceId };
                  console.log('errorData: ---> ', errorData, 'totale errori', devicesError);
                  jsonDataError.push(errorData);
                  device['status'] = 'error';
                  device['errorMessage'] = h2Text;
                  break; // Esci dal ciclo while in caso di errore
                } else {
                 // console.log('jsonDataArray: -->', jsonDataArray);
                }
              }
            } catch (error) {
              console.error('Errore controlla:', error);
              retryCount++;
            }
          }
        }
        }
        console.log('JSON salvato con successo nel file - listDeviceFilePathUpdate:', listDeviceFilePathUpdate,'total',devicesOk );
        await fs.writeFile(listDeviceFilePathUpdate, JSON.stringify(jsonDataArray, null, 2), 'utf8');
        console.log('JSON Errore salvato con successo nel file - jsonFilePathError:', jsonFilePathError,'total',devicesError);
        await fs.writeFile(jsonFilePathError, JSON.stringify(jsonDataError, null, 2), 'utf8');
      }
    } catch (error) {
      console.error('Errore durante il processo di login:', error);
    } finally {
      console.log('chiude la sessione');
      await driver.quit();
    }
  } catch (error) {
    console.error('Errore:', error);
  }
}

async function leggiJSON(nomeFile) {
  try {
    const contenutoFile = await fs.readFile(nomeFile, 'utf8');
    const datiJSON = JSON.parse(contenutoFile);
  //  console.log("devices:", datiJSON[0]['DeviceId']);
    return datiJSON;
  } catch (error) {
    console.error('Errore durante la lettura del file JSON:', error);
    throw error;
  }
}


module.exports = {
  processDevices
};