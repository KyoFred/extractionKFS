
const puppeteer = require('puppeteer');
const MAX_RETRY = 3;
const TIMEOUT = 5000;
async function processDevices(userId, password, pageLogin, pageKfs,deviceData,jsonFilePath,listDeviceFilePathUpdate,fs) {
    try {
    
      let devices = JSON.parse(deviceData);
  
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
  
      await page.goto(pageLogin, { timeout: TIMEOUT });
      await page.type('#user-id', userId);
      await page.type('#password', password);
      await Promise.all([
        page.waitForNavigation({ timeout: TIMEOUT }),
        page.click('#login-btn')
      ]);
      console.log('Login eseguito:', pageLogin);
  
      for (const device of devices) {
        const { DeviceId } = device;
        const pageKfsn = pageKfs + DeviceId + '/Counter';
        const jsonFilePathn = jsonFilePath + '/' + DeviceId + '.json';
        const jsonFilePathError = jsonFilePath + '/error/' + DeviceId + '.json';
  
        await page.goto(pageKfsn, { timeout: TIMEOUT });
        console.log('Pagina Kfs raggiunta:', pageKfsn);
  
        const coveragesElement = await page.$('#coverages');
        if (coveragesElement) {
          const jsonText = await page.$eval('#coverages', element => element.textContent);
          const jsonData = JSON.parse(jsonText);
          await fs.writeFile(jsonFilePathn, JSON.stringify(jsonData, null, 2), 'utf8');
  
          device.status = 'ok'; // Aggiorna lo stato del dispositivo a "ok"
          device.data = jsonData;
        } else {
          console.log('Elemento #coverages non trovato. Salvataggio del testo dai tag h1 e h2.');
          const h1Text = await page.$eval('h1', element => element.textContent);
          const h2Text = await page.$eval('h2', element => element.textContent);
          const jsonText = JSON.stringify({ h1: h1Text, h2: h2Text }, null, 2);
          await fs.writeFile(jsonFilePathError, jsonText, 'utf8');
  
          device.status = 'error'; // Aggiorna lo stato del dispositivo a "error"
          device.errorMessage = h2Text;
        }
        console.log('JSON salvato con successo nel file:', jsonFilePathn);
      }
  
      // Aggiorna il file listDevice.json con i nuovi stati dei dispositivi
      await fs.writeFile(listDeviceFilePathUpdate, JSON.stringify(devices, null, 2), 'utf8');
  
      await browser.close();
    } catch (error) {
      console.error('Errore:', error);
    }
  }
  module.exports = {
    processDevices
  };