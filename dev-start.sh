#!/bin/bash

# EchoArty Development Environment Startup Script
# This script starts the complete development environment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║                                                      ║"
echo "║           🎨  EchoArty Development Mode  🎨          ║"
echo "║                                                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo -e "${YELLOW}   Please install Docker first: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    echo -e "${YELLOW}   Please install Docker Compose first${NC}"
    exit 1
fi

# Use docker compose or docker-compose
if docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo -e "${BLUE}📦 Step 1: Checking Dependencies...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed!${NC}"
    exit 1
fi

# Check and install Python packages
if ! python3 -c "import flask" &> /dev/null || \
   ! python3 -c "import pymysql" &> /dev/null || \
   ! python3 -c "import flask_sqlalchemy" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Installing Python dependencies...${NC}"
    pip install -r requirements.txt
    echo -e "${GREEN}✅ Python dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Python dependencies ready${NC}"
fi

echo -e "\n${BLUE}📋 Step 2: Environment Configuration...${NC}"

# Backup current .env if it exists
if [ -f .env ]; then
    if [ ! -f .env.cloud ]; then
        cp .env .env.cloud
        echo -e "${GREEN}✅ Backed up cloud .env to .env.cloud${NC}"
    else
        echo -e "${CYAN}ℹ️  Cloud backup already exists${NC}"
    fi
fi

# Use Docker environment
if [ -f .env.docker ]; then
    cp .env.docker .env
    echo -e "${GREEN}✅ Using Docker environment (.env.docker)${NC}"
else
    echo -e "${YELLOW}⚠️  Creating default .env.docker${NC}"
    cat > .env.docker << 'EOF'
DB_USER="echoarty_user"
DB_PASSWORD="echoartypassword"
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="echoart"
SECRET_KEY="dev-secret-key-change-in-production"
EOF
    cp .env.docker .env
fi

echo -e "\n${BLUE}🐳 Step 3: Starting Docker Containers...${NC}"

# Create logs directory
mkdir -p docker/logs

# Check if port 3306 is available
if lsof -Pi :3306 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3306 is already in use${NC}"
    echo -e "${YELLOW}   This might be a local MySQL/MariaDB service${NC}"
    read -p "Stop local MySQL and continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo systemctl stop mysql 2>/dev/null || sudo systemctl stop mariadb 2>/dev/null || true
    else
        echo -e "${RED}Aborted. Please stop the service using port 3306 first.${NC}"
        exit 1
    fi
fi

# Start Docker containers
$DOCKER_COMPOSE up -d

echo -e "${CYAN}⏳ Waiting for database to be ready...${NC}"
sleep 10

# Check container health
if docker ps | grep -q "echoarty_mariadb"; then
    echo -e "${GREEN}✅ MariaDB container is running${NC}"
else
    echo -e "${RED}❌ Failed to start MariaDB${NC}"
    echo -e "${YELLOW}Check logs: $DOCKER_COMPOSE logs mariadb${NC}"
    exit 1
fi

if docker ps | grep -q "echoarty_phpmyadmin"; then
    echo -e "${GREEN}✅ phpMyAdmin container is running${NC}"
else
    echo -e "${YELLOW}⚠️  phpMyAdmin container not running${NC}"
fi

echo -e "\n${BLUE}🚀 Step 4: Starting Flask Applications...${NC}"

# Kill any existing Flask processes
pkill -f "python3 api_app.py" 2>/dev/null || true
pkill -f "python3 app.py" 2>/dev/null || true

# Start API Backend
echo -e "${CYAN}Starting API Backend (port 5000)...${NC}"
nohup python3 api_app.py > api.log 2>&1 &
API_PID=$!
echo $API_PID > .api.pid
sleep 3

# Check if API started
if ps -p $API_PID > /dev/null; then
    echo -e "${GREEN}✅ API Backend started (PID: $API_PID)${NC}"
else
    echo -e "${RED}❌ Failed to start API Backend${NC}"
    echo -e "${YELLOW}Check api.log for errors${NC}"
    exit 1
fi

# Start Frontend
echo -e "${CYAN}Starting Frontend (port 8080)...${NC}"
nohup python3 app.py > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > .frontend.pid
sleep 2

# Check if Frontend started
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Failed to start Frontend${NC}"
    echo -e "${YELLOW}Check frontend.log for errors${NC}"
    exit 1
fi

# Success banner
echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║                                                      ║"
echo "║          ✨  Development Environment Ready!  ✨      ║"
echo "║                                                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Service information
echo -e "${CYAN}📊 Services:${NC}"
echo -e "   ${GREEN}•${NC} Frontend:    ${BLUE}http://localhost:8080${NC}"
echo -e "   ${GREEN}•${NC} API:         ${BLUE}http://localhost:5000${NC}"
echo -e "   ${GREEN}•${NC} phpMyAdmin:  ${BLUE}http://localhost:8081${NC}"
echo -e "   ${GREEN}•${NC} Database:    ${BLUE}localhost:3306${NC}"

echo -e "\n${CYAN}🔐 Database Credentials:${NC}"
echo -e "   ${GREEN}•${NC} Database: ${YELLOW}echoart${NC}"
echo -e "   ${GREEN}•${NC} User:     ${YELLOW}echoarty_user${NC} / ${YELLOW}echoartypassword${NC}"
echo -e "   ${GREEN}•${NC} Root:     ${YELLOW}root${NC} / ${YELLOW}rootpassword${NC}"

echo -e "\n${CYAN}👤 Test Accounts:${NC}"
echo -e "   ${GREEN}•${NC} Admin:    ${YELLOW}admin${NC} / ${YELLOW}admin123${NC}"
echo -e "   ${GREEN}•${NC} Staff:    ${YELLOW}staff${NC} / ${YELLOW}staff123${NC}"
echo -e "   ${GREEN}•${NC} Customer: ${YELLOW}customer${NC} / ${YELLOW}customer123${NC}"

echo -e "\n${CYAN}📝 Logs:${NC}"
echo -e "   ${GREEN}•${NC} API:      ${YELLOW}tail -f api.log${NC}"
echo -e "   ${GREEN}•${NC} Frontend: ${YELLOW}tail -f frontend.log${NC}"
echo -e "   ${GREEN}•${NC} Database: ${YELLOW}$DOCKER_COMPOSE logs -f mariadb${NC}"

echo -e "\n${CYAN}🛑 To Stop:${NC}"
echo -e "   ${YELLOW}./dev-stop.sh${NC}"

echo -e "\n${GREEN}✨ Happy coding! ✨${NC}\n"
