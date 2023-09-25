const { connect, close, query } = require('mssql');
const fs = require('fs');
let pool;

async function getSqlConnection(settings) {
  if (!pool) {
    const config = {
      server: settings.serverDB,
      user: settings.userDB,
      password: settings.passwordDB,
      database: '',
      options: {
        encrypt: false
      }
    };
    pool = await connect(config);
    console.log('Connesso al database SQL Server');
  }
  return pool;
}

async function connectToSqlServer() {
  try {
    const settingsData = fs.readFileSync('../data/settings.json');
    const settings = JSON.parse(settingsData);
    const connection = await getSqlConnection(settings);
   // console.log('connection: ',connection);
    const result = await query(settings.queryDbListDeviceTop);
    const jsonData = JSON.stringify(result.recordset);
    try {
      fs.writeFileSync('../data/listDevices.json', jsonData);
      console.log(`Dati della query salvati nel file listDevices.json. Numero di record salvati: ${result.recordset.length}`);
    } catch (error) {
      console.error('Errore durante il salvataggio del file:', error);
    }
    await pool.close();
    console.log('Connessione chiusa');
  } catch (error) {
    console.error('Errore durante la connessione al database:', error);
  }
}

connectToSqlServer();