# === STAGE 1: Build the Angular application ===
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Using npm install instead of npm ci to avoid dependency resolution issues
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Build the application for production
RUN npm run build -- --configuration=production

# === STAGE 2: Serve the application with Nginx ===
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled files from stage 1 to Nginx HTML folder
COPY --from=build /app/dist/DataShare_Frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]