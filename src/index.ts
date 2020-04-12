import * as mongoose from 'mongoose';
import * as schedule from 'node-schedule';
import config from './config';
import app from './server';
import updateRates from "./workers/exchange_rate_updater";

mongoose.connect(config.get('mongo:uri'), config.get('mongo:options')).then(async () => {

    //should be a separate process
    schedule.scheduleJob('1 * * * *', updateRates);
    await updateRates();

    const port = config.get('port') || 3000;
    await app.listen(port);
    console.log(`Server started on port ${port}`);
});
