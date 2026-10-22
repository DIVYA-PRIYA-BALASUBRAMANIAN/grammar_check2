# ==============================================================================
# Zenve Vet React Client Dockerfile
# Builds production optimized bundle and serves via Alpine Nginx
# ==============================================================================

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /var/www/client/dist
COPY ./nginx-client.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
