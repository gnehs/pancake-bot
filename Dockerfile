FROM node:26-bookworm-slim AS build

ENV TZ=Asia/Taipei
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app
RUN npm install --global pnpm@11.7.0
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./.npmrc ./
RUN pnpm install --frozen-lockfile
COPY ./tsconfig.json ./
COPY ./src ./src
RUN pnpm typecheck
RUN pnpm prune --prod

FROM node:26-bookworm-slim

ENV TZ=Asia/Taipei
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app
ENV NODE_ENV=production
# Keep stable, large assets in their own layers and out of the build stage.
COPY ./components/inline/puffy ./components/inline/puffy
COPY ./components/inline/sticker ./components/inline/sticker
COPY ./components/inline/inlinethumb.psd ./components/inline/inlinethumb.psd
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
VOLUME ["/app/data"]
CMD ["node", "src/main.ts"]
