// JavaScript

const fs = require('fs').promises;
const path = require('path');
const logFilePath = path.resolve(__dirname, '../data/log.txt'); 
function writeToLog(data, v) {
  
    (v === undefined) ? v= 'null' : v= 'ok';
    const logMessage = `[${new Date().toISOString()}] ${data} ${JSON.stringify(v)}   \n`;
    fs.appendFile(logFilePath, logMessage, 'utf8', (error) => {
if (error) {
      console.error('Errore durante la scrittura del file di log:', error);
}
    });
  } 

  module.exports = { writeToLog };