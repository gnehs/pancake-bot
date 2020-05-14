FROM node:alpine

WORKDIR /app
COPY . /app
RUN echo {} >> database.json
ENV NODE_ENV=production
RUN npm install --production
CMD ["npm", "start"]