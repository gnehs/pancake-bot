FROM node:16-slim
WORKDIR /app
COPY . /app
RUN echo {} >> database.json
ENV NODE_ENV=production
ENV BOT_TOKEN=1234:abcd
RUN npm install --production
CMD ["npm", "start"]