// JavaScript

const fs = require('fs').promises;
const path = require('path');
const logFilePath = path.resolve(__dirname, '../data/log.txt');

async function writeToLog(data, v) {
  try {
    v = v === undefined ? 'null' : 'ok';
    const logMessage = `[${new Date().toISOString()}] ${data} ${JSON.stringify(v)}   \n`;
    await fs.appendFile(logFilePath, logMessage, 'utf8');
  } catch (error) {
    console.error('Errore durante la scrittura del file di log:', error);
  }
}

module.exports = { writeToLog };