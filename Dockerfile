FROM node:latest

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x /app/src/index.js


RUN echo "0 9* * * node /app/src/index.js" > /etc/crontab

EXPOSE 4001

# Avvia il servizio cron all'interno del contenitore
CMD ["sh", "-c", "node /app/src/index.js && crond -l 2 -f"]