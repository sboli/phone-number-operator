# Build stage
FROM node:20-alpine as build

WORKDIR /usr/src/app
ADD package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive --prefer-offline --no-progress --production=false
ADD . .
RUN yarn run build

# Run stage
FROM node:20-alpine as run

CMD ["node", "dist/main"]

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist/
ADD package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive --prefer-offline --no-progress
ADD . .
