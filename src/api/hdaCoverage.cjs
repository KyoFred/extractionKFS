const express = require('express');
const sql = require('mssql');
const path = require('path');
const settingsFilePath = path.resolve(__dirname, '../../data/settings.json');
const fs = require('fs').promises;

const leggiDatiDaFile = async () => {
  try {
    const data = await fs.readFile(settingsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Si è verificato un errore durante la lettura del file JSON:', error);
    throw error;
  }
};

const avviaServer = async () => {
  try {
    const settings = await leggiDatiDaFile();
    const config = {
      server: settings.serverDB,
      user: settings.userDB,
      password: settings.passwordDB,
      database: '',
      options: {
        encrypt: false
      }
    };

    const pool = new sql.ConnectionPool(config);
    await pool.connect();

    const app = express();
    app.use(express.json());

    const queryBD = settings.queryDbListDevice;
    app.get('/api/listDevice', async (req, res) => {
      try {
        const result = await pool.request().query(queryBD);
        res.send(result.recordset);
      } catch (error) {
        console.error(error);
        res.status(500).send('Errore nel recupero dei dati.');
      }
    });

    app.put('/api/dati/:id', async (req, res) => {
      try {
        const query = 'UPDATE tabella SET campo = @campo WHERE id = @id';
        const result = await pool.request()
          .input('campo', sql.VarChar, req.body.campo)
          .input('id', sql.Int, req.params.id)
          .query(query);
        res.send('Dati aggiornati correttamente.');
      } catch (error) {
        console.error(error);
        res.status(500).send('Errore nell\'aggiornamento dei dati.');
      }
    });

    app.post('/api/inDevice', async (req, res) => {
      try {
        const jsonData = req.body;
        const query = `
          DECLARE @sParam nvarchar(50) = 'P22C'
          DECLARE @sValue nvarchar(10) = NULL
          DECLARE @sPrefix nvarchar(1) = 'X'
          EXEC [dbo].[spHDANET_GetNewID] @sParam, @sValue OUTPUT, @sPrefix
          INSERT INTO TABUserDef_DataForm_P22C (IDProtocollo, DeviceID, lastUpdate, startPeriod, endPeriod, blackTotalAverage, blackTotalUsagePage, cyanTotalAverage, cyanTotalUsagePage, magentaTotalAverage, magentaTotalUsagePage, yellowTotalAverage, yellowTotalUsagePage, blackTotalCopyAverage, blackTotalCopyUsagePage, cyanCopyAverage, cyanCopyUsagePage, magentaCopyAverage, magentaCopyUsagePage, yellowCopyAverage, yellowCopyUsagePage, blackTotalFAXAverage, blackTotalFAXUsagePage, blackTotalPrinterAverage, blackTotalPrinterUsagePage, cyanPrinterAverage, cyanPrinterUsagePage, magentaPrinterAverage, magentaPrinterUsagePage, yellowPrinterAverage, yellowPrinterUsagePage)
      VALUES (@sValue, '${jsonData.DeviceId}','${jsonData.data.lastUpdate}', '${jsonData.data.startPeriod}', '${jsonData.data.endPeriod}', '${jsonData.data.coverageData.blackTotalAverage}', '${jsonData.data.coverageData.blackTotalUsagePage}', '${jsonData.data.coverageData.cyanTotalAverage}', '${jsonData.data.coverageData.cyanTotalUsagePage}', '${jsonData.data.coverageData.magentaTotalAverage}', '${jsonData.data.coverageData.magentaTotalUsagePage}', '${jsonData.data.coverageData.yellowTotalAverage}', '${jsonData.data.coverageData.yellowTotalUsagePage}', '${jsonData.data.coverageData.blackTotalCopyAverage}', '${jsonData.data.coverageData.blackTotalCopyUsagePage}', '${jsonData.data.coverageData.cyanCopyAverage}', '${jsonData.data.coverageData.cyanCopyUsagePage}', '${jsonData.data.coverageData.magentaCopyAverage}', '${jsonData.data.coverageData.magentaCopyUsagePage}', '${jsonData.data.coverageData.yellowCopyAverage}', '${jsonData.data.coverageData.yellowCopyUsagePage}', '${jsonData.data.coverageData.blackTotalFAXAverage}', '${jsonData.data.coverageData.blackTotalFAXUsagePage}', '${jsonData.data.coverageData.blackTotalPrinterAverage}', '${jsonData.data.coverageData.blackTotalPrinterUsagePage}', '${jsonData.data.coverageData.cyanPrinterAverage}', '${jsonData.data.coverageData.cyanPrinterUsagePage}', '${jsonData.data.coverageData.magentaPrinterAverage}', '${jsonData.data.coverageData.magentaPrinterUsagePage}', '${jsonData.data.coverageData.yellowPrinterAverage}', '${jsonData.data.coverageData.yellowPrinterUsagePage}')`;

        pool.request()
          .query(query, (err, result2) => {
            if (err) {
              console.error(err);
              res.status(500).send('Errore nell\'esecuzione della query INSERT INTO.');
              return;
            }
            res.status(200).send({ message: 'Dati inseriti correttamente', result: result2 });
          });
      } catch (error) {
        console.error(error);
        res.status(500).send('Errore nell\'inserimento dei dati: ' + error.message);
      }
    });

    app.delete('/api/dati/:id', async (req, res) => {
      try {
        const query = 'DELETE FROM tabella WHERE id = @id';
        const result = await pool.request()
          .input('id', sql.Int, req.params.id)
          .query(query);
        res.send('Dati eliminati correttamente.');
      } catch (error) {
        console.error(error);
        res.status(500).send('Errore nell\'eliminazione dei dati.');
      }
    });

    const port = 3000;
    app.listen(port, () => {
      console.log(`API in ascolto sulla porta ${port}`);
    });
  } catch (error) {
    console.error('Si è verificato un errore durante l\'avvio del server:', error);
  } finally {
    await sql.close();
  }
};

avviaServer();