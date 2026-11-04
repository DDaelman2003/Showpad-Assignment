FROM node:20-alpine

WORKDIR /app

# Kopieer package bestanden eerst voor caching van npm install
COPY package*.json ./

# Installeer alle dependencies (inclusief devDependencies voor de compiler)
RUN npm install

# Kopieer de rest van de broncode
COPY . .

# Compileer TypeScript naar JavaScript in de /app/dist map
RUN npx tsc

# Start de applicatie vanuit de gecompileerde output
EXPOSE 3000
CMD ["node", "dist/app.js"]