FROM node:22 AS build

COPY . /opt/yara-web-client

VOLUME ['/opt/yara-web-client/dist']
ENV BASE='/'
ENV API_PATH='/'

WORKDIR /opt/yara-web-client
RUN npm ci

CMD npm run build-only -- --base=${BASE}
