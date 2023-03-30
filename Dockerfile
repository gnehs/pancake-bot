FROM node:16
WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./components/inline/puffy/ ./components/inline/puffy/
RUN npm install --production
RUN echo {} >> database.json
ENV NODE_ENV=production
ENV BOT_TOKEN=1234:abcd
COPY . /app/
CMD ["npm", "start"]