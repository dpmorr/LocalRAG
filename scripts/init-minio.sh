#!/bin/bash

# Initialize MinIO buckets

echo "🪣 Initializing MinIO buckets..."

# Wait for MinIO to be ready
echo "Waiting for MinIO to start..."
sleep 5

# Install mc (MinIO Client) if not present
if ! command -v mc &> /dev/null; then
    echo "Installing MinIO Client..."
    wget https://dl.min.io/client/mc/release/linux-amd64/mc
    chmod +x mc
    sudo mv mc /usr/local/bin/
fi

# Configure mc
mc alias set local http://localhost:9000 career_mentor dev_password

# Create bucket
mc mb local/career-mentor 2>/dev/null || echo "Bucket already exists"

# Set bucket policy (public read for artifacts)
mc anonymous set download local/career-mentor/artifacts

echo "✅ MinIO buckets initialized successfully!"
