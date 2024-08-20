FROM node:22-bullseye-slim
RUN npm install -g npm@8 && npm update -g
RUN apt-get update || : && apt-get install python -y
RUN apt-get update \
  && apt-get install -y --no-install-recommends chromium \
  && apt-get install firefox-esr -y

ENV CHROME_BIN=chromium
WORKDIR /src
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build -- --configuration production
# try to keep previous same in docker files can optomize the run and build speed
WORKDIR /src/dist/angular-grid-layout
RUN npm publish 