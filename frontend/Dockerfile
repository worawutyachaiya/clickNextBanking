FROM node:16.20.2-alpine

WORKDIR /app

# Install Vue CLI globally
RUN npm install -g @vue/cli@5.0.8

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 8080

CMD ["npm", "run", "serve"]