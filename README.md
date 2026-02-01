# Items REST API - Practice Task 13

## Features
- Full REST API implementation for items resource
- All HTTP methods: GET, POST, PUT, PATCH, DELETE
- Proper HTTP status codes (200, 201, 400, 404, 500)
- Input validation and error handling
- MongoDB integration with auto-incrementing integer IDs
- Sample data on first run

## Prerequisites
- Node.js
- MongoDB (local or MongoDB Atlas)
- curl or Postman for testing

## Quick Start
```bash
# Install dependencies
npm install

# Development mode
npm start

# The server will run on http://localhost:3000
```

## API Endpoints

### Base URL: `http://localhost:3000/api/items`

### 1. GET All Items
```bash
curl http://localhost:3000/api/items
```

**With filtering:**
```bash
curl "http://localhost:3000/api/items?category=Electronics"
curl "http://localhost:3000/api/items?minPrice=10&maxPrice=50"
curl "http://localhost:3000/api/items?inStock=true"
```

### 2. GET Single Item by ID
```bash
curl http://localhost:3000/api/items/1
```

### 3. POST Create New Item
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"New Item","price":25.99,"category":"General"}'
```

### 4. PUT Update Item (Full Update)
```bash
curl -X PUT http://localhost:3000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Item","description":"Full update","price":29.99,"category":"Updated","inStock":true}'
```

### 5. PATCH Update Item (Partial Update)
```bash
curl -X PATCH http://localhost:3000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"price":35.50}'
```

### 6. DELETE Item
```bash
curl -X DELETE http://localhost:3000/api/items/1
```

## Complete CRUD Example

```bash
# 1. Create item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","price":19.99,"category":"Test"}'

# 2. Get all items (note the new ID)
curl http://localhost:3000/api/items

# 3. Get specific item
curl http://localhost:3000/api/items/6

# 4. Full update
curl -X PUT http://localhost:3000/api/items/6 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Test","description":"Updated via PUT","price":15.99,"category":"Testing","inStock":false}'

# 5. Partial update
curl -X PATCH http://localhost:3000/api/items/6 \
  -H "Content-Type: application/json" \
  -d '{"price":12.99}'

# 6. Delete item
curl -X DELETE http://localhost:3000/api/items/6
```

## Sample Data

On first run, the API automatically creates sample items:
1. Notebook - $5.99 - Stationery
2. Coffee Mug - $12.50 - Kitchen
3. Desk Lamp - $29.99 - Electronics
4. Wireless Mouse - $24.99 - Electronics