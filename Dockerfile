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

# Create and activate a Python virtual environment
RUN python3 -m venv /app/venv
# Install Python dependencies in the virtual environment
RUN /app/venv/bin/pip install --no-cache-dir -r requirements.txt

# Create a unified server that runs all three services
COPY combined-server.js ./

# Set environment variable to use the virtual environment
ENV PATH="/app/venv/bin:$PATH"

# Expose the single port we'll use for the combined service
EXPOSE 8080

# Command to run the combined server
CMD ["node", "combined-server.js"]
