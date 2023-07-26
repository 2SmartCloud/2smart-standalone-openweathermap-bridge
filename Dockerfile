FROM node:12-alpine3.12

WORKDIR /app

RUN apk update \
    && apk upgrade && apk add git

COPY config/ config/
COPY lib lib
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY app.js app.js
COPY index.js index.js

RUN npm ci --production

CMD npm start
