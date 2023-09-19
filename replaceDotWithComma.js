
import fs from 'fs';
const jsonFilePath = new URL('./coverages/coverages.json', import.meta.url);
export  async function replaceDotWithComma() {
  const updateJsonFile = async (filePath, newData) => {
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(newData, null, 2), 'utf8');
      console.log('File JSON aggiornato correttamente:', filePath);
    } catch (error) {
      throw new Error(`Errore durante l'aggiornamento del file JSON: ${error}`);
    }
  };

  const readJsonFile = async (filePath) => {
    try {
      const dataJson = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(dataJson);
    } catch (error) {
      throw new Error(`Errore durante la lettura del file JSON: ${error}`);
    }
  };

  try {
    const filePath = jsonFilePath;
    const dataJson = await readJsonFile(filePath);

    for (let key in dataJson.coverageData) {
      if (typeof dataJson.coverageData[key] === 'number') {
        const updatedValue = String(dataJson.coverageData[key]).replace('.', ',');
        dataJson.coverageData[key] = updatedValue;
      } else if (typeof dataJson.coverageData[key] === 'string' && dataJson.coverageData[key].includes('.')) {
        const updatedValue = dataJson.coverageData[key].replace('.', ',');
        dataJson.coverageData[key] = updatedValue;
      }
    }

    await updateJsonFile(filePath, dataJson);
  } catch (error) {
    console.error(error);
  }
}

