import { NotFoundError } from "../domain/error";

const debug = require('debug')('api:error')

export default function (err, req, res, next) {
    switch (err.name) {
        case 'NotFoundError':
            debug('resource not found', err);
            res.status(404).send();
            break;
        case 'ValidationError':
            debug('failed with validation error', err);
            res.status(400).send();
            break;
        default:
            console.error(err); //should be a logger omitting now
            res.status(500).send();
    }
}