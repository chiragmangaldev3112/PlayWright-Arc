# Use the official Playwright image with Node.js
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=test
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p test-results playwright-report screenshots logs allure-results

# Set permissions
RUN chmod -R 755 /app

# Install additional system dependencies if needed
RUN apt-get update && apt-get install -y \
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Verify Playwright installation
RUN npx playwright --version

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Default command
CMD ["npm", "test"]

# Expose port for reports (if serving reports)
EXPOSE 3000

# Labels for better organization
LABEL maintainer="QA Automation Team"
LABEL description="Enterprise Playwright Test Automation Framework"
LABEL version="1.0.0"
