const { replaceDotWithComma } = require('./replaceDotWithComma.cjs');
const { connectToSqlServer} = require('./connectToHda.cjs');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const jsonFilePath = path.resolve(__dirname, '../coverages/coverages.json');
const settingsFilePath = path.resolve(__dirname, '../data/settings.json');
const listDeviceFilePath = path.resolve(__dirname, '../data/listDevice.json');
const MAX_RETRY = 3;
const TIMEOUT = 5000;
const DeviceID = 'PD_KYRFH0738620';

async function connect() {
  try {
   const data = await fs.promises.readFile(settingsFilePath, 'utf8');
        const settings = JSON.parse(data);
    const userId = settings.userId;
    const password = settings.password;
    const pageLogin = settings.pageLogin;
    const pageKfs = settings.pageKfs + DeviceID + '/Counter';
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
await page.goto(pageKfs, { timeout: TIMEOUT });
    console.log('Pagina Kfs raggiunta:', pageKfs);
    const jsonText = await page.$eval('#coverages', element => element.textContent);
    const jsonData = JSON.parse(jsonText);
    await fs.promises.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log('JSON salvato con successo nel file:', jsonFilePath);
    await browser.close();
    replaceDotWithComma(jsonFilePath, fs);
    connectToSqlServer(settingsFilePath,listDeviceFilePath);
  } catch (error) {
    console.error('Errore:', error);
          console.error('Problema di connessione, numero massimo di tentativi raggiunto.');
    }
  }

connect();