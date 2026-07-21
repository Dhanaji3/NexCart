# Spring Boot E-Commerce Backend

A production-ready Spring Boot backend API for the Vue 3 micro-frontends e-commerce platform.

## Recent implementation notes

- Cart quantity updates are accepted through the current cart endpoint contract.
- Product stock values persist correctly when admins create or update products.
- Order visibility and status update flows now follow the customer/admin route split.

## Prerequisites

- **Java 17** or higher
- **Maven 3.8.1** or higher
- **PostgreSQL 12** or higher
- **Git**

## Project Structure

```
backend-springboot/
├── pom.xml                                      ← Maven dependencies
├── README.md                                    ← This file
├── src/
│   ├── main/
│   │   ├── java/com/ecommerce/
│   │   │   ├── ECommerceBackendApplication.java ← Main application class
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java          ← Spring Security configuration
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java          ← Authentication endpoints
│   │   │   │   ├── ProductController.java       ← Product endpoints
│   │   │   │   ├── CartController.java          ← Cart endpoints
│   │   │   │   ├── OrderController.java         ← Order endpoints
│   │   │   │   ├── AdminController.java         ← Admin endpoints
│   │   │   │   └── HealthController.java        ← Health check endpoint
│   │   │   ├── model/
│   │   │   │   ├── User.java                    ← User entity
│   │   │   │   ├── Product.java                 ← Product entity
│   │   │   │   ├── Cart.java                    ← Cart entity
│   │   │   │   ├── CartItem.java                ← Cart item entity
│   │   │   │   ├── Order.java                   ← Order entity
│   │   │   │   ├── OrderItem.java               ← Order item entity
│   │   │   │   └── Wishlist.java                ← Wishlist entity
│   │   │   ├── dto/
│   │   │   │   ├── LoginRequest.java            ← Login DTO
│   │   │   │   ├── RegisterRequest.java         ← Registration DTO
│   │   │   │   ├── AuthResponse.java            ← Auth response DTO
│   │   │   │   ├── ProductDTO.java              ← Product DTO
│   │   │   │   ├── CartDTO.java                 ← Cart DTO
│   │   │   │   ├── CartItemDTO.java             ← Cart item DTO
│   │   │   │   ├── OrderDTO.java                ← Order DTO
│   │   │   │   └── OrderItemDTO.java            ← Order item DTO
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java          ← User repository
│   │   │   │   ├── ProductRepository.java       ← Product repository
│   │   │   │   ├── CartRepository.java          ← Cart repository
│   │   │   │   ├── OrderRepository.java         ← Order repository
│   │   │   │   └── WishlistRepository.java      ← Wishlist repository
│   │   │   ├── service/
│   │   │   │   ├── UserService.java             ← User service
│   │   │   │   ├── AuthService.java             ← Authentication service
│   │   │   │   ├── ProductService.java          ← Product service
│   │   │   │   ├── CartService.java             ← Cart service
│   │   │   │   └── OrderService.java            ← Order service
│   │   │   └── security/
│   │   │       ├── JwtTokenProvider.java        ← JWT token generation/validation
│   │   │       └── JwtAuthenticationFilter.java ← JWT authentication filter
│   │   └── resources/
│   │       └── application.yml                  ← Spring Boot configuration
│   └── test/                                    ← Unit tests (to be added)
```

## Technology Stack

| Technology      | Version | Purpose                        |
| --------------- | ------- | ------------------------------ |
| Spring Boot     | 3.2.0   | Framework                      |
| Spring Data JPA | 3.2.0   | ORM                            |
| Spring Security | 3.2.0   | Authentication & Authorization |
| PostgreSQL      | 42.x    | Database                       |
| JWT (jjwt)      | 0.12.3  | Token generation & validation  |
| Lombok          | 1.18.x  | Reduce boilerplate code        |
| Maven           | 3.8+    | Build tool                     |

## Setup Instructions

### 1. PostgreSQL Database Setup

**Create the database:**

```sql
CREATE DATABASE ecommerce_db;
```

**Optional: Create a dedicated user:**

```sql
CREATE USER ecommerce_user WITH PASSWORD 'your_secure_password';
ALTER ROLE ecommerce_user SET client_encoding TO 'utf8';
ALTER ROLE ecommerce_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE ecommerce_user SET default_transaction_deferrable TO on;
ALTER ROLE ecommerce_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
```

### 2. Environment Configuration

**Update `src/main/resources/application.yml` with your database credentials:**

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ecommerce_db
    username: postgres # or your custom user
    password: postgres # your password
```

**Set JWT Secret (important for production):**

```bash
# Linux/Mac
export JWT_SECRET="your-very-secure-secret-key-at-least-32-characters-long"

# Windows (PowerShell)
$env:JWT_SECRET="your-very-secure-secret-key-at-least-32-characters-long"

# Windows (Command Prompt)
set JWT_SECRET=your-very-secure-secret-key-at-least-32-characters-long
```

Or update directly in `application.yml`:

```yaml
jwt:
  secret: your-secret-key-here
```

### 3. Build the Project

```bash
# Navigate to the backend-springboot directory
cd backend-springboot

# Build with Maven
mvn clean install
```

### 4. Run the Application

```bash
# Using Maven
mvn spring-boot:run

# Or run the JAR directly (after building)
java -jar target/backend-springboot-1.0.0.jar
```

The application will start on **http://localhost:8080** with API context path `/api`

### 5. Verify the API is Running

```bash
curl http://localhost:8080/api/health
```

Expected response:

```json
{
  "status": "UP",
  "service": "E-Commerce Backend"
}
```

## API Endpoints

### Authentication (Public)

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login user        |

**Request Examples:**

Register:

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Login:

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "userId": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Products (Public)

| Method | Endpoint                            | Description              |
| ------ | ----------------------------------- | ------------------------ |
| GET    | `/api/products`                     | Get all active products  |
| GET    | `/api/products/{id}`                | Get product by ID        |
| GET    | `/api/products/category/{category}` | Get products by category |

**Response:**

```json
{
  "id": 1,
  "sku": "PROD-001",
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "stock": 100,
  "category": "Electronics",
  "imageUrl": "https://example.com/image.jpg",
  "active": true,
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00"
}
```

### Cart (Authenticated)

| Method | Endpoint                                  | Description              |
| ------ | ----------------------------------------- | ------------------------ |
| GET    | `/api/cart`                               | Get user's cart          |
| POST   | `/api/cart/add/{productId}?quantity=1`    | Add product to cart      |
| DELETE | `/api/cart/remove/{productId}`            | Remove product from cart |
| PUT    | `/api/cart/update/{productId}?quantity=5` | Update product quantity  |
| DELETE | `/api/cart/clear`                         | Clear entire cart        |

**Headers required:** `Authorization: Bearer <token>`

### Orders (Authenticated)

| Method | Endpoint           | Description            |
| ------ | ------------------ | ---------------------- |
| POST   | `/api/orders`      | Create order from cart |
| GET    | `/api/orders`      | Get user's orders      |
| GET    | `/api/orders/{id}` | Get order by ID        |

**Create Order Request Body:**

```json
{
  "shippingAddress": "123 Main St, City, State 12345",
  "notes": "Please deliver in the morning"
}
```

### Admin Operations (Admin Only)

| Method | Endpoint                                       | Description                 |
| ------ | ---------------------------------------------- | --------------------------- |
| GET    | `/api/admin/products`                          | Get all products            |
| POST   | `/api/admin/products`                          | Create new product          |
| PUT    | `/api/admin/products/{id}`                     | Update product              |
| DELETE | `/api/admin/products/{id}`                     | Delete (deactivate) product |
| GET    | `/api/admin/orders`                            | Get all orders              |
| GET    | `/api/admin/orders/status/{status}`            | Get orders by status        |
| PUT    | `/api/admin/orders/{id}/status?status=SHIPPED` | Update order status         |

**Create Product Request:**

```json
{
  "sku": "PROD-123",
  "name": "New Product",
  "description": "Product description",
  "price": 29.99,
  "stock": 50,
  "category": "Electronics",
  "imageUrl": "https://example.com/product.jpg",
  "active": true
}
```

## Authentication & JWT Tokens

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The token is valid for **24 hours** by default (configurable in `application.yml`).

## CORS Configuration

The backend is configured to accept requests from all micro-frontend ports:

- http://localhost:5000 (host)
- http://localhost:5001 (mfe-auth)
- http://localhost:5002 (mfe-products)
- http://localhost:5003 (mfe-cart)
- http://localhost:5004 (mfe-checkout)
- http://localhost:5005 (mfe-orders)
- http://localhost:5006 (mfe-admin)

## Database Schema

The application automatically creates the following tables:

- `users` - User accounts (customer/admin)
- `products` - Product catalog
- `carts` - Shopping carts
- `cart_items` - Items in carts
- `orders` - Customer orders
- `order_items` - Items in orders
- `wishlists` - User wishlists

## Error Handling

Common error responses:

```json
{
  "timestamp": "2024-01-01T12:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid token",
  "path": "/api/cart"
}
```

## Gradual Migration Strategy

Since this backend runs alongside the Express.js server, you can:

1. Keep the Express server running for development
2. Gradually move endpoints to Spring Boot
3. Update Vue components to use the new Spring Boot endpoints
4. Test thoroughly before removing Express endpoints

Update your Vue components' API endpoints:

```typescript
// Old (Express)
const apiUrl = "http://localhost:3001/api";

// New (Spring Boot)
const apiUrl = "http://localhost:8080/api";
```

## Production Deployment

### Building for Production

```bash
mvn clean package -DskipTests
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM eclipse-temurin:17-jdk-alpine
COPY target/backend-springboot-1.0.0.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
EXPOSE 8080
```

Build and run:

```bash
docker build -t ecommerce-backend:1.0 .
docker run -d -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/ecommerce_db \
  -e JWT_SECRET=your-secret \
  --name ecommerce-backend \
  ecommerce-backend:1.0
```

## Next Steps

1. **Add Test Coverage** - Create unit tests in `src/test`
2. **Add Wishlist API** - Create endpoints for wishlist management
3. **Add Payment Integration** - Integrate Stripe or PayPal
4. **Add Email Notifications** - Send order confirmations
5. **Add API Documentation** - Use Springdoc OpenAPI (Swagger)
6. **Performance Optimization** - Add caching, pagination
7. **Security Hardening** - Add rate limiting, input validation

## Troubleshooting

### PostgreSQL Connection Error

```
Cannot get a connection, pool error Timeout waiting for idle object
```

**Solution:**

- Ensure PostgreSQL is running
- Check database URL, username, and password in `application.yml`
- Verify database exists: `psql -U postgres -c "\\l ecommerce_db"`

### JWT Token Errors

```
JWT validation error: The key size of the signing key for SignatureAlgorithm HS256 must be at least 256 bits
```

**Solution:**

- Use a longer JWT secret (at least 32 characters)
- Update `jwt.secret` in `application.yml` or `JWT_SECRET` environment variable

### Build Errors

```
[ERROR] COMPILATION ERROR
```

**Solution:**

- Ensure Java 17+ is installed: `java -version`
- Clear Maven cache: `mvn clean`
- Rebuild: `mvn clean install`

## Support & Documentation

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA Guide](https://spring.io/projects/spring-data-jpa)
- [Spring Security Reference](https://spring.io/projects/spring-security)
- [JWT (jjwt) Documentation](https://github.com/jwtk/jjwt)

## License

MIT License - Feel free to use this code for your projects.
