# Expo React Native Development Environment
FROM node:18-alpine

# Install Expo CLI globally
RUN npm install -g expo-cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose Metro bundler port
EXPOSE 8081

# Expose Expo DevTools port
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Set environment variable for Expo
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Start Expo development server
CMD ["npm", "start"]
