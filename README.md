# MagpieFi Challenge Solution (Nest.js)

A single CRON job ([here](./src/services/tasks.service.ts)) is responsible for updating the pairs from thegraph's endpoint. It will run every 30 minutes and will run the first time the server is started.

An HTTP endpoint (`/pairs`) that fetches all pairs stored in the database is used to validate that the cron is working.

## Requirements

- [Node.js](https://nodejs.org/en/) v19+
- [npm](https://www.npmjs.com/) v9+
- [MongoDB](https://www.mongodb.com/) - no install needed (part of `docker-compose.yml`)
- [Docker](https://www.docker.com/) v23+
- [Docker Compose](https://docs.docker.com/compose/) v2+

## Installation

```bash
npm install
```

## Usage

```bash
# spin up the necessary infrastructure
$ docker compose up -d

# create a development-only environment variables file
$ cp .env.template .env

# generate prisma client
$ npm run generate

# sync the database
$ npm run push

# run in development mode
$ npm run start:dev
```
