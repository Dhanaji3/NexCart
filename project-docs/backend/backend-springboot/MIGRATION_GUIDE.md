# Migration Guide: Express.js to Spring Boot

This guide helps you gradually migrate from the Express.js backend to the Spring Boot backend, running both in parallel during the transition.

## Overview

### Current Architecture (Express.js only)
```
Vue MFEs → Express API Server (port 3001)
            ↓
         PostgreSQL Database
```

### Parallel Architecture (Both running)
```
Vue MFEs → Express API Server (port 3001)
         → Spring Boot API (port 8080)
            ↓
         PostgreSQL Database
```

### Final Architecture (Spring Boot only)
```
Vue MFEs → Spring Boot API (port 8080)
            ↓
         PostgreSQL Database
```

## Phase 1: Setup & Testing (Week 1)

### Step 1.1: Start Spring Boot Backend

```bash
# Terminal 1: Express server
cd api-server
npm start

# Terminal 2: Spring Boot server
cd backend-springboot
mvn spring-boot:run
```

Both should be running without errors.

### Step 1.2: Test Spring Boot Endpoints

```bash
# Test health
curl http://localhost:8080/api/health

# Create sample data
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test123!@",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test123!@"
  }'

# Get products
curl http://localhost:8080/api/products
```

### Step 1.3: Verify Data Consistency

Ensure both backends can read the same database:

```bash
# Check Express can still access products
curl http://localhost:3001/api/products

# Check Spring Boot has same products
curl http://localhost:8080/api/products
```

## Phase 2: Gradual Endpoint Migration (Weeks 2-3)

### Strategy: Migrate by Feature

Migrate endpoints in this order:
1. **Products** (read-only first, then create/update/delete)
2. **Authentication** (non-critical, test user creation)
3. **Cart** (single user feature, easy to test)
4. **Orders** (critical feature, migrate last)

### Step 2.1: Migrate Products Endpoints

**Update `shared/src/composables/useHomeApi.ts`:**

```typescript
// Before
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// After - Dual API support
const EXPRESS_API = 'http://localhost:3001/api'
const SPRINGBOOT_API = 'http://localhost:8080/api'

// Use environment variable to switch
const API_BASE = import.meta.env.VITE_USE_SPRINGBOOT === 'true' 
  ? SPRINGBOOT_API 
  : EXPRESS_API

// Or use specific APIs per feature
export const getProducts = async () => {
  return axios.get(`${SPRINGBOOT_API}/products`)
}

export const getProductById = async (id: number) => {
  return axios.get(`${SPRINGBOOT_API}/products/${id}`)
}
```

**Update `.env` for testing:**

```
VITE_USE_SPRINGBOOT=false  # Keep Express
```

Then gradually change to:

```
VITE_USE_SPRINGBOOT=true   # Use Spring Boot
```

### Step 2.2: Test Products Migration

1. Open the products page in your browser
2. Verify products load from Spring Boot
3. Check no errors in console
4. Test product details, search, categories
5. Keep Express running as fallback

### Step 2.3: Migrate Authentication

**Update `shared/src/composables/http.ts`:**

```typescript
// Add Spring Boot API client
const springBootApi = axios.create({
  baseURL: 'http://localhost:8080/api'
})

// Keep Express as backup
const expressApi = axios.create({
  baseURL: 'http://localhost:3001/api'
})

// Auth with Spring Boot
export const login = async (email: string, password: string) => {
  const response = await springBootApi.post('/auth/login', {
    email,
    password
  })
  return response.data
}

export const register = async (data: any) => {
  const response = await springBootApi.post('/auth/register', data)
  return response.data
}
```

**Test:**
1. Register new user on Spring Boot
2. Login and verify token works
3. Add product to cart (should create cart in Spring Boot)

### Step 2.4: Migrate Cart

```typescript
export const getCart = async (token: string) => {
  return springBootApi.get('/cart', {
    headers: { Authorization: `Bearer ${token}` }
  })
}

export const addToCart = async (productId: number, quantity: number, token: string) => {
  return springBootApi.post(`/cart/add/${productId}?quantity=${quantity}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  })
}
```

### Step 2.5: Migrate Orders

```typescript
export const createOrder = async (data: any, token: string) => {
  return springBootApi.post('/orders', data, {
    headers: { Authorization: `Bearer ${token}` }
  })
}

export const getOrders = async (token: string) => {
  return springBootApi.get('/orders', {
    headers: { Authorization: `Bearer ${token}` }
  })
}
```

## Phase 3: Dual-Read Pattern (Week 3-4)

For critical data like orders and cart, implement dual-read:

```typescript
// Try Spring Boot first, fallback to Express
export const getCart = async (token: string) => {
  try {
    return await springBootApi.get('/cart', {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (error) {
    console.warn('Spring Boot cart failed, trying Express:', error)
    return await expressApi.get('/cart', {
      headers: { Authorization: `Bearer ${token}` }
    })
  }
}

// Log which API is used (for monitoring)
export const getCart = async (token: string) => {
  const startTime = Date.now()
  try {
    const response = await springBootApi.get('/cart', {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log(`✓ Spring Boot cart loaded in ${Date.now() - startTime}ms`)
    return response
  } catch (error) {
    console.warn(`✗ Spring Boot cart failed, fallback to Express`)
    const response = await expressApi.get('/cart', {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log(`✓ Express cart loaded in ${Date.now() - startTime}ms`)
    return response
  }
}
```

## Phase 4: Data Synchronization (Week 4)

If you need to sync data created on either backend:

```typescript
// Create cart entry in both backends
export const addToCart = async (productId: number, quantity: number, token: string) => {
  // Primary: Spring Boot
  const sbResponse = await springBootApi.post(
    `/cart/add/${productId}?quantity=${quantity}`, 
    {}, 
    { headers: { Authorization: `Bearer ${token}` } }
  )
  
  // Secondary: Express (for backup)
  try {
    await expressApi.post(
      `/cart/add/${productId}`, 
      { quantity }, 
      { headers: { Authorization: `Bearer ${token}` } }
    )
  } catch (err) {
    console.warn('Express sync failed, but Spring Boot succeeded')
  }
  
  return sbResponse
}
```

## Phase 5: Complete Migration (Week 5)

### Step 5.1: Update All Composables

Update all files in `shared/src/composables/`:
- `useHomeApi.ts` - Use Spring Boot
- `useAdminOrdersApi.ts` - Use Spring Boot
- `useAdminProductsApi.ts` - Use Spring Boot
- `useAdminStatsApi.ts` - Use Spring Boot

### Step 5.2: Remove Express API References

```typescript
// All composables should point to Spring Boot
const API_BASE = 'http://localhost:8080/api'

// Or use environment variable for flexibility
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
```

### Step 5.3: Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Browse products
- [ ] Add/remove items from cart
- [ ] Checkout and create order
- [ ] View order history
- [ ] Admin: manage products
- [ ] Admin: manage orders
- [ ] Admin: view statistics
- [ ] Wishlist functionality
- [ ] Mobile responsive
- [ ] Error handling
- [ ] Loading states
- [ ] Token refresh (if implemented)

## Phase 6: Cleanup (Week 5-6)

### Step 6.1: Keep Express Running as Backup

Don't immediately remove Express.js. Keep it running for:
- Fallback if Spring Boot has issues
- Historical data queries
- Reporting

### Step 6.2: Monitor Spring Boot

```bash
# Check Spring Boot logs for errors
tail -f logs/application.log

# Monitor database
watch -n 1 'psql -U postgres -d ecommerce_db -c "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM products; SELECT COUNT(*) FROM orders;"'
```

### Step 6.3: Gradual Express Shutdown

Week 6:
- Keep Express running but mark as "legacy"
- Monitor for any Express API calls
- Verify all data is safe

Week 7:
- Backup Express database
- Stop Express process
- Update documentation

## Handling Issues During Migration

### Issue: Cart data not syncing

**Solution:** Ensure both backends use same database connection:

```yaml
# Both should point to same PostgreSQL
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ecommerce_db
```

### Issue: Different JWT tokens

**Solution:** Use same JWT secret in both:

```yaml
# Spring Boot
jwt:
  secret: your-secret-key-here

# Express .env
JWT_SECRET=your-secret-key-here
```

### Issue: CORS errors after switching

**Solution:** Ensure Spring Boot CORS is configured:

```yaml
spring:
  web:
    cors:
      allowed-origins: "http://localhost:5000,..."
```

### Issue: Authentication failing

**Solution:** Verify token format is consistent:

```typescript
// Both should use "Bearer <token>"
headers: { Authorization: `Bearer ${token}` }
```

## Migration Rollback Plan

If Spring Boot has issues, quickly rollback:

```typescript
// revert-to-express.ts
const API_BASE = 'http://localhost:3001/api'  // Use Express again
```

Keep Express running throughout migration so rollback is instant.

## Success Criteria

Migration is complete when:

1. ✓ All endpoints tested on Spring Boot
2. ✓ Data is consistent between both backends
3. ✓ No errors in browser console
4. ✓ All e2e tests pass
5. ✓ Performance is equal or better
6. ✓ Express API calls reduced to 0
7. ✓ Express running for 2+ weeks without issues
8. ✓ Express can be safely removed

## Performance Comparison

Monitor performance during migration:

```typescript
const measurePerformance = async () => {
  console.time('Express API')
  await expressApi.get('/products')
  console.timeEnd('Express API')
  
  console.time('Spring Boot API')
  await springBootApi.get('/products')
  console.timeEnd('Spring Boot API')
}
```

Expected results:
- Spring Boot: 50-100ms (with JPA overhead initially)
- Express: 30-50ms
- After optimization: Spring Boot can be faster

## Next Steps After Migration

1. Add Spring Boot monitoring (Actuator)
2. Implement caching layer (Redis)
3. Add API documentation (Swagger/OpenAPI)
4. Performance optimization
5. Add comprehensive test coverage
6. Set up CI/CD pipeline for Spring Boot

## References

- [Spring Boot Best Practices](https://spring.io/guides)
- [Data Migration Patterns](https://martinfowler.com/articles/patterns-of-distributed-systems/)
- [Zero-Downtime Deployments](https://www.nginx.com/blog/zero-downtime-deployment/)

---

**Good luck with your migration!** 🚀
