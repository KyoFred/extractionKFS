const MAX_RETRY = 3;
const TIMEOUT = 30000;
const listDeviceFilePath = '../data/listDevices.json';
const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs').promises;

async function processDevices(userId, password, pageLogin, pageKfs, jsonFilePath, listDeviceFilePathUpdate) {
  try {
    const devices = await leggiJSON(listDeviceFilePath);
    const driver = await new Builder().forBrowser('chrome').build();
    try {
      await driver.get(pageLogin);
      await driver.findElement(By.id('user-id')).sendKeys(userId);
      await driver.findElement(By.id('password')).sendKeys(password);
      await driver.findElement(By.id('login-btn')).click();
      console.log('Login eseguito:', pageLogin);
      await driver.wait(until.urlIs(pageLogin), TIMEOUT);
      const loginElement = await driver.wait(until.elementLocated(By.id('hd-login-user-name')), TIMEOUT);
      if (!loginElement) {
        console.log('Accesso non riuscito.');
        return false;
      } else {
        console.log('Accesso riuscito.');
        const jsonDataArray = [];
        for (const device of devices) {
          const DeviceId = device['DeviceId'];
          console.log('DeviceId -->', DeviceId);
          const pageKfsn = pageKfs + DeviceId + '/Counter';
          console.log('pageKfsn eseguito:', pageKfsn, " DeviceId", DeviceId);
          const jsonFilePathn = jsonFilePath + '/' + DeviceId + '.json';
          const jsonFilePathError = jsonFilePath + '/error/' + DeviceId + '.json';
          let retryCount = 0;
while (retryCount < MAX_RETRY) {
          try {
            await driver.get(pageKfsn);
            await driver.wait(until.urlIs(pageKfsn), TIMEOUT);
            console.log('Pagina Kfs raggiunta:', pageKfsn);
          await driver.wait(until.elementLocated(By.tagName('h1')), TIMEOUT);
           try {
  const coveragesElement = await driver.findElement(By.id('coverages'));
  console.log('jsonDataArray: ', coveragesElement);
  const coveragesText = await coveragesElement.getAttribute('textContent');
  const jsonData = JSON.parse(coveragesText);
  jsonDataArray.push(jsonData);
  device['status'] = 'ok';
  device['data'] = jsonData;
  console.log('jsonDataArray: ', jsonDataArray);
break; // Esci dal ciclo while in caso di successo
} catch (error) {
  if (error.name === 'NoSuchElementError') {
    console.log('Elemento #coverages non trovato. Salvataggio del testo dai tag h1 e h2.');
    const h1Text = await driver.findElement(By.tagName('h1')).getText();
    const h2Text = await driver.findElement(By.tagName('h2')).getText();
    const errorData = { h1: h1Text, h2: h2Text };
    console.log('errorData: ', errorData,'jsonFilePathError',jsonFilePathError);
    await fs.writeFile(jsonFilePathError, JSON.stringify(errorData, null, 2), 'utf8');
    device['status'] = 'error';
    device['errorMessage'] = h2Text;
break; // Esci dal ciclo while in caso di errore
  } else {
   
    await fs.writeFile(jsonFilePathn, JSON.stringify(jsonDataArray, null, 2), 'utf8');
    console.log('JSON salvato con successo nel file:', jsonFilePathn,);
  }
} 
          } catch (error) {
            console.error('Errore controlla:', error);
            retryCount++;
          }
}
        
          await fs.writeFile(listDeviceFilePathUpdate, JSON.stringify(devices, null, 2), 'utf8');
          console.log('JSON salvato con successo nel file:',listDeviceFilePathUpdate);
        }
      }
    } catch (error) {
      console.error('Errore durante il processo di login:', error);
    } finally {
      console.log('chiude la sesione');
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
    console.log("devices:", datiJSON[0]['DeviceId']);
    return datiJSON;
  } catch (error) {
    console.error('Errore durante la lettura del file JSON:', error);
    throw error;
  }
}

module.exports = {
  processDevices
};