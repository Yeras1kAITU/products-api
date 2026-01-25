# Products API - Practice task 9

## Features
- Full CRUD operations (Create, Read, Update, Delete)
- Integer IDs instead of MongoDB ObjectId
- Filtering, sorting, and pagination
- Input validation and proper HTTP status codes
- Auto-incrementing integer IDs
- Sample data on first run

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- curl or Postman for testing

## Quick Start
```bash
# Development mode
npm start

# The server will run on http://localhost:3000
```

### 4. Access the API
Open your browser: [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Base URL: `http://localhost:3000`

## CRUD Operations Examples

### 1. GET Home Page
```bash
curl http://localhost:3000/
```

### 2. GET All Products
**Basic:**
```bash
curl "http://localhost:3000/api/products"
```

**With filtering (by category):**
```bash
curl "http://localhost:3000/api/products?category=Electronics"
```

**With price range:**
```bash
curl "http://localhost:3000/api/products?minPrice=50&maxPrice=200"
```

**With stock filter:**
```bash
curl "http://localhost:3000/api/products?inStock=true"
```

**With sorting:**
```bash
curl "http://localhost:3000/api/products?sortBy=price&sortOrder=desc"
```

**With field projection:**
```bash
curl "http://localhost:3000/api/products?fields=id,name,price"
```

**With pagination:**
```bash
curl "http://localhost:3000/api/products?page=1&limit=2"
```

**Combined example:**
```bash
curl "http://localhost:3000/api/products?category=Electronics&minPrice=50&sortBy=price&sortOrder=desc&page=1&limit=3&fields=id,name,price"
```

### 3. GET Single Product by ID
```bash
curl "http://localhost:3000/api/products/1"
```

### 4. POST Create New Product
**Simple product:**
```bash
curl -X POST "http://localhost:3000/api/products" -H "Content-Type: application/json" -d "{\"name\":\"New Laptop\",\"price\":999.99,\"category\":\"Electronics\"}"
```

**Product with more details:**
```bash
curl -X POST "http://localhost:3000/api/products" -H "Content-Type: application/json" -d "{\"name\":\"Wireless Headphones\",\"price\":149.99,\"category\":\"Audio\",\"description\":\"Noise cancelling headphones\",\"inStock\":true}"
```

### 5. PUT Update Product
**Update price only:**
```bash
curl -X PUT "http://localhost:3000/api/products/1" -H "Content-Type: application/json" -d "{\"price\":79.99}"
```

**Update multiple fields:**
```bash
curl -X PUT "http://localhost:3000/api/products/2" -H "Content-Type: application/json" -d "{\"name\":\"Updated Mouse\",\"price\":59.99,\"category\":\"Gaming Accessories\"}"
```

### 6. DELETE Product
```bash
curl -X DELETE "http://localhost:3000/api/products/1"
```

## Advanced Search Endpoints

### Search by Category
```bash
curl "http://localhost:3000/api/products/category/Electronics"
```

**With filters:**
```bash
curl "http://localhost:3000/api/products/category/Electronics?minPrice=100&maxPrice=300&inStock=true"
```

## Error Responses

### 400 Bad Request (Invalid Input)
```bash
# Missing required field
curl -X POST "http://localhost:3000/api/products" -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"price\":100}"
```

### 404 Not Found (Product Not Found)
```bash
curl "http://localhost:3000/api/products/999"
```

### 409 Conflict (Duplicate Name)
```bash
curl -X POST "http://localhost:3000/api/products" -H "Content-Type: application/json" -d "{\"name\":\"Wireless Keyboard\",\"price\":100,\"category\":\"Electronics\"}"
```

### 500 Internal Server Error
Appears when there's a database or server issue.

## Testing Script

Create a test script `test-api.sh`:

```bash
#!/bin/bash
echo "1. Getting all products:"
curl -s "http://localhost:3000/api/products" | jq '.count'

echo "2. Creating new product:"
curl -s -X POST "http://localhost:3000/api/products" -H "Content-Type: application/json" -d "{\"name\":\"Test Product\",\"price\":49.99,\"category\":\"Test\"}" | jq '.product.id'

echo "3. Getting the new product:"
NEW_ID=$(curl -s "http://localhost:3000/api/products" | jq '.products[-1].id')
curl -s "http://localhost:3000/api/products/$NEW_ID" | jq '.name'

echo "4. Updating the product:"
curl -s -X PUT "http://localhost:3000/api/products/$NEW_ID" -H "Content-Type: application/json" -d "{\"price\":59.99}" | jq '.message'

echo "5. Deleting the product:"
curl -s -X DELETE "http://localhost:3000/api/products/$NEW_ID" | jq '.message'

echo "Test completed!"
```

## Sample Data

On first run, the API automatically creates these sample products:
1. Wireless Keyboard - $89.99 - Electronics
2. Gaming Mouse - $49.99 - Electronics
3. USB-C Hub - $29.99 - Accessories
4. Laptop Stand - $39.99 - Accessories
5. Monitor 27" - $249.99 - Electronics

## API Usage Examples for Common Tasks

### 1. Bulk Create Products
```bash
for i in {1..3}; do curl -X POST "http://localhost:3000/api/products" -H "Content-Type: application/json" -d "{\"name\":\"Product $i\",\"price\":$(($i*10)),\"category\":\"Category $((($i%3)+1))\"}"; echo; done
```

### 2. Get Products Sorted by Price (High to Low)
```bash
curl "http://localhost:3000/api/products?sortBy=price&sortOrder=desc"
```

### 3. Get Only Product Names and Prices
```bash
curl "http://localhost:3000/api/products?fields=id,name,price"
```

### 4. Search Electronics in Stock Under $100
```bash
curl "http://localhost:3000/api/products?category=Electronics&maxPrice=100&inStock=true"
```
