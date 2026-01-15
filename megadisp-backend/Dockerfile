FROM node:18-alpine

# oracle dependency
RUN sudo apt-get update && sudo apt-get install -y \
    libaio1 \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

 
WORKDIR /opt/oracle

RUN wget https://download.oracle.com/otn_software/linux/instantclient/instantclient-basiclite-linux.x64-21.9.0.0.0dbru.zip \
 && unzip instantclient-basiclite-linux.x64-21.9.0.0.0dbru.zip \
 && rm instantclient-basiclite-linux.x64-21.9.0.0dbru.zip \
 && ln -s /opt/oracle/instantclient_* /opt/oracle/instantclient

ENV LD_LIBRARY_PATH=/opt/oracle/instantclient
ENV PATH=/opt/oracle/instantclient:$PATH

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
