import { replaceDotWithComma } from './replaceDotWithComma.js';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
const jsonFilePath = new URL('./coverages/coverages.json', import.meta.url);

const MAX_RETRY = 3;
const TIMEOUT = 50000;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let retryCount = 0;
  let success = false;

  while (!success && retryCount < MAX_RETRY) {
    try {
      const data = await fs.readFile('./data/settings.json', 'utf8');
      const settings = JSON.parse(data);
      const userId = settings.userId;
      const password = settings.password;
      const pageLogin = settings.pageLogin;
      const pageKfs = settings.pageKfs;

      await page.goto(pageLogin);
      await page.type('#user-id', userId);
      await page.type('#password', password);
      await page.click('#login-btn');
      await page.waitForNavigation({ timeout: TIMEOUT });
      console.log('Login eseguito:', pageLogin);

      await page.goto(pageKfs);
      console.log('Pagina Kfs raggiunta:', pageKfs);

      const jsonText = await page.$eval('#coverages', element => element.textContent);
      const jsonData = JSON.parse(jsonText);
     
      await fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
      console.log('JSON salvato con successo nel file:', jsonFilePath);

      browser.close();
      success = true;
    } catch (error) {
      console.error('Errore:', error);
      retryCount++;
      console.log(`Tentativo ${retryCount} di ${MAX_RETRY}`);
    }
  }

  if (!success) {
    console.error('Problema di connessione, numero massimo di tentativi raggiunto.');
  } else {
    // Replace the . with , 
    replaceDotWithComma();
  }
})();