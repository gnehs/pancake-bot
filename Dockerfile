FROM node:20
WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install --production
RUN echo {} >> database.json
ENV NODE_ENV=production
ENV BOT_TOKEN=1234:abcd
COPY ./components/inline/puffy/ ./components/inline/puffy/
COPY . .
CMD ["npm", "start"]