# Use Node LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Build app
RUN npm run build

# Serve using a lightweight server
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Run app
# serve will serve the production build
CMD ["serve", "-s", "dist", "-l", "5173"]
