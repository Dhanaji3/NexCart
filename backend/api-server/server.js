import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3001
const JWT_SECRET = 'vueshop-secret-key-change-in-production'

app.use(cors())
app.use(express.json())

// --- Database helpers ---
function readDB() {
  const raw = readFileSync(join(__dirname, 'db.json'), 'utf-8')
  return JSON.parse(raw)
}

function writeDB(data) {
  writeFileSync(join(__dirname, 'db.json'), JSON.stringify(data, null, 2))
}

// --- Auth middleware ---
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

// ========================
// AUTH ENDPOINTS
// ========================

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }

  const db = readDB()
  const user = db.users.find(u => u.email === email && u.password === password)

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  const { password: _, ...userWithoutPassword } = user
  res.json({ user: userWithoutPassword, token })
})

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password required' })
  }

  const db = readDB()
  if (db.users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'Email already registered' })
  }

  const newUser = {
    id: db.users.length + 1,
    name,
    email,
    password,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    role: 'customer'
  }

  db.users.push(newUser)
  writeDB(db)

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  const { password: _, ...userWithoutPassword } = newUser
  res.status(201).json({ user: userWithoutPassword, token })
})

// GET /api/auth/me
app.get('/api/auth/me', authenticate, (req, res) => {
  const db = readDB()
  const user = db.users.find(u => u.id === req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })

  const { password: _, ...userWithoutPassword } = user
  res.json(userWithoutPassword)
})

// PUT /api/auth/profile
app.put('/api/auth/profile', authenticate, (req, res) => {
  const db = readDB()
  const userIndex = db.users.findIndex(u => u.id === req.user.id)
  if (userIndex === -1) return res.status(404).json({ message: 'User not found' })

  const { name, email, avatar } = req.body
  if (name) db.users[userIndex].name = name
  if (email) db.users[userIndex].email = email
  if (avatar) db.users[userIndex].avatar = avatar

  writeDB(db)

  const { password: _, ...userWithoutPassword } = db.users[userIndex]
  res.json(userWithoutPassword)
})

// ========================
// PRODUCTS ENDPOINTS
// ========================

// GET /api/products
app.get('/api/products', (req, res) => {
  const db = readDB()
  let result = [...db.products]

  // Search
  if (req.query.search) {
    const q = req.query.search.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    )
  }

  // Filter by category
  if (req.query.category) {
    result = result.filter(p => p.category === req.query.category)
  }

  // Filter by inStock
  if (req.query.inStock === 'true') {
    result = result.filter(p => p.inStock)
  }

  // Sort
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
    }
  }

  // Pagination
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 50
  const start = (page - 1) * limit
  const paginatedResult = result.slice(start, start + limit)

  res.json({
    products: paginatedResult,
    total: result.length,
    page,
    totalPages: Math.ceil(result.length / limit)
  })
})

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const db = readDB()
  const product = db.products.find(p => p.id === parseInt(req.params.id))
  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json(product)
})

// POST /api/products (admin only)
app.post('/api/products', authenticate, adminOnly, (req, res) => {
  const db = readDB()
  const newProduct = {
    id: Math.max(...db.products.map(p => p.id)) + 1,
    ...req.body
  }
  db.products.push(newProduct)
  writeDB(db)
  res.status(201).json(newProduct)
})

// PUT /api/products/:id (admin only)
app.put('/api/products/:id', authenticate, adminOnly, (req, res) => {
  const db = readDB()
  const index = db.products.findIndex(p => p.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ message: 'Product not found' })

  db.products[index] = { ...db.products[index], ...req.body, id: db.products[index].id }
  writeDB(db)
  res.json(db.products[index])
})

// DELETE /api/products/:id (admin only)
app.delete('/api/products/:id', authenticate, adminOnly, (req, res) => {
  const db = readDB()
  const index = db.products.findIndex(p => p.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ message: 'Product not found' })

  db.products.splice(index, 1)
  writeDB(db)
  res.status(204).send()
})

// ========================
// CATEGORIES ENDPOINTS
// ========================

// GET /api/categories
app.get('/api/categories', (req, res) => {
  const db = readDB()
  res.json(db.categories)
})

// ========================
// CART ENDPOINTS
// ========================

// GET /api/cart
app.get('/api/cart', authenticate, (req, res) => {
  const db = readDB()
  const userCart = db.cart.filter(item => item.userId === req.user.id)

  // Populate product details
  const cartWithProducts = userCart.map(item => {
    const product = db.products.find(p => p.id === item.productId)
    return { ...item, product }
  }).filter(item => item.product)

  res.json(cartWithProducts)
})

// POST /api/cart
app.post('/api/cart', authenticate, (req, res) => {
  const { productId, quantity = 1 } = req.body
  const db = readDB()

  const product = db.products.find(p => p.id === productId)
  if (!product) return res.status(404).json({ message: 'Product not found' })

  const existingIndex = db.cart.findIndex(
    item => item.userId === req.user.id && item.productId === productId
  )

  if (existingIndex !== -1) {
    db.cart[existingIndex].quantity += quantity
  } else {
    db.cart.push({ id: uuidv4(), userId: req.user.id, productId, quantity })
  }

  writeDB(db)

  // Return updated cart
  const userCart = db.cart.filter(item => item.userId === req.user.id)
  const cartWithProducts = userCart.map(item => {
    const p = db.products.find(prod => prod.id === item.productId)
    return { ...item, product: p }
  }).filter(item => item.product)

  res.json(cartWithProducts)
})

// PUT /api/cart/:productId
app.put('/api/cart/:productId', authenticate, (req, res) => {
  const { quantity } = req.body
  const db = readDB()
  const productId = parseInt(req.params.productId)

  const index = db.cart.findIndex(
    item => item.userId === req.user.id && item.productId === productId
  )

  if (index === -1) return res.status(404).json({ message: 'Item not in cart' })

  if (quantity <= 0) {
    db.cart.splice(index, 1)
  } else {
    db.cart[index].quantity = quantity
  }

  writeDB(db)

  const userCart = db.cart.filter(item => item.userId === req.user.id)
  const cartWithProducts = userCart.map(item => {
    const p = db.products.find(prod => prod.id === item.productId)
    return { ...item, product: p }
  }).filter(item => item.product)

  res.json(cartWithProducts)
})

// DELETE /api/cart/:productId
app.delete('/api/cart/:productId', authenticate, (req, res) => {
  const db = readDB()
  const productId = parseInt(req.params.productId)

  db.cart = db.cart.filter(
    item => !(item.userId === req.user.id && item.productId === productId)
  )
  writeDB(db)
  res.status(204).send()
})

// DELETE /api/cart (clear all)
app.delete('/api/cart', authenticate, (req, res) => {
  const db = readDB()
  db.cart = db.cart.filter(item => item.userId !== req.user.id)
  writeDB(db)
  res.status(204).send()
})

// ========================
// WISHLIST ENDPOINTS
// ========================

// GET /api/wishlist
app.get('/api/wishlist', authenticate, (req, res) => {
  const db = readDB()
  const userWishlist = db.wishlist.filter(item => item.userId === req.user.id)
  const products = userWishlist.map(item => {
    return db.products.find(p => p.id === item.productId)
  }).filter(Boolean)
  res.json(products)
})

// POST /api/wishlist
app.post('/api/wishlist', authenticate, (req, res) => {
  const { productId } = req.body
  const db = readDB()

  const exists = db.wishlist.find(
    item => item.userId === req.user.id && item.productId === productId
  )
  if (exists) return res.status(409).json({ message: 'Already in wishlist' })

  db.wishlist.push({ id: uuidv4(), userId: req.user.id, productId })
  writeDB(db)

  const userWishlist = db.wishlist.filter(item => item.userId === req.user.id)
  const products = userWishlist.map(item => {
    return db.products.find(p => p.id === item.productId)
  }).filter(Boolean)
  res.json(products)
})

// DELETE /api/wishlist/:productId
app.delete('/api/wishlist/:productId', authenticate, (req, res) => {
  const db = readDB()
  const productId = parseInt(req.params.productId)

  db.wishlist = db.wishlist.filter(
    item => !(item.userId === req.user.id && item.productId === productId)
  )
  writeDB(db)
  res.status(204).send()
})

// ========================
// ORDERS ENDPOINTS
// ========================

// GET /api/orders
app.get('/api/orders', authenticate, (req, res) => {
  const db = readDB()
  let orders

  if (req.user.role === 'admin') {
    orders = db.orders
  } else {
    orders = db.orders.filter(o => o.userId === req.user.id)
  }

  // Populate product details in order items
  orders = orders.map(order => ({
    ...order,
    items: order.items.map(item => {
      const product = db.products.find(p => p.id === item.productId)
      return { product, quantity: item.quantity, price: item.price }
    })
  }))

  // Filter by status (admin)
  if (req.query.status) {
    orders = orders.filter(o => o.status === req.query.status)
  }

  res.json(orders)
})

// GET /api/orders/:id
app.get('/api/orders/:id', authenticate, (req, res) => {
  const db = readDB()
  const order = db.orders.find(o => o.id === req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  // Non-admin can only see own orders
  if (req.user.role !== 'admin' && order.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' })
  }

  // Populate products
  const populatedOrder = {
    ...order,
    items: order.items.map(item => {
      const product = db.products.find(p => p.id === item.productId)
      return { product, quantity: item.quantity, price: item.price }
    })
  }

  res.json(populatedOrder)
})

// POST /api/orders
app.post('/api/orders', authenticate, (req, res) => {
  const { shippingAddress, paymentMethod, items: requestItems } = req.body
  const db = readDB()

  // Get user's cart from server OR use items sent in request body
  let userCart = db.cart.filter(item => item.userId === req.user.id)

  // If server cart is empty but client sent items, sync them first
  if (userCart.length === 0 && requestItems && requestItems.length > 0) {
    for (const item of requestItems) {
      const productId = item.productId || (item.product && item.product.id)
      const quantity = item.quantity || 1
      if (productId) {
        db.cart.push({ id: uuidv4(), userId: req.user.id, productId, quantity })
      }
    }
    writeDB(db)
    userCart = db.cart.filter(item => item.userId === req.user.id)
  }

  if (userCart.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' })
  }

  // Build order items with current prices
  const orderItems = userCart.map(item => {
    const product = db.products.find(p => p.id === item.productId)
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: product ? product.price : 0
    }
  })

  const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const newOrder = {
    id: `ORD-${new Date().getFullYear()}-${String(db.orders.length + 1).padStart(3, '0')}`,
    userId: req.user.id,
    items: orderItems,
    total: Math.round(total * 100) / 100,
    status: 'pending',
    createdAt: new Date().toISOString(),
    shippingAddress,
    paymentMethod,
    trackingNumber: null
  }

  db.orders.push(newOrder)

  // Clear user's cart
  db.cart = db.cart.filter(item => item.userId !== req.user.id)
  writeDB(db)

  // Return populated order
  const populatedOrder = {
    ...newOrder,
    items: newOrder.items.map(item => {
      const product = db.products.find(p => p.id === item.productId)
      return { product, quantity: item.quantity, price: item.price }
    })
  }

  res.status(201).json(populatedOrder)
})

// PUT /api/orders/:id/status (admin only)
app.put('/api/orders/:id/status', authenticate, adminOnly, (req, res) => {
  const { status, trackingNumber } = req.body
  const db = readDB()

  const index = db.orders.findIndex(o => o.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: 'Order not found' })

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' })
  }

  db.orders[index].status = status
  if (trackingNumber) db.orders[index].trackingNumber = trackingNumber

  writeDB(db)

  const order = db.orders[index]
  const populatedOrder = {
    ...order,
    items: order.items.map(item => {
      const product = db.products.find(p => p.id === item.productId)
      return { product, quantity: item.quantity, price: item.price }
    })
  }

  res.json(populatedOrder)
})

// ========================
// ADMIN STATS
// ========================

// GET /api/admin/stats
app.get('/api/admin/stats', authenticate, adminOnly, (req, res) => {
  const db = readDB()

  const totalRevenue = db.orders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = db.orders.length
  const totalProducts = db.products.length
  const totalUsers = db.users.filter(u => u.role === 'customer').length

  const ordersByStatus = db.orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  res.json({
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    totalProducts,
    totalUsers,
    ordersByStatus,
    recentOrders: db.orders.slice(-5).reverse().map(order => ({
      ...order,
      items: order.items.map(item => {
        const product = db.products.find(p => p.id === item.productId)
        return { product, quantity: item.quantity, price: item.price }
      })
    }))
  })
})

// ========================
// START SERVER
// ========================

app.listen(PORT, () => {
  console.log(`🚀 NexCart API Server running at http://localhost:${PORT}`)
  console.log(`📚 Endpoints:`)
  console.log(`   POST /api/auth/login`)
  console.log(`   POST /api/auth/register`)
  console.log(`   GET  /api/auth/me`)
  console.log(`   GET  /api/products`)
  console.log(`   GET  /api/products/:id`)
  console.log(`   GET  /api/categories`)
  console.log(`   GET  /api/cart`)
  console.log(`   POST /api/cart`)
  console.log(`   GET  /api/orders`)
  console.log(`   POST /api/orders`)
  console.log(`   GET  /api/admin/stats`)
})
