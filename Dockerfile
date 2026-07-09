FROM node:26-bookworm-slim AS build

ENV TZ=Asia/Taipei
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app
RUN corepack enable
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./.npmrc ./
RUN pnpm install --frozen-lockfile
COPY ./tsconfig.json ./
COPY ./src ./src
COPY ./components/inline ./components/inline
RUN pnpm typecheck
RUN pnpm prune --prod

FROM node:26-bookworm-slim

ENV TZ=Asia/Taipei
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/components/inline ./components/inline
VOLUME ["/app/data"]
CMD ["node", "src/main.ts"]
