#!/bin/bash

# Script completo de deployment para VPS Quipu.ai
# Ejecutar como root en la VPS: ./deploy-vps-complete.sh

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="167.86.90.102"
PROJECT_DIR="/proyectos1/quipus"
FRONTEND_PORT="5000"
BACKEND_PORT="5001"
MONGO_PORT="27017"

echo -e "${BLUE}🚀 Quipu.ai VPS Deployment Script${NC}"
echo -e "${BLUE}===================================${NC}"
echo "VPS IP: $VPS_IP"
echo "Project Dir: $PROJECT_DIR"
echo "Ports: Frontend($FRONTEND_PORT), Backend($BACKEND_PORT), MongoDB($MONGO_PORT)"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js if not present
install_nodejs() {
    if ! command_exists node; then
        echo -e "${YELLOW}📦 Installing Node.js...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        apt-get install -y nodejs
        echo -e "${GREEN}✅ Node.js installed: $(node --version)${NC}"
    else
        echo -e "${GREEN}✅ Node.js already installed: $(node --version)${NC}"
    fi
}

# Function to install MongoDB if not present
install_mongodb() {
    if ! command_exists mongod; then
        echo -e "${YELLOW}📦 Installing MongoDB...${NC}"
        apt-get update
        apt-get install -y mongodb
        
        # Configure MongoDB to accept external connections
        sed -i 's/bind_ip = 127.0.0.1/bind_ip = 0.0.0.0/' /etc/mongodb.conf
        
        # Start and enable MongoDB
        systemctl start mongodb
        systemctl enable mongodb
        
        echo -e "${GREEN}✅ MongoDB installed and configured${NC}"
    else
        echo -e "${GREEN}✅ MongoDB already installed${NC}"
        # Ensure it's configured for external access
        if grep -q "bind_ip = 127.0.0.1" /etc/mongodb.conf; then
            sed -i 's/bind_ip = 127.0.0.1/bind_ip = 0.0.0.0/' /etc/mongodb.conf
            systemctl restart mongodb
            echo -e "${YELLOW}🔧 MongoDB reconfigured for external access${NC}"
        fi
    fi
}

# Function to install PM2 if not present
install_pm2() {
    if ! command_exists pm2; then
        echo -e "${YELLOW}📦 Installing PM2...${NC}"
        npm install -g pm2
        echo -e "${GREEN}✅ PM2 installed${NC}"
    else
        echo -e "${GREEN}✅ PM2 already installed${NC}"
    fi
}

# Function to setup firewall
setup_firewall() {
    echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
    
    # Install UFW if not present
    if ! command_exists ufw; then
        apt-get install -y ufw
    fi
    
    # Configure UFW rules
    ufw --force enable
    ufw allow ssh
    ufw allow $FRONTEND_PORT
    ufw allow $BACKEND_PORT
    ufw allow $MONGO_PORT
    
    echo -e "${GREEN}✅ Firewall configured${NC}"
    ufw status
}

# Function to setup project
setup_project() {
    echo -e "${YELLOW}📁 Setting up project directory...${NC}"
    
    # Create project directory if it doesn't exist
    mkdir -p $PROJECT_DIR
    cd $PROJECT_DIR
    
    # If project exists, update it; otherwise clone would go here
    if [ -d ".git" ]; then
        echo -e "${YELLOW}📥 Updating existing project...${NC}"
        # git pull origin main  # Uncomment when you have git repo
    else
        echo -e "${YELLOW}📂 Project directory ready for manual upload${NC}"
        echo "Please upload your project files to: $PROJECT_DIR"
    fi
}

# Function to install dependencies
install_dependencies() {
    echo -e "${YELLOW}📦 Installing project dependencies...${NC}"
    
    # Backend dependencies
    if [ -d "$PROJECT_DIR/backend" ]; then
        echo "Installing backend dependencies..."
        cd $PROJECT_DIR/backend
        npm install
        echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    fi
    
    # Frontend dependencies
    if [ -d "$PROJECT_DIR/frontend" ]; then
        echo "Installing frontend dependencies..."
        cd $PROJECT_DIR/frontend
        npm install
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    fi
}

# Function to build frontend
build_frontend() {
    if [ -d "$PROJECT_DIR/frontend" ]; then
        echo -e "${YELLOW}🏗️ Building frontend...${NC}"
        cd $PROJECT_DIR/frontend
        npm run build
        echo -e "${GREEN}✅ Frontend build completed${NC}"
    fi
}

# Function to setup MongoDB data
setup_mongodb_data() {
    echo -e "${YELLOW}🗄️ Setting up MongoDB data...${NC}"
    
    # Check if mongosh is available, otherwise use mongo
    if command_exists mongosh; then
        MONGO_CMD="mongosh"
    elif command_exists mongo; then
        MONGO_CMD="mongo"
    else
        echo -e "${RED}❌ No MongoDB client found${NC}"
        return 1
    fi
    
    # Wait for MongoDB to be ready
    echo "Waiting for MongoDB to be ready..."
    for i in {1..30}; do
        if $MONGO_CMD --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
            break
        fi
        echo "Waiting for MongoDB... ($i/30)"
        sleep 2
    done
    
    # Setup database
    if [ -f "$PROJECT_DIR/mongodb-setup.js" ]; then
        echo "Executing MongoDB setup script..."
        $MONGO_CMD < $PROJECT_DIR/mongodb-setup.js
        echo -e "${GREEN}✅ MongoDB data setup completed${NC}"
    else
        echo -e "${YELLOW}⚠️ MongoDB setup script not found${NC}"
    fi
}

# Function to create PM2 ecosystem file
create_pm2_config() {
    echo -e "${YELLOW}⚙️ Creating PM2 configuration...${NC}"
    
    cat > $PROJECT_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'quipu-backend',
      script: './backend/server-simple.js',
      cwd: '$PROJECT_DIR',
      env: {
        NODE_ENV: 'production',
        PORT: $BACKEND_PORT
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'quipu-frontend',
      script: 'serve',
      args: '-s dist -p $FRONTEND_PORT',
      cwd: '$PROJECT_DIR/frontend',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
}
EOF
    
    # Install serve globally for frontend
    npm install -g serve
    
    # Create logs directory
    mkdir -p $PROJECT_DIR/logs
    
    echo -e "${GREEN}✅ PM2 configuration created${NC}"
}

# Function to start services with PM2
start_services() {
    echo -e "${YELLOW}🚀 Starting services with PM2...${NC}"
    
    cd $PROJECT_DIR
    
    # Stop existing services
    pm2 delete all 2>/dev/null || true
    
    # Start services
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup systemd -u root --hp /root
    
    echo -e "${GREEN}✅ Services started with PM2${NC}"
    pm2 list
}

# Function to test services
test_services() {
    echo -e "${YELLOW}🧪 Testing services...${NC}"
    
    # Test backend
    echo "Testing backend..."
    if curl -s http://localhost:$BACKEND_PORT/health >/dev/null; then
        echo -e "${GREEN}✅ Backend is responding${NC}"
    else
        echo -e "${RED}❌ Backend is not responding${NC}"
    fi
    
    # Test frontend
    echo "Testing frontend..."
    if curl -s http://localhost:$FRONTEND_PORT >/dev/null; then
        echo -e "${GREEN}✅ Frontend is responding${NC}"
    else
        echo -e "${RED}❌ Frontend is not responding${NC}"
    fi
    
    # Test MongoDB
    echo "Testing MongoDB..."
    if command_exists mongosh; then
        if mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ MongoDB is responding${NC}"
        else
            echo -e "${RED}❌ MongoDB is not responding${NC}"
        fi
    fi
}

# Main deployment function
main() {
    echo -e "${BLUE}Starting deployment process...${NC}"
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}❌ Please run as root${NC}"
        exit 1
    fi
    
    # Update system
    echo -e "${YELLOW}📥 Updating system packages...${NC}"
    apt-get update
    
    # Install required software
    install_nodejs
    install_mongodb
    install_pm2
    
    # Setup firewall
    setup_firewall
    
    # Setup project
    setup_project
    
    # Install dependencies (only if project files exist)
    if [ -f "$PROJECT_DIR/backend/package.json" ]; then
        install_dependencies
        build_frontend
        setup_mongodb_data
        create_pm2_config
        start_services
        test_services
        
        echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
        echo -e "\n${BLUE}📋 Service Information:${NC}"
        echo "Frontend: http://$VPS_IP:$FRONTEND_PORT"
        echo "Backend: http://$VPS_IP:$BACKEND_PORT"
        echo "API: http://$VPS_IP:$BACKEND_PORT/api"
        echo "Health: http://$VPS_IP:$BACKEND_PORT/health"
        echo "MongoDB: $VPS_IP:$MONGO_PORT"
        echo ""
        echo -e "${BLUE}🔑 Demo Credentials:${NC}"
        echo "Email: demo@quipu.ai"
        echo "Password: password"
        echo ""
        echo "SUNAT Login:"
        echo "RUC: 12345678901"
        echo "Usuario: DEMO123"
        echo "Clave: demo123"
        echo ""
        echo -e "${BLUE}📊 PM2 Status:${NC}"
        pm2 list
        echo ""
        echo -e "${BLUE}🔧 Management Commands:${NC}"
        echo "pm2 restart all    # Restart all services"
        echo "pm2 logs           # View logs"
        echo "pm2 monit          # Monitor services"
        echo "systemctl status mongodb  # Check MongoDB"
        
    else
        echo -e "\n${YELLOW}⚠️ Project files not found in $PROJECT_DIR${NC}"
        echo "Please upload your project files and run this script again."
        echo ""
        echo "Required structure:"
        echo "$PROJECT_DIR/"
        echo "├── backend/"
        echo "│   ├── package.json"
        echo "│   └── server-simple.js"
        echo "├── frontend/"
        echo "│   ├── package.json"
        echo "│   └── src/"
        echo "└── mongodb-setup.js"
    fi
}

# Run main function
main "$@"