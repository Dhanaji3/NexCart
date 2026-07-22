# 🎯 Local Development Setup (Without Docker)

## Your Available Tools

✅ Java 17

## Current implementation notes

- The local backend now supports the same cart, product stock, and order routes used by the frontend, so the dev workflow matches the current API contract.
- When testing admin flows, verify that product edits update stock values and that order status changes go through the admin order status endpoint.
  ✅ Node.js 20  
  ✅ npm 10.2.3  
  ❌ Docker (install if you want production-ready containers)  
  ❌ kubectl (install if you want Kubernetes)

---

## 🚀 Quick Start - Local Development

### Step 1: Setup PostgreSQL Database

**Option A: Use Docker for Database Only**

```bash
# Requires Docker (minimal installation)
docker run --name ecommerce-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ecommerce_db \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -d postgres:15-alpine

# Test connection
psql -h localhost -U postgres -d ecommerce_db -c "SELECT 1"
```

**Option B: Install PostgreSQL Locally**

1. Download PostgreSQL 15: https://www.postgresql.org/download/windows/
2. Install with password: `postgres`
3. Create database:
   ```sql
   CREATE DATABASE ecommerce_db;
   ```

---

### Step 2: Start Backend (Spring Boot)

```bash
cd backend/backend-springboot

# Option A: Using Gradle Wrapper (automatically downloads Gradle)
# This uses the local development profile by default.
./gradlew bootRun

# If you want to explicitly set the profile:
# ./gradlew bootRun -Dspring.profiles.active=dev

# Option B: If Gradle wrapper fails
# Use Docker to build and run
docker build -t ecommerce-backend .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ecommerce_db \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  ecommerce-backend
```

**Expected Output:**

```
Started EcommerceApplication in 8.234 seconds
Tomcat started on port(s): 8080
```

**Verify:**

- Open http://localhost:8080/api/health
- Open http://localhost:8080/swagger-ui.html

---

### Step 3: Start Frontend (Vue 3)

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Expected Output:**

```
  VITE v5.0.0  ready in 450 ms

  ➜  Local:   http://localhost:5000/
```

**Access:** http://localhost:5000

---

## 📝 Environment Configuration

Create `.env` file in root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ecommerce_db

# Spring Boot
SPRING_PROFILES_ACTIVE=dev
JWT_SECRET=dev-secret-key-minimum-32-characters-long
JWT_EXPIRATION=86400000

# Frontend
VITE_API_URL=http://localhost:8080/api
VITE_APP_TITLE=E-Commerce Platform
NODE_ENV=development
```

---

## ✅ Full Local Stack Running

Once all three are started:

| Service         | URL                                   | Port |
| --------------- | ------------------------------------- | ---- |
| Frontend        | http://localhost:5000                 | 5000 |
| Backend API     | http://localhost:8080/api             | 8080 |
| Backend Swagger | http://localhost:8080/swagger-ui.html | 8080 |
| Database        | localhost                             | 5432 |

---

## 🧪 Testing Locally

### 1. Test Backend Health

```bash
curl http://localhost:8080/api/health
```

Expected response:

```json
{ "status": "UP" }
```

### 2. Test API via Swagger UI

1. Open http://localhost:8080/swagger-ui.html
2. Click "Authorize" button
3. Register new user:
   ```json
   {
     "email": "test@example.com",
     "password": "Test123!@",
     "firstName": "Test",
     "lastName": "User"
   }
   ```
4. Login and get JWT token
5. Try other endpoints

### 3. Test Frontend

1. Open http://localhost:5000
2. Navigate through pages
3. Try adding products to cart
4. Test authentication flows

---

## 📋 Troubleshooting - Local Development

### Backend Won't Start

**Error:** "Connection to database refused"

```bash
# Check if PostgreSQL is running
psql -h localhost -U postgres -c "SELECT 1"

# If using Docker container
docker ps | grep postgres

# If not running, start it
docker run --name ecommerce-postgres ...
```

**Error:** "Gradle wrapper not found"

```bash
# Option 1: Download gradle manually
# Set GRADLE_USER_HOME=C:\Users\YourUser\.gradle
# Then run: gradlew wrapper --gradle-version=8.5

# Option 2: Use Docker to build
docker build -t backend:local backend/backend-springboot/
docker run -p 8080:8080 backend:local

# Option 3: Install Gradle system-wide
# choco install gradle  (Windows with Chocolatey)
# brew install gradle   (macOS with Homebrew)
```

### Frontend Won't Connect to Backend

**Issue:** API calls fail with CORS error

**Solution:**

1. Verify backend is running: http://localhost:8080/api/health
2. Check VITE_API_URL in `.env`
3. Verify CORS settings in `backend/application.yml`
4. Restart frontend: `npm run dev`

### Database Connection Issues

```bash
# Test connection directly
psql -h localhost -U postgres -d ecommerce_db

# Check if database exists
psql -h localhost -U postgres -l | grep ecommerce

# View logs
docker logs ecommerce-postgres  # If using Docker

# Restart database
# Stop: docker stop ecommerce-postgres
# Start: docker start ecommerce-postgres
# Or restart: docker restart ecommerce-postgres
```

### Port Already in Use

```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Or in Task Manager: Search for PID from above

# Kill process
taskkill /PID <PID> /F

# Or use different port in application.yml
```

---

## 🔧 Development Workflow

### Making Changes

**Frontend Changes:**

- Files auto-reload (hot module replacement)
- No restart needed
- Check browser console for errors

**Backend Changes:**

- Restart Spring Boot
- Kill the running process and run `./gradlew bootRun` again
- Or enable Spring DevTools for faster reload

### Viewing Logs

**Frontend:**

```bash
# Already visible in npm terminal
# Or check browser DevTools (F12)
```

**Backend:**

```bash
# Already visible in gradle terminal
# Or check logs file
# Default: backend/backend-springboot/logs/application.log
```

**Database:**

```bash
# If using Docker
docker logs -f ecommerce-postgres

# If using local PostgreSQL
# Check PostgreSQL server logs (varies by installation)
```

---

## 🆙 Upgrading to Production

When you're ready for production, you'll need to:

### 1. Install Docker Desktop

- Windows/macOS: https://www.docker.com/products/docker-desktop
- Linux: Follow Docker documentation

### 2. Install Kubernetes

- **Docker Desktop:** Includes Kubernetes (enable in settings)
- **Minikube:** https://minikube.sigs.k8s.io/docs/start/
- **Cloud Cluster:** AWS EKS, Google GKE, Azure AKS

### 3. Deploy with Docker Compose (Staging)

```bash
# Build images
docker build -t backend:prod backend/backend-springboot/

# Start full stack
docker-compose up -d

# Verify
docker-compose ps
```

### 4. Deploy to Kubernetes (Production)

```bash
# Deploy all components
kubectl apply -f k8s/00-common.yaml
kubectl apply -f k8s/01-database.yaml
kubectl apply -f k8s/02-backend.yaml
kubectl apply -f k8s/03-frontend.yaml

# Monitor
kubectl get all -n ecommerce
```

---

## 📊 Architecture - Local Development

```
Your Machine
├─ PostgreSQL (local or Docker)
│   └─ Port 5432
│
├─ Spring Boot Backend
│   ├─ Runs: ./gradlew bootRun
│   ├─ Port 8080
│   └─ Connects to PostgreSQL
│
└─ Vue 3 Frontend
    ├─ Runs: npm run dev
    ├─ Port 5000
    └─ Calls Backend API at http://localhost:8080
```

---

## 📈 Next Steps

### Immediate (Today)

- [ ] Set up PostgreSQL (local or Docker)
- [ ] Start Spring Boot backend: `./gradlew bootRun`
- [ ] Start Vue frontend: `npm run dev`
- [ ] Test at http://localhost:5000
- [ ] Create test user via Swagger

### This Week

- [ ] Make changes, test locally
- [ ] Verify all features work
- [ ] Fix any bugs
- [ ] Write/run tests

### Before Production

- [ ] Install Docker Desktop
- [ ] Test docker-compose locally
- [ ] Set up Kubernetes cluster
- [ ] Deploy K8s manifests
- [ ] Configure domain & SSL/TLS
- [ ] Set up monitoring
- [ ] Run load tests

---

## 🚀 Commands Cheat Sheet - Local Dev

```bash
# Terminal 1: Start PostgreSQL
docker run --name ecommerce-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine

# Terminal 2: Start Backend
cd backend/backend-springboot
./gradlew bootRun

# Terminal 3: Start Frontend
cd frontend
npm run dev

# Additional useful commands

# Test backend health
curl http://localhost:8080/api/health

# Test API
curl -X GET http://localhost:8080/api/products

# Access Swagger UI
# Open in browser: http://localhost:8080/swagger-ui.html

# Database operations
psql -h localhost -U postgres -d ecommerce_db

# Stop everything
# Press Ctrl+C in each terminal

# Check logs
docker logs -f ecommerce-postgres
```

---

## 📚 Useful Documentation

- **Spring Boot:** https://spring.io/projects/spring-boot/
- **Vue.js:** https://vuejs.org/
- **Gradle:** https://gradle.org/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Swagger/OpenAPI:** https://swagger.io/

---

## ✨ What's Configured

✅ Spring Boot 3.2.0 with Spring Security  
✅ JWT authentication  
✅ PostgreSQL with JPA  
✅ Swagger/OpenAPI documentation  
✅ Vue 3 with Module Federation  
✅ Tailwind CSS styling  
✅ Pinia state management  
✅ Development and production profiles

---

**Status:** ✅ **Ready for Local Development**

When you install Docker, you'll also get production-ready deployment!
