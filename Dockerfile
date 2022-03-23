# Build stage
FROM node:17-alpine as build

WORKDIR /usr/src/app
ADD package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive --prefer-offline --no-progress --production=false
ADD . .
RUN yarn run build

# Run stage
FROM node:17-alpine as run

CMD ["node", "dist/main"]

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist/
ADD https://www.data.gouv.fr/fr/datasets/r/19630568-4b05-4192-a989-9040a4383520 ./data/MAJOPE.xls
ADD https://www.data.gouv.fr/fr/datasets/r/90e8bdd0-0f5c-47ac-bd39-5f46463eb806 ./data/MAJNUM.xlsx
ADD package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive --prefer-offline --no-progress
ADD . .
