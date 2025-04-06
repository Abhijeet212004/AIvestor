FROM node:20-slim AS node_base

# Install Python
FROM node_base AS node_python
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Set up working directory
WORKDIR /app

# Copy package files and install Node.js dependencies
COPY upstox-server.js ./
COPY package.json package-lock.json* ./
RUN npm install

# Copy Python files and requirements
COPY stock-data-server.py ./
COPY finai-assistant/requirements.txt ./requirements.txt
COPY finai-assistant/server ./server/

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Create a unified server that runs all three services
COPY combined-server.js ./

# Expose the single port we'll use for the combined service
EXPOSE 8080

# Start the combined server
CMD ["node", "combined-server.js"]
