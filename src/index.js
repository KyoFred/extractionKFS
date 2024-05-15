import cron from 'node-cron';
import { avviaServer } from './api/hdaCoverage.cjs';
import { stepsExtraction } from './stepsExtraction.cjs';

cron.schedule('48 9 * * *', () => {
  stepsExtraction();
});

await avviaServer();
//stepsExtraction();
