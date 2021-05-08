FROM node:alpine
RUN apk add --no-cache g++ make
# Install python/pip
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
# app
WORKDIR /app
COPY . /app
RUN echo {} >> database.json
ENV NODE_ENV=production
ENV BOT_TOKEN=1234:abcd
RUN npm install --production
CMD ["npm", "start"]