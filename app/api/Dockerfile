FROM node:22-alpine

WORKDIR /app

# Add curl to the container for health checks
RUN apk add --no-cache curl

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]