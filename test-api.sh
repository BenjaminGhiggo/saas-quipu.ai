#!/bin/bash

# Script para probar todos los endpoints de la API Quipu.ai
# Usar: ./test-api.sh [BASE_URL]
# Ejemplo: ./test-api.sh http://167.86.90.102:5001

BASE_URL=${1:-"http://localhost:5001"}
echo "🧪 Probando API Quipu.ai en: $BASE_URL"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local auth_header=$4
    local data=$5
    
    echo -e "\n${YELLOW}Testing:${NC} $description"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        if [ -n "$auth_header" ]; then
            response=$(curl -s -w "\n%{http_code}" -H "$auth_header" "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
        fi
    elif [ "$method" = "POST" ]; then
        if [ -n "$auth_header" ]; then
            response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -H "$auth_header" -d "$data" "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ Success (HTTP $http_code)${NC}"
        echo "$body" | head -c 200
        if [ ${#body} -gt 200 ]; then
            echo "... (truncated)"
        fi
    else
        echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
        echo "$body"
    fi
}

# Start testing
echo -e "\n${YELLOW}1. Health Check${NC}"
test_endpoint "GET" "/health" "Health endpoint"

echo -e "\n${YELLOW}2. Authentication${NC}"
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"demo@quipu.ai","password":"password"}' "$BASE_URL/api/auth/login")
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful, token obtained${NC}"
    AUTH_HEADER="Authorization: Bearer $TOKEN"
else
    echo -e "${RED}✗ Login failed, using mock token${NC}"
    TOKEN="mock-jwt-token-123456"
    AUTH_HEADER="Authorization: Bearer $TOKEN"
fi

test_endpoint "POST" "/api/auth/login" "Standard login" "" '{"email":"demo@quipu.ai","password":"password"}'
test_endpoint "POST" "/api/auth/login/sunat" "SUNAT login" "" '{"ruc":"12345678901","username":"DEMO123","password":"demo123"}'

echo -e "\n${YELLOW}3. User Profile${NC}"
test_endpoint "GET" "/api/user/profile" "User profile" "$AUTH_HEADER"

echo -e "\n${YELLOW}4. Chat/Kappi${NC}"
test_endpoint "POST" "/api/chat/message" "Chat message" "$AUTH_HEADER" '{"message":"¿cuánto debo declarar este mes?"}'

echo -e "\n${YELLOW}5. Invoices${NC}"
test_endpoint "GET" "/api/invoices" "Get invoices" "$AUTH_HEADER"

echo -e "\n${YELLOW}6. Declarations${NC}"
test_endpoint "GET" "/api/declarations" "Get declarations" "$AUTH_HEADER"

echo -e "\n${YELLOW}7. Metrics${NC}"
test_endpoint "GET" "/api/metrics" "Get metrics" "$AUTH_HEADER"

echo -e "\n${YELLOW}8. Alerts${NC}"
test_endpoint "GET" "/api/alerts" "Get alerts" "$AUTH_HEADER"

echo -e "\n${YELLOW}9. 404 Test${NC}"
test_endpoint "GET" "/api/nonexistent" "Non-existent endpoint"

echo -e "\n=========================================="
echo -e "${GREEN}🎉 API testing completed!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Start backend: cd backend && node server-simple.js"
echo "2. Test locally: ./test-api.sh"
echo "3. Test on VPS: ./test-api.sh http://167.86.90.102:5001"
echo "4. Start frontend: cd frontend && npm run dev"
echo "5. Open browser: http://167.86.90.102:5000"