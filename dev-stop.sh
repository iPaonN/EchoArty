#!/bin/bash

# EchoArty Development Environment Stop Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║                                                      ║"
echo "║        🛑  Stopping Development Environment  🛑      ║"
echo "║                                                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Use docker compose or docker-compose
if docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo -e "${YELLOW}Stopping Flask applications...${NC}"

# Stop API Backend
if [ -f .api.pid ]; then
    API_PID=$(cat .api.pid)
    if ps -p $API_PID > /dev/null 2>&1; then
        kill $API_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Stopped API Backend (PID: $API_PID)${NC}"
    fi
    rm .api.pid
fi

# Stop Frontend
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Stopped Frontend (PID: $FRONTEND_PID)${NC}"
    fi
    rm .frontend.pid
fi

# Kill any remaining Flask processes
pkill -f "python3 api_app.py" 2>/dev/null || true
pkill -f "python3 app.py" 2>/dev/null || true

echo -e "\n${YELLOW}Stopping Docker containers...${NC}"
$DOCKER_COMPOSE down

echo -e "\n${YELLOW}Restoring cloud environment...${NC}"
if [ -f .env.cloud ]; then
    cp .env.cloud .env
    echo -e "${GREEN}✅ Restored .env from .env.cloud${NC}"
else
    echo -e "${YELLOW}⚠️  No cloud backup found, keeping current .env${NC}"
fi

echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║                                                      ║"
echo "║          ✅  Development Environment Stopped  ✅     ║"
echo "║                                                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

echo -e "${BLUE}💡 Tips:${NC}"
echo -e "   • Start again: ${YELLOW}./dev-start.sh${NC}"
echo -e "   • View logs: ${YELLOW}tail -f api.log frontend.log${NC}"
echo -e "   • Clean data: ${YELLOW}$DOCKER_COMPOSE down -v${NC}"
echo -e ""
