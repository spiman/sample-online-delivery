import { NotFoundError } from "../domain/error";

export default function (err, req, res, next) {
    switch (err.name) {
        case 'NotFoundError':
            console.log('resource not found', err);
            res.status(404).send();
            break;
        case 'ValidationError':
            console.log('failed with validation error', err);
            res.status(400).send();
            break;
        default:
            console.error(err); //should be a logger ommiting now
            res.status(500).send();
    }
}