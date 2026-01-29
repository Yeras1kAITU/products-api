const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shop';
const DB_NAME = process.env.DB_NAME || 'shop';
const COLLECTION_NAME = 'products';

console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', PORT);
console.log('Database name:', DB_NAME);
console.log('MongoDB URI available:', !!process.env.MONGO_URI);

if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

app.use(express.json());

let db;
let productsCollection;
let counterCollection;

async function connectToDatabase() {
    try {
        console.log('Attempting to connect to MongoDB...');

        const maskedUri = MONGO_URI
            ? MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@')
            : 'Not set';
        console.log(`Using URI: ${maskedUri}`);
        console.log(`Database: ${DB_NAME}`);

        const connectionOptions = {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority'
        };

        console.log('Connecting with options:', {
            serverSelectionTimeoutMS: connectionOptions.serverSelectionTimeoutMS,
            connectTimeoutMS: connectionOptions.connectTimeoutMS
        });

        const client = await MongoClient.connect(MONGO_URI, connectionOptions);

        await client.db('admin').command({ ping: 1 });
        console.log('MongoDB ping successful');

        db = client.db(DB_NAME);
        productsCollection = db.collection(COLLECTION_NAME);
        counterCollection = db.collection('counters');

        console.log(`Connected to MongoDB database: ${DB_NAME}`);
        console.log(`Collection ready: ${COLLECTION_NAME}`);

        console.log('Creating indexes...');
        await productsCollection.createIndex({ id: 1 }, { unique: true });
        await productsCollection.createIndex({ name: 1 });
        console.log('Indexes created');

        await counterCollection.updateOne(
            { _id: 'productId' },
            { $setOnInsert: { sequence_value: 1 } },
            { upsert: true }
        );

        console.log('Counter initialized');

        if (process.env.NODE_ENV === 'development') {
            await addSampleData();
        } else {
            console.log('Production mode: Skipping sample data');
        }

        return client;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        console.error('Error details:', {
            name: error.name,
            code: error.code,
            errorLabels: error.errorLabels
        });

        if (error.name === 'MongoServerSelectionError') {
            console.error('\nConnection troubleshooting:');
            console.error('1. Check if MONGO_URI is set in Railway variables');
            console.error('2. Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0');
            console.error('3. Check database username/password');
            console.error('4. Ensure cluster is fully created (takes 1-3 minutes)');
        }

        console.error('\nCurrent environment:');
        console.error('NODE_ENV:', process.env.NODE_ENV);
        console.error('PORT:', process.env.PORT);
        console.error('MONGO_URI set:', !!process.env.MONGO_URI);

        process.exit(1);
    }
}

async function getNextSequence() {
    try {
        const result = await counterCollection.findOneAndUpdate(
            { _id: 'productId' },
            { $inc: { sequence_value: 1 } },
            { returnDocument: 'after' }
        );

        return result.value.sequence_value;
    } catch (error) {
        console.error('Error getting next sequence:', error);
        throw error;
    }
}

async function addSampleData() {
    try {
        const count = await productsCollection.countDocuments();

        if (count === 0) {
            console.log('No products found. Adding sample data...');

            const sampleProducts = [
                {
                    id: 1,
                    name: "Wireless Keyboard",
                    price: 89.99,
                    category: "Electronics",
                    description: "Mechanical wireless keyboard with RGB lighting",
                    inStock: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 2,
                    name: "Gaming Mouse",
                    price: 49.99,
                    category: "Electronics",
                    description: "High-precision gaming mouse with programmable buttons",
                    inStock: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 3,
                    name: "USB-C Hub",
                    price: 29.99,
                    category: "Accessories",
                    description: "7-in-1 USB-C hub with HDMI and Ethernet",
                    inStock: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 4,
                    name: "Laptop Stand",
                    price: 39.99,
                    category: "Accessories",
                    description: "Adjustable aluminum laptop stand for ergonomic use",
                    inStock: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 5,
                    name: "Monitor 27\"",
                    price: 249.99,
                    category: "Electronics",
                    description: "27-inch 4K UHD monitor with IPS panel",
                    inStock: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            await counterCollection.updateOne(
                { _id: 'productId' },
                { $set: { sequence_value: 6 } }
            );

            const result = await productsCollection.insertMany(sampleProducts);
            console.log(`${result.insertedCount} sample products added successfully.`);
        } else {
            console.log(`Found ${count} existing products in the database.`);
        }
    } catch (error) {
        console.error('Error adding sample data:', error);
    }
}

// Root endpoint
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Products API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            ul { list-style-type: none; padding: 0; }
            li { margin: 10px 0; }
            a { 
                display: inline-block; 
                padding: 10px 20px; 
                background: #007bff; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px; 
                transition: background 0.3s; 
            }
            a:hover { background: #0056b3; }
            code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
            .id-example { background: #e9ecef; padding: 10px; border-radius: 5px; margin: 10px 0; }
            .environment { 
                background: #28a745; 
                color: white; 
                padding: 5px 10px; 
                border-radius: 3px; 
                display: inline-block; 
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="environment">Environment: ${process.env.NODE_ENV || 'development'}</div>
        <h1>Products API with Integer IDs</h1>
        <p>All products use integer IDs instead of MongoDB ObjectId</p>
        
        <p>Available endpoints:</p>
        <ul>
            <li><a href="/api/products">GET /api/products</a> - Get all products</li>
            <li><a href="#" onclick="alert('Use POST request with JSON body to create product')">POST /api/products</a> - Create new product</li>
            <li><a href="/api/products/1">GET /api/products/1</a> - Get product by ID (integer)</li>
            <li><a href="/api/products/category/Electronics">GET /api/products/category/Electronics</a> - Get products by category</li>
            <li><a href="#" onclick="alert('Use PUT request with JSON body to update product')">PUT /api/products/:id</a> - Update product</li>
            <li><a href="#" onclick="alert('Use DELETE request to remove product')">DELETE /api/products/:id</a> - Delete product</li>
        </ul>
        
        <p>Example POST request body:</p>
        <code>
        {
            "name": "New Product",
            "price": 120,
            "category": "Electronics"
        }
        </code>
        
        <p>Database: ${DB_NAME}</p>
        <p>Collection: ${COLLECTION_NAME}</p>
    </body>
    </html>
    `;
    res.send(html);
});

app.get('/version', (req, res) => {
    res.status(200).json({
        version: "1.1",
        updatedAt: "2026-01-18"
    });
});

// GET all products with filtering
app.get('/api/products', async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            inStock,
            sortBy = 'id',
            sortOrder = 'asc',
            fields,
            limit,
            page = 1
        } = req.query;

        let query = {};

        if (category) {
            query.category = { $regex: new RegExp(category, 'i') };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        if (inStock !== undefined) {
            query.inStock = inStock === 'true';
        }

        let projection = { _id: 0 };
        if (fields) {
            const fieldList = fields.split(',');
            fieldList.forEach(field => {
                projection[field.trim()] = 1;
            });
        }

        let sort = {};
        const sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
        sort[sortBy] = sortDirection;

        const pageSize = limit ? parseInt(limit) : 10;
        const skip = (parseInt(page) - 1) * pageSize;

        const products = await productsCollection
            .find(query)
            .project(projection)
            .sort(sort)
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const totalCount = await productsCollection.countDocuments(query);

        res.status(200).json({
            success: true,
            count: products.length,
            total: totalCount,
            page: parseInt(page),
            totalPages: Math.ceil(totalCount / pageSize),
            products: products,
            filters: {
                category,
                minPrice,
                maxPrice,
                inStock
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// GET product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const productId = parseInt(id);
        if (isNaN(productId) || productId <= 0 || !Number.isInteger(productId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID',
                message: 'ID must be a positive integer'
            });
        }

        const product = await productsCollection.findOne({
            id: productId
        }, {
            projection: { _id: 0 }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
                message: `No product found with ID: ${productId}`
            });
        }

        res.status(200).json({
            success: true,
            product: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// POST create new product
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, category, description, inStock } = req.body;

        // Required fields validation
        if (!name || !price || !category) {
            const missingFields = [];
            if (!name) missingFields.push('name');
            if (!price) missingFields.push('price');
            if (!category) missingFields.push('category');

            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: `Please provide: ${missingFields.join(', ')}`,
                required: ['name', 'price', 'category']
            });
        }

        // Price validation
        if (typeof price !== 'number' || isNaN(price)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid price format',
                message: 'Price must be a number'
            });
        }

        if (price <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid price',
                message: 'Price must be greater than 0'
            });
        }

        // Get next ID from sequence
        const nextId = await getNextSequence();

        // Create product object
        const newProduct = {
            id: nextId,
            name: name.trim(),
            price: parseFloat(price.toFixed(2)),
            category: category.trim(),
            description: description ? description.trim() : '',
            inStock: inStock !== undefined ? Boolean(inStock) : true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Check if product with same name exists
        const existingProduct = await productsCollection.findOne({
            name: newProduct.name
        });

        if (existingProduct) {
            return res.status(409).json({
                success: false,
                error: 'Product already exists',
                message: `A product with name "${newProduct.name}" already exists`,
                productId: existingProduct.id
            });
        }

        // Insert product
        await productsCollection.insertOne(newProduct);

        // Remove MongoDB _id from response
        const createdProduct = { ...newProduct };
        delete createdProduct._id;

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: createdProduct
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// GET products by category
app.get('/api/products/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { minPrice, maxPrice, inStock } = req.query;

        let query = { category: { $regex: new RegExp(category, 'i') } };

        if (minPrice) {
            query.price = { ...query.price, $gte: parseFloat(minPrice) };
        }
        if (maxPrice) {
            query.price = { ...query.price, $lte: parseFloat(maxPrice) };
        }

        if (inStock !== undefined) {
            query.inStock = inStock === 'true';
        }

        const products = await productsCollection.find(query, {
            projection: { _id: 0 }
        }).sort({ id: 1 }).toArray();

        res.status(200).json({
            success: true,
            count: products.length,
            category: category,
            products: products
        });
    } catch (error) {
        console.error('Error searching by category:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// PUT update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const productId = parseInt(id);
        if (isNaN(productId) || productId <= 0 || !Number.isInteger(productId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID',
                message: 'ID must be a positive integer'
            });
        }

        // Check if product exists
        const existingProduct = await productsCollection.findOne({
            id: productId
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
                message: `No product found with ID: ${productId}`
            });
        }

        // Validate and prepare updates
        const { name, price, category, description, inStock } = updates;
        const allowedUpdates = {};

        if (name !== undefined) allowedUpdates.name = name.trim();
        if (price !== undefined) {
            if (typeof price !== 'number' || price <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid price',
                    message: 'Price must be a positive number'
                });
            }
            allowedUpdates.price = parseFloat(price.toFixed(2));
        }
        if (category !== undefined) allowedUpdates.category = category.trim();
        if (description !== undefined) allowedUpdates.description = description.trim();
        if (inStock !== undefined) allowedUpdates.inStock = Boolean(inStock);

        allowedUpdates.updatedAt = new Date();

        // Update product
        const result = await productsCollection.updateOne(
            { id: productId },
            { $set: allowedUpdates }
        );

        if (result.modifiedCount === 0) {
            return res.status(200).json({
                success: true,
                message: 'No changes made to product',
                productId: productId
            });
        }

        // Get updated product
        const updatedProduct = await productsCollection.findOne(
            { id: productId },
            { projection: { _id: 0 } }
        );

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const productId = parseInt(id);
        if (isNaN(productId) || productId <= 0 || !Number.isInteger(productId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID',
                message: 'ID must be a positive integer'
            });
        }

        // Check if product exists
        const existingProduct = await productsCollection.findOne({
            id: productId
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
                message: `No product found with ID: ${productId}`
            });
        }

        // Delete product
        const result = await productsCollection.deleteOne({ id: productId });

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            productId: productId,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// 404 handler for API endpoints
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        message: `The requested endpoint ${req.method} ${req.url} does not exist`,
        availableEndpoints: [
            'GET /',
            'GET /api/products',
            'GET /api/products/:id (integer)',
            'GET /api/products/category/:category',
            'POST /api/products',
            'PUT /api/products/:id',
            'DELETE /api/products/:id'
        ]
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred'
    });
});

// Start server
async function startServer() {
    try {
        await connectToDatabase();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Database: ${DB_NAME}`);
            console.log(`MongoDB URI: ${MONGO_URI.replace(/:[^:]*@/, ':****@')}`);
            console.log('\nAvailable endpoints:');
            console.log(`  http://localhost:${PORT}/`);
            console.log(`  http://localhost:${PORT}/api/products`);
            console.log(`  http://localhost:${PORT}/api/products/1`);
            console.log(`  http://localhost:${PORT}/api/products/category/Electronics`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();