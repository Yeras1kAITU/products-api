# Products & Items REST API with API Protection
# Practice Task 14

## Features
- Complete REST API for `/api/products` and `/api/items` resources
- API key protection for write operations (POST, PUT, PATCH, DELETE)
- Proper HTTP status codes (200, 201, 401, 403, 404, 500)
- Input validation and error handling
- MongoDB integration with auto-incrementing integer IDs
- Environment-based configuration
- Sample data on first run
- Deployed on Railway

## Prerequisites
- Node.js
- MongoDB (local or MongoDB Atlas)
- curl or Postman for testing

## Live Deployment

Your API is deployed on Railway:
**Live URL:** `https://products-api-production-b5c4.up.railway.app`

## Quick Start

### Local Development:
```bash
# Install dependencies
npm install

# Edit .env file with your API_KEY and MongoDB URI

# Development mode
npm start

# The server will run on http://localhost:3000
```

### Railway Deployment:
Your application is automatically deployed to Railway. Changes pushed to the main branch trigger automatic deployments.

## API Key Protection

All write operations require an API key in the request header:

```bash
# Add this header to POST, PUT, PATCH, DELETE requests
-H "X-API-Key: your-api-key-here"
```

### Protected Endpoints:
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id
- POST /api/items
- PUT /api/items/:id
- PATCH /api/items/:id
- DELETE /api/items/:id

### Unprotected Endpoints (read-only):
- GET /api/products
- GET /api/products/:id
- GET /api/products/category/:category
- GET /api/items
- GET /api/items/:id

## Railway CRUD Operations

### Base URL: `https://products-api-production-b5c4.up.railway.app`

### Products API (`/api/products`)

#### 1. GET All Products (Public)
```bash
curl https://products-api-production-b5c4.up.railway.app/api/products
```

#### 2. GET Single Product by ID (Public)
```bash
curl https://products-api-production-b5c4.up.railway.app/api/products/1
```

#### 3. POST Create New Product (Protected)
```bash
curl -X POST https://products-api-production-b5c4.up.railway.app/api/products \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"name":"New Product","price":99.99,"category":"Electronics"}'
```

#### 4. PUT Update Product (Protected)
```bash
curl -X PUT https://products-api-production-b5c4.up.railway.app/api/products/1 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"name":"Updated Product","price":89.99,"category":"Electronics"}'
```

#### 5. DELETE Product (Protected)
```bash
curl -X DELETE https://products-api-production-b5c4.up.railway.app/api/products/1 \
  -H "X-API-Key: your-api-key-here"
```

### Items API (`/api/items`)

#### 1. GET All Items (Public)
```bash
curl https://products-api-production-b5c4.up.railway.app/api/items
```

#### 2. GET Single Item by ID (Public)
```bash
curl https://products-api-production-b5c4.up.railway.app/api/items/1
```

#### 3. POST Create New Item (Protected)
```bash
curl -X POST https://products-api-production-b5c4.up.railway.app/api/items \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"name":"New Item","price":25.99,"category":"General"}'
```

#### 4. PUT Update Item (Protected - Full Update)
```bash
curl -X PUT https://products-api-production-b5c4.up.railway.app/api/items/1 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"name":"Updated Item","description":"Full update","price":29.99,"category":"Updated","inStock":true}'
```

#### 5. PATCH Update Item (Protected - Partial Update)
```bash
curl -X PATCH https://products-api-production-b5c4.up.railway.app/api/items/1 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"price":35.50}'
```

#### 6. DELETE Item (Protected)
```bash
curl -X DELETE https://products-api-production-b5c4.up.railway.app/api/items/1 \
  -H "X-API-Key: your-api-key-here"
```

## Complete CRUD Examples on Railway

### Products CRUD Example:
```bash
# 1. CREATE product (Protected)
curl -X POST https://products-api-production-b5c4.up.railway.app/api/products \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"name":"Test Product","price":49.99,"category":"Test"}'

# 2. READ all products (Public)
curl https://products-api-production-b5c4.up.railway.app/api/products

# 3. READ single product (Public)
# Note: Use the ID from the create response
curl https://products-api-production-b5c4.up.railway.app/api/products/NEW_ID

# 4. UPDATE product (Protected)
curl -X PUT https://products-api-production-b5c4.up.railway.app/api/products/NEW_ID \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"price":59.99}'

# 5. DELETE product (Protected)
curl -X DELETE https://products-api-production-b5c4.up.railway.app/api/products/NEW_ID \
  -H "X-API-Key: your-api-key-here"
```

### Items CRUD Example:
```bash
# 1. CREATE item (Protected)
curl -X POST https://products-api-production-b5c4.up.railway.app/api/items \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"name":"Test Item","price":19.99,"category":"Test"}'

# 2. READ all items (Public)
curl https://products-api-production-b5c4.up.railway.app/api/items

# 3. READ single item (Public)
curl https://products-api-production-b5c4.up.railway.app/api/items/NEW_ID

# 4. UPDATE item - PUT (Protected)
curl -X PUT https://products-api-production-b5c4.up.railway.app/api/items/NEW_ID \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"name":"Updated Test","price":15.99,"category":"Updated"}'

# 5. UPDATE item - PATCH (Protected)
curl -X PATCH https://products-api-production-b5c4.up.railway.app/api/items/NEW_ID \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"price":12.99}'

# 6. DELETE item (Protected)
curl -X DELETE https://products-api-production-b5c4.up.railway.app/api/items/NEW_ID \
  -H "X-API-Key: your-api-key-here"
```

## Error Responses

### 401 Unauthorized (Missing API Key)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "API key is required"
}
```

### 403 Forbidden (Invalid API Key)
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Invalid API key"
}
```

## Sample Data

On first run, the API automatically creates sample data:

### Products:
1. Wireless Keyboard - $89.99 - Electronics
2. Gaming Mouse - $49.99 - Electronics
3. USB-C Hub - $29.99 - Accessories
4. Laptop Stand - $39.99 - Accessories
5. Monitor 27" - $249.99 - Electronics

### Items:
1. Notebook - $5.99 - Stationery
2. Coffee Mug - $12.50 - Kitchen
3. Desk Lamp - $29.99 - Electronics
4. Wireless Mouse - $24.99 - Electronics

## Testing on Railway

Test the protection mechanism:
```bash
# Try POST without API key (should return 401)
curl -X POST https://products-api-production-b5c4.up.railway.app/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test No Key","price":10,"category":"Test"}'

# Try with wrong API key (should return 403)
curl -X POST https://products-api-production-b5c4.up.railway.app/api/products \
  -H "Content-Type: application/json" \
  -H "X-API-Key: wrong-key-123" \
  -d '{"name":"Test Wrong Key","price":10,"category":"Test"}'
```