import * as nconf from 'nconf';

const file = (process.env.CONFIG_FILE || 'config.json');

nconf.use('memory')
    .env()
    .file(file)

export default nconf;