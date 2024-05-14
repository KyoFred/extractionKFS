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

    const queryBD = settings.queryDbListDeviceC;
    app.get('/api/device/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = 'SELECT * FROM TABUserDef_DataForm_P22C WHERE DeviceId = @id';
        const result = await pool.request()
          .input('id', sql.VarChar, req.params.id)
          .query(query);
        if (result.recordset.length > 0) {
          res.send(result.recordset[0]);
        } else {
          res.status(404).send('Device not found.');
        }
      } catch (error) {
        console.error(error);
        res.status(500).send('Errore nel recupero dei dati.');
      }
    });
    app.get('/api/listDevice', async (req, res) => {
      try {
        const query = `SELECT DeviceId FROM [HDA].[dbo].[KyoKFSDevice] a with (nolock) Inner join KyoKFSGroups b with (nolock) on a.GroupId = b.GroupId
        Inner join KyoKFSGroups d with (nolock) on b.OriginGroupId = d.GroupId where manufacturer in ('Kyocera', 'KYOCERA')`;
        const result = await pool.request()
          .input('id', sql.VarChar, req.params.id)
          .query(query);
        res.send(result.recordset);
      } catch (error) {
        console.error(error);
        res.status(500).send('Errore nel recupero dei dati.');
      }
    });
app.put('/api/deviceUpdate/:id', async (req, res) => {
  try {
    const jsonData = req.body;
    const jsonDataString = JSON.stringify(jsonData.data);
    const id = req.params.id;

    let retryCount = 0;
    let success = false;

    while (!success && retryCount < 3) {
      try {
        const query = `
          UPDATE TABUserDef_DataForm_P22C 
          SET lastUpdate = '${jsonData.data.lastUpdate}',
              startPeriod = '${jsonData.data.startPeriod}',
              endPeriod = '${jsonData.data.endPeriod}',
              blackTotalAverage = '${jsonData.data.coverageData.blackTotalAverage}',
              blackTotalUsagePage = '${jsonData.data.coverageData.blackTotalUsagePage}',
              cyanTotalAverage = '${jsonData.data.coverageData.cyanTotalAverage}',
              cyanTotalUsagePage = '${jsonData.data.coverageData.cyanTotalUsagePage}',
              magentaTotalAverage = '${jsonData.data.coverageData.magentaTotalAverage}',
              magentaTotalUsagePage = '${jsonData.data.coverageData.magentaTotalUsagePage}',
              yellowTotalAverage = '${jsonData.data.coverageData.yellowTotalAverage}',
              yellowTotalUsagePage = '${jsonData.data.coverageData.yellowTotalUsagePage}',
              blackTotalCopyAverage = '${jsonData.data.coverageData.blackTotalCopyAverage}',
              blackTotalCopyUsagePage = '${jsonData.data.coverageData.blackTotalCopyUsagePage}',
              cyanCopyAverage = '${jsonData.data.coverageData.cyanCopyAverage}',
              cyanCopyUsagePage = '${jsonData.data.coverageData.cyanCopyUsagePage}',
              magentaCopyAverage = '${jsonData.data.coverageData.magentaCopyAverage}',
              magentaCopyUsagePage = '${jsonData.data.coverageData.magentaCopyUsagePage}',
              yellowCopyAverage = '${jsonData.data.coverageData.yellowCopyAverage}',
              yellowCopyUsagePage = '${jsonData.data.coverageData.yellowCopyUsagePage}',
              blackTotalFAXAverage = '${jsonData.data.coverageData.blackTotalFAXAverage}',
              blackTotalFAXUsagePage = '${jsonData.data.coverageData.blackTotalFAXUsagePage}',
              blackTotalPrinterAverage = '${jsonData.data.coverageData.blackTotalPrinterAverage}',
              blackTotalPrinterUsagePage = '${jsonData.data.coverageData.blackTotalPrinterUsagePage}',
              cyanPrinterAverage = '${jsonData.data.coverageData.cyanPrinterAverage}',
              cyanPrinterUsagePage = '${jsonData.data.coverageData.cyanPrinterUsagePage}',
              magentaPrinterAverage = '${jsonData.data.coverageData.magentaPrinterAverage}',
              magentaPrinterUsagePage = '${jsonData.data.coverageData.magentaPrinterUsagePage}',
              yellowPrinterAverage = '${jsonData.data.coverageData.yellowPrinterAverage}',
              yellowPrinterUsagePage = '${jsonData.data.coverageData.yellowPrinterUsagePage}',
              completejson = '${jsonDataString}'
          WHERE DeviceId = '${id}' `;

        const result = await pool.request().query(query);
        success = true;
        res.status(200).send({ message: `Dati inseriti correttamente - ${jsonData.DeviceId} `, result: result });
      } catch (error) {
        console.error(error);
        if (error.code === 'EREQUEST' && error.number === 1205) {
          // Deadlock error, retry the transaction
          retryCount++;
        } else {
          res.status(500).send('Errore nell\'aggiornamento dei dati: ', error);
        }
      }
    }

    if (!success) {
      res.status(500).send('Errore nell\'aggiornamento dei dati: deadlock persistente');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Errore nell\'aggiornamento dei dati: ', error);
  }
});
    app.post('/api/inDevice', async (req, res) => {
      const jsonData = req.body;
      const jsonDataString = JSON.stringify(jsonData.data);
      const query = `
        DECLARE @sParam nvarchar(50) = 'P22C'
        DECLARE @sValue nvarchar(10) = NULL
        DECLARE @sPrefix nvarchar(1) = 'X'
        EXEC [dbo].[spHDANET_GetNewID] @sParam, @sValue OUTPUT, @sPrefix
        INSERT INTO TABUserDef_DataForm_P22C (IDProtocollo, DeviceID, lastUpdate, startPeriod, endPeriod, blackTotalAverage, blackTotalUsagePage, cyanTotalAverage, cyanTotalUsagePage, magentaTotalAverage, magentaTotalUsagePage, yellowTotalAverage, yellowTotalUsagePage, blackTotalCopyAverage, blackTotalCopyUsagePage, cyanCopyAverage, cyanCopyUsagePage, magentaCopyAverage, magentaCopyUsagePage, yellowCopyAverage, yellowCopyUsagePage, blackTotalFAXAverage, blackTotalFAXUsagePage, blackTotalPrinterAverage, blackTotalPrinterUsagePage, cyanPrinterAverage, cyanPrinterUsagePage, magentaPrinterAverage, magentaPrinterUsagePage, yellowPrinterAverage, yellowPrinterUsagePage,completejson)
        VALUES (@sValue, '${jsonData.DeviceId}', '${jsonData.data.lastUpdate}', '${jsonData.data.startPeriod}', '${jsonData.data.endPeriod}', '${jsonData.data.coverageData.blackTotalAverage}', '${jsonData.data.coverageData.blackTotalUsagePage}', '${jsonData.data.coverageData.cyanTotalAverage}', '${jsonData.data.coverageData.cyanTotalUsagePage}', '${jsonData.data.coverageData.magentaTotalAverage}', '${jsonData.data.coverageData.magentaTotalUsagePage}', '${jsonData.data.coverageData.yellowTotalAverage}', '${jsonData.data.coverageData.yellowTotalUsagePage}', '${jsonData.data.coverageData.blackTotalCopyAverage}', '${jsonData.data.coverageData.blackTotalCopyUsagePage}', '${jsonData.data.coverageData.cyanCopyAverage}', '${jsonData.data.coverageData.cyanCopyUsagePage}', '${jsonData.data.coverageData.magentaCopyAverage}', '${jsonData.data.coverageData.magentaCopyUsagePage}', '${jsonData.data.coverageData.yellowCopyAverage}', '${jsonData.data.coverageData.yellowCopyUsagePage}', '${jsonData.data.coverageData.blackTotalFAXAverage}', '${jsonData.data.coverageData.blackTotalFAXUsagePage}', '${jsonData.data.coverageData.blackTotalPrinterAverage}', '${jsonData.data.coverageData.blackTotalPrinterUsagePage}', '${jsonData.data.coverageData.cyanPrinterAverage}', '${jsonData.data.coverageData.cyanPrinterUsagePage}', '${jsonData.data.coverageData.magentaPrinterAverage}', '${jsonData.data.coverageData.magentaPrinterUsagePage}', '${jsonData.data.coverageData.yellowPrinterAverage}', '${jsonData.data.coverageData.yellowPrinterUsagePage}','${jsonDataString}
        ')`;
    
      try {
        const result2 = await pool.request().query(query);
        res.status(200).send({ message: `Dati inseriti correttamente - ${jsonData.DeviceId} `, result: result2 });
      } catch (error) {
        console.error(error);
        res.status(500).send(`Errore nell inserimento dei dati: ${jsonData.DeviceId} ` , error.message);
      }
    });

    app.delete('/api/deviceDelete/:id', async (req, res) => {
      try {
        const query = `DELETE FROM TABUserDef_DataForm_P22C WHERE DeviceId = '${req.params.id}'; `;
        const result = await pool.request().query(query);
        console.log('result :',result,'id: ',req.params.id);
        if (result.rowsAffected[0] > 0) {
          res.send('Dati eliminati correttamente.');
        } else {
          res.status(404).send('Nessun dato trovato per l\'ID specificato.');
        }
      } catch (error) {
        console.error(error);
        res.status(500).send('Errore nell\'eliminazione dei dati.',req.params.id);
      }
    });

    const port = 4001;
    app.listen(port, () => {
      console.log(`API in ascolto sulla porta ${port}`);
    });
  } catch (error) {
    console.error('Si è verificato un errore durante l\'avvio del server:', error);
  } finally {
    await sql.close();
  }
};
module.exports = {
  avviaServer
};

// avviaServer();