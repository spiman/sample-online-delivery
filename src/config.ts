import * as nconf from 'nconf';

const file = (process.env.CONFIG_FILE || 'config.json');

nconf.use('memory')
    .env({
        lowerCase: true,
        separator: '__',
        whitelist: ['mongo:uri', 'fixer:key']
    })
    .file(file)

export default nconf;