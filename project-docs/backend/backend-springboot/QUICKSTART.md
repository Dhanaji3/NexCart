# Quick Start Guide - Spring Boot Backend

Get the Spring Boot backend running in 5 minutes!

## Prerequisites Check

```bash
# Check Java version (should be 17+)
java -version

# Check Maven version
mvn -version

# Check if PostgreSQL is running
psql --version
```

## Current backend behavior notes

- The backend now accepts the cart update payload used by the frontend.
- Admin product edits save stock values correctly.
- Order listing and status updates are routed through the correct customer/admin endpoints.

## Step 1: Create Database

Open a terminal and connect to PostgreSQL:

```bash
# Linux/Mac
psql -U postgres

# Windows (if psql is in PATH)
psql -U postgres
```

Then run:

```sql
CREATE DATABASE ecommerce_db;
```

If you want to verify:

```sql
\l
SELECT datname FROM pg_database WHERE datname = 'ecommerce_db';
```

Exit with `\q`

## Step 2: Configure Application

Navigate to the backend-springboot directory:

```bash
cd backend-springboot
```

Edit `src/main/resources/application.yml` and update if needed:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ecommerce_db
    username: postgres # Your PostgreSQL username
    password: postgres # Your PostgreSQL password
```

## Step 3: Build the Project

```bash
mvn clean install
```

This will download all dependencies and compile the project. First build may take 2-3 minutes.

## Step 4: Run the Application

```bash
mvn spring-boot:run
```

Or run the JAR directly:

```bash
mvn clean package
java -jar target/backend-springboot-1.0.0.jar
```

You should see output like:

```
...
2024-01-01 12:00:00.000 INFO 12345 --- [main] com.ecommerce.ECommerceBackendApplication : Started ECommerceBackendApplication in 5.123 seconds
...
Spring Boot application started successfully!
Application is running on: http://localhost:8080
```

## Step 5: Test the API

Open a new terminal and run:

```bash
# Test health endpoint
curl http://localhost:8080/api/health

# Expected response:
# {"status":"UP","service":"E-Commerce Backend"}
```

## Step 6: Create Sample Data (Optional)

Create a `src/main/resources/data.sql` file with sample products:

```sql
INSERT INTO products (sku, name, description, price, stock, category, active, created_at, updated_at) VALUES
('PROD-001', 'Laptop', 'High-performance laptop', 999.99, 50, 'Electronics', true, NOW(), NOW()),
('PROD-002', 'Mouse', 'Wireless mouse', 29.99, 200, 'Electronics', true, NOW(), NOW()),
('PROD-003', 'Keyboard', 'Mechanical keyboard', 79.99, 100, 'Electronics', true, NOW(), NOW()),
('PROD-004', 'Monitor', '27" 4K monitor', 399.99, 30, 'Electronics', true, NOW(), NOW()),
('PROD-005', 'Headphones', 'Noise-cancelling headphones', 199.99, 75, 'Electronics', true, NOW(), NOW());
```

Then enable in `application.yml`:

```yaml
spring:
  jpa:
    defer-datasource-initialization: true
  sql:
    init:
      mode: always
```

## Common Commands

### Stop the Application

Press `Ctrl + C` in the terminal

### View Logs

Logs are printed to console. For file logging, add to `application.yml`:

```yaml
logging:
  file:
    name: logs/application.log
```

### Access Database Directly

```bash
psql -U postgres -d ecommerce_db

# View tables
\dt

# View products
SELECT * FROM products;
```

### Rebuild Without Running

```bash
mvn clean install
```

### Run Tests (when added)

```bash
mvn test
```

## Integration with Vue Frontend

Update the Vue composables to use the Spring Boot API:

**In `shared/src/composables/http.ts`:**

```typescript
const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 5000,
});
```

**In `.env`:**

```
VITE_API_URL=http://localhost:8080/api
```

Or keep both running and gradually migrate:

```typescript
// Use Spring Boot for new features
const authApi = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Keep Express for existing features
const productsApi = axios.create({
  baseURL: "http://localhost:3001/api",
});
```

## Running Both Backends

You can run both the Express.js and Spring Boot backends side-by-side:

**Terminal 1 - Express (port 3001):**

```bash
cd api-server
npm install
npm start
```

**Terminal 2 - Spring Boot (port 8080):**

```bash
cd backend-springboot
mvn spring-boot:run
```

Both will be available:

- Express: `http://localhost:3001/api`
- Spring Boot: `http://localhost:8080/api`

## Troubleshooting

### Error: Cannot connect to database

```
ERROR: role "postgres" does not exist
```

**Solution:** Check your PostgreSQL installation and username. If using different credentials, update `application.yml`.

### Error: Port 8080 already in use

```
java.io.IOException: Address already in use
```

**Solution:** Either stop the process using port 8080 or change the port in `application.yml`:

```yaml
server:
  port: 8081 # Change to different port
```

### Error: Maven command not found

**Solution:** Ensure Maven is installed and in your PATH:

```bash
# Windows
set PATH=%PATH%;C:\apache-maven-3.9.x\bin

# Linux/Mac
export PATH=$PATH:/path/to/maven/bin
```

## Next: Frontend Integration

Once the backend is running and tested, update your Vue components:

```typescript
// Login
const response = await axios.post("http://localhost:8080/api/auth/login", {
  email: "user@example.com",
  password: "password123",
});
const token = response.data.token;
localStorage.setItem("token", token);

// Get Products
const products = await axios.get("http://localhost:8080/api/products");

// Add to Cart
await axios.post(
  "http://localhost:8080/api/cart/add/1?quantity=1",
  {},
  {
    headers: { Authorization: `Bearer ${token}` },
  },
);
```

## More Information

See [README.md](./README.md) for complete documentation on:

- API endpoints
- Database schema
- Production deployment
- Docker setup
- Error handling

---

**Happy coding!** 🚀
