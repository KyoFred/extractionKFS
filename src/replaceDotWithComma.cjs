 
 async function replaceDotWithComma(jsonFilePath,fs) {
  const updateJsonFile = async (filePath, newData) => {
    try {
      await fs.promises.appendFile(filePath, JSON.stringify(newData, null, 2), 'utf8');
      console.log('File JSON aggiornato correttamente:', filePath);
    } catch (error) {
      throw new Error(`Errore durante l'aggiornamento del file JSON: ${error}`);
    }
  };

  const readJsonFile = async (filePath) => {
    try {
      const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
      let dataJson = '';

      for await (const chunk of stream) {
        dataJson += chunk;
      }

      return JSON.parse(dataJson);
    } catch (error) {
      throw new Error(`Errore durante la lettura del file JSON: ${error}`);
    }
  };

  try {
    const filePath = jsonFilePath;
    const dataJson = await readJsonFile(filePath);

    for (let key in dataJson.data.coverageData) {
      if (typeof dataJson.data.coverageData[key] === 'number') {
        const updatedValue = String(dataJson.data.coverageData[key]).replace('.', ',');
        dataJson.data.coverageData[key] = updatedValue;
      } else if (typeof dataJson.data.coverageData[key] === 'string' && dataJson.data.coverageData[key].includes('.')) {
        const updatedValue = dataJson.coverageData[key].replace('.', ',');
        dataJson.data.coverageData[key] = updatedValue;
      }
    }

    await fs.promises.truncate(filePath, 0);
    await updateJsonFile(filePath, dataJson);
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  replaceDotWithComma
};