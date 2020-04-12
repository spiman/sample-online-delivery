# Online Delivery Sample API

Express/Node.js RESTful JSON API for a simplified online delivery application backed by a MongoDB store.

It uses Typescript for static typing, Mongoose as a Mongo ORM, fixer.io for exchange rates, API Blueprint for documentation.

## Requirements

- Node.js (v10+)
- MongoDB (or Docker)
- Preferrably a *nix environment

## Build

`yarn` will fetch all dependencies.

`yarn build` (or `npm run build`) will compile all typescript files to javascript.

Running `node dist/index.js` will spawn the application.

### or Build with docker (Optional)

`docker build .` will build a docker container with the packaged application.

Discovering the mongo supplied by `docker-compose` will require you to mount the container in the same network, so if using the supplied docker-compose you can do that with :

```
docker run --init --rm --network $(pwd)_default -p "3000:3000" -e MONGO__URI="mongodb://mongo:27017/desquared_delivery" <YOUR_CONTAINER>
```

## Development

`yarn start` will run a live-reload typescript server listening on port 3000 by default.

`docker-compose up -d` will spawn a simple mongo server for your needs.

## Documentation

The `yarn docs` target will parse the `blueprint.apib` file and build an html document with the API docs, which is then served on the root of the express app.

## Testing

Make sure you have a mongo server running. You can spawn one with the docker-compose file in the root of the repo.

`yarn test` will run a mocha suite.

`yarn coverage` will run the suite and report test coverage numbers.

## Configuration

The application uses the config.json file found at the directory level where it is ran.

You can supply the path to your own configuration file via the `CONFIG_FILE` env variable.

## Notes

- The fixer.io API key is a throwaway, should be a secret in a real world scenario
