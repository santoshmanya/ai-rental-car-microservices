FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY services/*/package*.json ./services/
COPY api-gateway/package*.json ./api-gateway/
COPY database ./database

# Install dependencies
RUN npm install
RUN cd api-gateway && npm install

# Copy source code
COPY . .

EXPOSE 3000 3001 3002 3003 3004 3005

CMD ["npm", "run", "dev"]
