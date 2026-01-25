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

Here's how to use your deployed API:

## **Your API is LIVE at:**
   **https://products-api-production-b5c4.up.railway.app**

## **Quick Start:**

### **1. View API Documentation**
Open in browser: https://products-api-production-b5c4.up.railway.app/

### **2. Test Basic Endpoints:**

#### **Get all products:**
```bash
curl https://products-api-production-b5c4.up.railway.app/api/products
```

#### **Get specific product (ID 1):**
```bash
curl https://products-api-production-b5c4.up.railway.app/api/products/1
```

#### **Create new product:**
```bash
curl -X POST https://products-api-production-b5c4.up.railway.app/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"New Product","price":99.99,"category":"Electronics"}'
```

## **Complete Usage Guide:**

### **CREATE (POST)**
**Create a new product:**
```bash
curl -X POST https://products-api-production-b5c4.up.railway.app/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Mouse",
    "price": 29.99,
    "category": "Electronics",
    "description": "Bluetooth mouse with long battery life",
    "inStock": true
  }'
```

### **READ (GET)**
**Get all products with filters:**
```bash
# Get all
curl https://products-api-production-b5c4.up.railway.app/api/products

# Filter by category
curl "https://products-api-production-b5c4.up.railway.app/api/products?category=Electronics"

# Price range
curl "https://products-api-production-b5c4.up.railway.app/api/products?minPrice=50&maxPrice=200"

# In stock only
curl "https://products-api-production-b5c4.up.railway.app/api/products?inStock=true"

# Sort by price (descending)
curl "https://products-api-production-b5c4.up.railway.app/api/products?sortBy=price&sortOrder=desc"

# Pagination (page 1, 5 items per page)
curl "https://products-api-production-b5c4.up.railway.app/api/products?page=1&limit=5"
```

**Get single product:**
```bash
curl https://products-api-production-b5c4.up.railway.app/api/products/1
```

**Get by category:**
```bash
curl https://products-api-production-b5c4.up.railway.app/api/products/category/Electronics
```

### **UPDATE (PUT)**
**Update product details:**
```bash
curl -X PUT https://products-api-production-b5c4.up.railway.app/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 89.99, "name": "Updated Product Name"}'
```

### **DELETE**
**Delete a product:**
```bash
curl -X DELETE https://products-api-production-b5c4.up.railway.app/api/products/1
```

## **Quick Test Commands:**

**Test the full CRUD cycle:**
```bash
# 1. Create
curl -X POST https://products-api-production-b5c4.up.railway.app/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":19.99,"category":"Test"}'

# 2. Read (get the ID from above response)
curl https://products-api-production-b5c4.up.railway.app/api/products/6

# 3. Update
curl -X PUT https://products-api-production-b5c4.up.railway.app/api/products/6 \
  -H "Content-Type: application/json" \
  -d '{"price":15.99}'

# 4. Delete
curl -X DELETE https://products-api-production-b5c4.up.railway.app/api/products/6
```

## **💡 Tips:**

1. **Always use HTTPS** (not HTTP)
2. **Set Content-Type: application/json** for POST/PUT requests
3. **IDs are integers** (1, 2, 3... not MongoDB ObjectId)
4. **Check response status codes:**
    - 200: Success
    - 201: Created
    - 400: Bad request
    - 404: Not found
    - 500: Server error

## **Test in Browser:**
1. Open: https://products-api-production-b5c4.up.railway.app/
2. You'll see interactive documentation
3. Click links to test GET endpoints
4. Use curl or Postman for POST/PUT/DELETE

Your API is ready to use!

```bash
curl -X POST https://products-api-production-b5c4.up.railway.app/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"My First Product","price":9.99,"category":"Testing"}'
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
