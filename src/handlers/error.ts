import { NotFoundError } from "../domain/error";

export default function (err, req, res, next) {
    switch (err.name) {
        case 'NotFoundError':
            res.status(404).send();
            break;
        case 'ValidationError':
            res.status(400).send();
            break;
        default:
            console.error(err); //should be a logger ommiting now
            res.status(500).send();
    }
}