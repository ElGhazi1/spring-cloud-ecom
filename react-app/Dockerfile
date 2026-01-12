# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Update all packages to latest versions with security patches
RUN apk upgrade --no-cache --available && rm -rf /var/cache/apk/*

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine

# Update all packages to latest versions with security patches
RUN apk upgrade --no-cache --available && rm -rf /var/cache/apk/*

# Copy build artifacts and configure nginx
COPY --from=build /app/build /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx && \
    chmod -R 755 /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

USER nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
