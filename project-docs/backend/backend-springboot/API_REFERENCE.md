# Spring Boot E-Commerce API Reference

Complete API documentation with all endpoints, request/response examples, and error codes.

## Base URL

### Current behavior notes

- Cart quantity updates are supported through PUT /api/cart/{productId} with a JSON body containing quantity.
- Admin product create/update requests can include stock or inStock; the backend persists stock and derives availability from it.
- GET /api/orders returns the signed-in user’s orders, while GET /api/admin/orders returns all orders for admins. Admin status changes use PUT /api/admin/orders/{id}/status.

```
http://localhost:8080/api
```

## Authentication

All endpoints except login, register, products, and health require JWT token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Format

### Success Response (2xx)

```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Response (4xx, 5xx)

```json
{
  "timestamp": "2024-01-01T12:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid input",
  "path": "/api/auth/register"
}
```

## Error Codes

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 200  | OK - Success                            |
| 201  | Created - Resource created              |
| 204  | No Content - Success with no body       |
| 400  | Bad Request - Invalid input             |
| 401  | Unauthorized - Missing or invalid token |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource doesn't exist      |
| 409  | Conflict - Resource already exists      |
| 500  | Internal Server Error                   |

---

## Authentication Endpoints

### Register New User

**Endpoint:** `POST /auth/register`

**Access:** Public

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Request Example:**

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Success Response (201):**

```json
{
  "userId": 1,
  "email": "newuser@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJuZXd1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6IkNVU1RPTUVSIiwidXNlcklkIjoxLCJpYXQiOjE2ODcyNzc3MzksImV4cCI6MTY4NzM2NDEzOX0.5nXPyVpzPfZ8mKqLrZ8qN5pXmXqZpXmXqZpXmXqZpXQ"
}
```

**Error Response (409):**

```json
{
  "timestamp": "2024-01-01T12:00:00",
  "status": 409,
  "error": "Conflict",
  "message": "Email already registered",
  "path": "/api/auth/register"
}
```

---

### Login User

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Request Example:**

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**Success Response (200):**

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

**Error Response (401):**

```json
{
  "timestamp": "2024-01-01T12:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password",
  "path": "/api/auth/login"
}
```

---

## Product Endpoints

### Get All Products

**Endpoint:** `GET /products`

**Access:** Public

**Query Parameters:** None

**Request Example:**

```bash
curl http://localhost:8080/api/products
```

**Success Response (200):**

```json
[
  {
    "id": 1,
    "sku": "LAPTOP-001",
    "name": "Premium Laptop Pro",
    "description": "High-performance laptop...",
    "price": 1299.99,
    "stock": 25,
    "category": "Electronics",
    "imageUrl": "https://example.com/laptop.jpg",
    "active": true,
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  },
  {
    "id": 2,
    "sku": "MOUSE-001",
    "name": "Wireless Mouse Pro",
    "description": "Ergonomic wireless mouse...",
    "price": 49.99,
    "stock": 100,
    "category": "Accessories",
    "imageUrl": "https://example.com/mouse.jpg",
    "active": true,
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
]
```

---

### Get Product by ID

**Endpoint:** `GET /products/{id}`

**Access:** Public

**Path Parameters:**

- `id` (Long) - Product ID

**Request Example:**

```bash
curl http://localhost:8080/api/products/1
```

**Success Response (200):**

```json
{
  "id": 1,
  "sku": "LAPTOP-001",
  "name": "Premium Laptop Pro",
  "description": "High-performance laptop...",
  "price": 1299.99,
  "stock": 25,
  "category": "Electronics",
  "imageUrl": "https://example.com/laptop.jpg",
  "active": true,
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00"
}
```

**Error Response (404):**

```json
{
  "timestamp": "2024-01-01T12:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Product not found with id: 999",
  "path": "/api/products/999"
}
```

---

### Get Products by Category

**Endpoint:** `GET /products/category/{category}`

**Access:** Public

**Path Parameters:**

- `category` (String) - Category name

**Request Example:**

```bash
curl http://localhost:8080/api/products/category/Electronics
```

**Success Response (200):**

```json
[
  {
    "id": 1,
    "sku": "LAPTOP-001",
    "name": "Premium Laptop Pro",
    ...
  },
  {
    "id": 6,
    "sku": "WEBCAM-001",
    "name": "4K Webcam",
    ...
  }
]
```

---

## Cart Endpoints

### Get User's Cart

**Endpoint:** `GET /cart`

**Access:** Authenticated

**Request Example:**

```bash
curl http://localhost:8080/api/cart \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**

```json
{
  "id": 1,
  "items": [
    {
      "id": 10,
      "product": {
        "id": 1,
        "sku": "LAPTOP-001",
        "name": "Premium Laptop Pro",
        "price": 1299.99,
        "stock": 25,
        "category": "Electronics",
        "imageUrl": "https://example.com/laptop.jpg",
        "active": true
      },
      "quantity": 1,
      "subtotal": 1299.99
    }
  ],
  "totalItems": 1,
  "totalPrice": 1299.99
}
```

---

### Add Item to Cart

**Endpoint:** `POST /cart/add/{productId}`

**Access:** Authenticated

**Path Parameters:**

- `productId` (Long) - Product to add

**Query Parameters:**

- `quantity` (Integer, default: 1) - Quantity to add

**Request Example:**

```bash
curl -X POST "http://localhost:8080/api/cart/add/1?quantity=2" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**

```json
{
  "id": 1,
  "items": [
    {
      "id": 10,
      "product": {...},
      "quantity": 2,
      "subtotal": 2599.98
    }
  ],
  "totalItems": 2,
  "totalPrice": 2599.98
}
```

---

### Update Cart Item Quantity

**Endpoint:** `PUT /cart/update/{productId}`

**Access:** Authenticated

**Path Parameters:**

- `productId` (Long) - Product to update

**Query Parameters:**

- `quantity` (Integer) - New quantity (0 to remove)

**Request Example:**

```bash
curl -X PUT "http://localhost:8080/api/cart/update/1?quantity=3" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**

```json
{
  "id": 1,
  "items": [
    {
      "id": 10,
      "product": {...},
      "quantity": 3,
      "subtotal": 3899.97
    }
  ],
  "totalItems": 3,
  "totalPrice": 3899.97
}
```

---

### Remove Item from Cart

**Endpoint:** `DELETE /cart/remove/{productId}`

**Access:** Authenticated

**Path Parameters:**

- `productId` (Long) - Product to remove

**Request Example:**

```bash
curl -X DELETE http://localhost:8080/api/cart/remove/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**

```json
{
  "id": 1,
  "items": [],
  "totalItems": 0,
  "totalPrice": 0
}
```

---

### Clear Cart

**Endpoint:** `DELETE /cart/clear`

**Access:** Authenticated

**Request Example:**

```bash
curl -X DELETE http://localhost:8080/api/cart/clear \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**

```json
{
  "id": 1,
  "items": [],
  "totalItems": 0,
  "totalPrice": 0
}
```

---

## Order Endpoints

### Create Order

**Endpoint:** `POST /orders`

**Access:** Authenticated

**Request Body:**

```json
{
  "shippingAddress": "123 Main Street, Springfield, IL 62701",
  "notes": "Please deliver in the morning"
}
```

**Request Example:**

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "shippingAddress": "123 Main Street, Springfield, IL 62701",
    "notes": "Please deliver in the morning"
  }'
```

**Success Response (201):**

```json
{
  "id": 1,
  "status": "PENDING",
  "totalPrice": 2599.98,
  "shippingAddress": "123 Main Street, Springfield, IL 62701",
  "notes": "Please deliver in the morning",
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "sku": "LAPTOP-001",
        "name": "Premium Laptop Pro",
        "price": 1299.99
      },
      "quantity": 2,
      "price": 1299.99,
      "subtotal": 2599.98
    }
  ],
  "createdAt": "2024-01-01T12:00:00",
  "updatedAt": "2024-01-01T12:00:00"
}
```

**Error Response (400):**

```json
{
  "timestamp": "2024-01-01T12:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Cart is empty",
  "path": "/api/orders"
}
```

---

### Get User's Orders

**Endpoint:** `GET /orders`

**Access:** Authenticated

**Request Example:**

```bash
curl http://localhost:8080/api/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**

```json
[
  {
    "id": 1,
    "status": "PENDING",
    "totalPrice": 2599.98,
    "shippingAddress": "123 Main Street, Springfield, IL 62701",
    "notes": "Please deliver in the morning",
    "items": [...],
    "createdAt": "2024-01-01T12:00:00",
    "updatedAt": "2024-01-01T12:00:00"
  }
]
```

---

### Get Order by ID

**Endpoint:** `GET /orders/{id}`

**Access:** Authenticated

**Path Parameters:**

- `id` (Long) - Order ID

**Request Example:**

```bash
curl http://localhost:8080/api/orders/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**

```json
{
  "id": 1,
  "status": "PENDING",
  "totalPrice": 2599.98,
  "shippingAddress": "123 Main Street, Springfield, IL 62701",
  "notes": "Please deliver in the morning",
  "items": [...],
  "createdAt": "2024-01-01T12:00:00",
  "updatedAt": "2024-01-01T12:00:00"
}
```

---

## Admin Endpoints

### Get All Products (Admin)

**Endpoint:** `GET /admin/products`

**Access:** Admin Only

**Request Example:**

```bash
curl http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**

```json
[...]  # Same as GET /products
```

---

### Create Product

**Endpoint:** `POST /admin/products`

**Access:** Admin Only

**Request Body:**

```json
{
  "sku": "PROD-NEW",
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "stock": 50,
  "category": "Electronics",
  "imageUrl": "https://example.com/product.jpg",
  "active": true
}
```

**Request Example:**

```bash
curl -X POST http://localhost:8080/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "sku": "PROD-NEW",
    "name": "New Product",
    "description": "Product description",
    "price": 99.99,
    "stock": 50,
    "category": "Electronics",
    "imageUrl": "https://example.com/product.jpg",
    "active": true
  }'
```

**Success Response (201):**

```json
{
  "id": 100,
  "sku": "PROD-NEW",
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "stock": 50,
  "category": "Electronics",
  "imageUrl": "https://example.com/product.jpg",
  "active": true,
  "createdAt": "2024-01-01T12:00:00",
  "updatedAt": "2024-01-01T12:00:00"
}
```

---

### Update Product

**Endpoint:** `PUT /admin/products/{id}`

**Access:** Admin Only

**Path Parameters:**

- `id` (Long) - Product ID

**Request Body:** (Same as Create, all fields optional)

**Request Example:**

```bash
curl -X PUT http://localhost:8080/api/admin/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "price": 1399.99,
    "stock": 20
  }'
```

**Success Response (200):**

```json
{
  "id": 1,
  "sku": "LAPTOP-001",
  "name": "Premium Laptop Pro",
  "price": 1399.99,
  "stock": 20,
  ...
}
```

---

### Delete Product

**Endpoint:** `DELETE /admin/products/{id}`

**Access:** Admin Only

**Path Parameters:**

- `id` (Long) - Product ID

**Request Example:**

```bash
curl -X DELETE http://localhost:8080/api/admin/products/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (204):** No content

---

### Get All Orders (Admin)

**Endpoint:** `GET /admin/orders`

**Access:** Admin Only

**Request Example:**

```bash
curl http://localhost:8080/api/admin/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**

```json
[...]  # All orders (different users)
```

---

### Get Orders by Status

**Endpoint:** `GET /admin/orders/status/{status}`

**Access:** Admin Only

**Path Parameters:**

- `status` (String) - Order status: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED

**Request Example:**

```bash
curl http://localhost:8080/api/admin/orders/status/PENDING \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**

```json
[...]  # Orders with PENDING status
```

---

### Update Order Status

**Endpoint:** `PUT /admin/orders/{id}/status`

**Access:** Admin Only

**Path Parameters:**

- `id` (Long) - Order ID

**Query Parameters:**

- `status` (String) - New status

**Request Example:**

```bash
curl -X PUT "http://localhost:8080/api/admin/orders/1/status?status=SHIPPED" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**

```json
{
  "id": 1,
  "status": "SHIPPED",
  ...
}
```

---

## Health Endpoint

### Check API Status

**Endpoint:** `GET /health`

**Access:** Public

**Request Example:**

```bash
curl http://localhost:8080/api/health
```

**Success Response (200):**

```json
{
  "status": "UP",
  "service": "E-Commerce Backend"
}
```

---

## Common Patterns

### Using Token in Requests

Always include the token from login/register:

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:8080/api/cart \
  -H "Authorization: Bearer $TOKEN"
```

### Handling Errors

Check HTTP status code and error message:

```bash
curl -i http://localhost:8080/api/products/999
# HTTP/1.1 404 Not Found
# {"timestamp": "...", "status": 404, "message": "Product not found with id: 999"}
```

### Pagination (Future)

When pagination is added, use:

```bash
curl "http://localhost:8080/api/products?page=1&size=20"
```

---

## Performance Tips

1. **Cache products** - They change infrequently
2. **Batch requests** - Load multiple products in one request
3. **Use pagination** - Don't load all orders at once
4. **Index searches** - Use SKU or category for quick lookups

---

## Rate Limiting (Future)

Future versions will include:

- 100 requests/minute for authenticated users
- 10 requests/minute for public endpoints
- 429 Too Many Requests response

---

## Versioning

Current API: `v1` (implied in endpoint paths)

Future versions will use: `/api/v2/products`, etc.

---

**Last Updated:** 2024-01-01  
**API Version:** 1.0.0
