import * as nconf from 'nconf';

const file = (process.env.CONFIG_FILE || 'config.json');

nconf.use('memory')
    .env({ lowerCase: true, separator: '__' })
    .file(file)

export default nconf;