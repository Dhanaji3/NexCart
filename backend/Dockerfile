# Multi-stage build for micro-frontend
ARG APP_NAME=host

# Stage 1: Build
FROM node:20-alpine AS builder
ARG APP_NAME
WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY ${APP_NAME}/package.json ./${APP_NAME}/

RUN npm ci --workspace=shared --workspace=${APP_NAME}

COPY shared/ ./shared/
COPY ${APP_NAME}/ ./${APP_NAME}/

RUN npm run build --workspace=${APP_NAME}

# Stage 2: Serve
FROM nginx:alpine AS production
ARG APP_NAME
COPY --from=builder /app/${APP_NAME}/dist /usr/share/nginx/html
COPY nginx-mfe.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
