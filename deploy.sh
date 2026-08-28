#!/bin/bash
set -e

echo "============================================="
echo " Starting Mack Trading Contest AWS Deployment "
echo "============================================="

# 1. Install Docker if not available
if ! command -v docker &> /dev/null; then
    echo "[1/4] Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "Docker installed successfully."
else
    echo "[1/4] Docker is already installed."
fi

# 2. Configure frontend config.json
echo "[2/4] Configuring frontend to point to relative API path /api..."
echo '{"API_URL": "/api"}' > frontend/config.json

# 3. Create backend .env from template if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "[3/4] Creating backend/.env from template..."
    cp backend/.env.template backend/.env
    
    # Generate unique keys to keep it secure out-of-the-box
    RANDOM_SECRET=$(openssl rand -hex 32)
    RANDOM_ENC=$(openssl rand -hex 16) # 32 characters long hex
    
    # Substitute values
    sed -i "s/your-super-secret-key-change-in-production-32-characters-minimum/$RANDOM_SECRET/g" backend/.env
    sed -i "s/your-32-byte-encryption-key-here-1234567890/$RANDOM_ENC/g" backend/.env
    
    echo "Generated secure SECRET_KEY and ENCRYPTION_KEY in backend/.env"
else
    echo "[3/4] backend/.env already exists. Skipping creation."
fi

# 4. Build and start containers
echo "[4/4] Starting application containers using Docker Compose..."
if docker compose version &> /dev/null; then
    sudo docker compose up --build -d
else
    sudo docker-compose up --build -d
fi

echo "============================================="
echo " Deployment Completed Successfully! "
echo "============================================="
echo "Check container status:   sudo docker compose ps"
echo "Check backend logs:       sudo docker compose logs -f backend"
echo "Check nginx logs:         sudo docker compose logs -f nginx"
echo "============================================="
