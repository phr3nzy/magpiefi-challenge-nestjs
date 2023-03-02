FROM node:19-alpine AS BUILDER

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run generate

RUN npm run build

FROM node:19-alpine

WORKDIR /app

RUN apk add --no-cache tini

RUN adduser -D node-user -G node
USER node-user

COPY --chown=node-user:node --from=BUILDER /app .

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "/app/dist/main.js", "--max-old-space-size=400"]
