#Docs Renderer
FROM humangeo/aglio AS docs
WORKDIR /opt/docs/
COPY blueprint.apib .
RUN ["aglio", "-i", "blueprint.apib", "-o", "./index.html"]

#Application
FROM node:erbium

WORKDIR /opt/app/

COPY package.json yarn.lock config.json tsconfig.json ./
COPY src ./src
RUN yarn global add typescript
RUN yarn --production && yarn build

COPY --from=docs /opt/docs/index.html ./public/index.html

ARG NODE_ENV="production"
ENV NODE_ENV=$NODE_ENV

ARG CONFIG_FILE="config.json"
ENV CONFIG_FILE=$CONFIG_FILE

ENTRYPOINT ["node", "dist/index.js"]
