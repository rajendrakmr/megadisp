FROM oraclelinux:8-slim

# Install Node.js
RUN dnf install -y nodejs wget unzip libaio \
    && dnf clean all

# Oracle Instant Client (from Oracle repo)
RUN dnf install -y oracle-instantclient-basiclite

ENV LD_LIBRARY_PATH=/usr/lib/oracle/21/client64/lib

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000
CMD ["npm", "start"]
