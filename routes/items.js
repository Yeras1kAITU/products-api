const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shop';
const DB_NAME = process.env.DB_NAME || 'shop';
const COLLECTION_NAME = 'items';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error('API_KEY is not set in environment variables');
    process.exit(1);
}

const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization'];

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'API key is required'
        });
    }

    if (apiKey !== API_KEY) {
        return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: 'Invalid API key'
        });
    }

    next();
};

let db;
let itemsCollection;
let itemsCounterCollection;

async function connectToItemsDatabase() {
    try {
        const client = await MongoClient.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000
        });

        db = client.db(DB_NAME);
        itemsCollection = db.collection(COLLECTION_NAME);
        itemsCounterCollection = db.collection('items_counter');

        await itemsCollection.createIndex({ id: 1 }, { unique: true });
        await itemsCollection.createIndex({ name: 1 });

        await itemsCounterCollection.updateOne(
            { _id: 'itemId' },
            { $setOnInsert: { sequence_value: 1 } },
            { upsert: true }
        );

        console.log(`Items collection "${COLLECTION_NAME}" is ready`);
        return client;
    } catch (error) {
        console.error('Failed to connect to items database:', error);
        throw error;
    }
}

async function getNextItemId() {
    try {
        if (!itemsCounterCollection) {
            console.error('itemsCounterCollection is not initialized yet');
            const timestampId = Math.floor(Date.now() / 1000) % 1000000;
            return timestampId;
        }

        const existingCounter = await itemsCounterCollection.findOne({ _id: 'itemId' });

        if (!existingCounter) {
            await itemsCounterCollection.insertOne({
                _id: 'itemId',
                sequence_value: 1
            });
            return 1;
        }

        const result = await itemsCounterCollection.findOneAndUpdate(
            { _id: 'itemId' },
            { $inc: { sequence_value: 1 } },
            { returnDocument: 'after' }
        );

        if (result && result.value) {
            return result.value.sequence_value;
        } else {
            return existingCounter.sequence_value + 1;
        }
    } catch (error) {
        console.error('Error in getNextItemId:', error.message);
        if (!itemsCollection) {
            const timestampId = Math.floor(Date.now() / 1000) % 1000000;
            return timestampId;
        }

        const lastItem = await itemsCollection
            .find()
            .sort({ id: -1 })
            .limit(1)
            .toArray();

        const nextId = lastItem.length > 0 ? lastItem[0].id + 1 : 1;
        return nextId;
    }
}

async function addSampleItems() {
    try {
        const count = await itemsCollection.countDocuments();

        if (count === 0) {
            console.log('No items found. Adding sample data...');

            await itemsCounterCollection.updateOne(
                { _id: 'itemId' },
                { $set: { sequence_value: 5 } }
            );

            const sampleItems = [
                {
                    id: 1,
                    name: "Notebook",
                    description: "A simple notebook for notes",
                    price: 5.99,
                    category: "Stationery",
                    inStock: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 2,
                    name: "Coffee Mug",
                    description: "Ceramic coffee mug",
                    price: 12.50,
                    category: "Kitchen",
                    inStock: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 3,
                    name: "Desk Lamp",
                    description: "LED desk lamp with adjustable brightness",
                    price: 29.99,
                    category: "Electronics",
                    inStock: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 4,
                    name: "Wireless Mouse",
                    description: "Bluetooth wireless mouse with long battery life",
                    price: 24.99,
                    category: "Electronics",
                    inStock: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            await itemsCollection.insertMany(sampleItems);
            console.log(`${sampleItems.length} sample items added to collection`);
        } else {
            console.log(`Found ${count} existing items in the database`);
        }
    } catch (error) {
        console.error('Error adding sample items:', error);
    }
}

const checkItemsDatabaseConnection = (req, res, next) => {
    if (!itemsCollection || !itemsCounterCollection) {
        return res.status(503).json({
            success: false,
            error: 'Service Unavailable',
            message: 'Items database is initializing. Please try again in a moment.'
        });
    }
    next();
};

connectToItemsDatabase()
    .then(() => addSampleItems())
    .catch(console.error);

const validateItem = (item, isPartial = false) => {
    const errors = [];

    if (!isPartial || item.name !== undefined) {
        if (!item.name || item.name.trim() === '') {
            errors.push('Name is required');
        } else if (item.name.length < 2) {
            errors.push('Name must be at least 2 characters long');
        }
    }

    if (!isPartial || item.price !== undefined) {
        if (item.price !== undefined) {
            if (typeof item.price !== 'number' || isNaN(item.price)) {
                errors.push('Price must be a number');
            } else if (item.price < 0) {
                errors.push('Price cannot be negative');
            }
        }
    }

    if (!isPartial || item.category !== undefined) {
        if (item.category !== undefined && item.category.trim() === '') {
            errors.push('Category cannot be empty');
        }
    }

    return errors;
};

router.get('/', async (req, res) => {
    try {
        const { category, minPrice, maxPrice, inStock, limit = 50 } = req.query;

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

        const items = await itemsCollection
            .find(query)
            .project({ _id: 0 })
            .limit(parseInt(limit))
            .sort({ id: 1 })
            .toArray();

        res.status(200).json({
            success: true,
            count: items.length,
            items: items
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve items'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID',
                message: 'ID must be a positive integer'
            });
        }

        const item = await itemsCollection.findOne(
            { id: id },
            { projection: { _id: 0 } }
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Item not found',
                message: `No item found with ID: ${id}`
            });
        }

        res.status(200).json({
            success: true,
            item: item
        });
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve item'
        });
    }
});

router.post('/', validateApiKey, checkItemsDatabaseConnection, async (req, res) => {
    try {
        const { name, description, price, category, inStock } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: 'Name is required'
            });
        }

        if (price === undefined || typeof price !== 'number' || isNaN(price)) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: 'Price must be a valid number'
            });
        }

        if (price < 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: 'Price cannot be negative'
            });
        }

        if (!category || category.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: 'Category is required'
            });
        }

        const existingItem = await itemsCollection.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });

        if (existingItem) {
            return res.status(409).json({
                success: false,
                error: 'Duplicate item',
                message: `An item with name "${name}" already exists`
            });
        }

        const nextId = await getNextItemId();

        const newItem = {
            id: nextId,
            name: name.trim(),
            description: description ? description.trim() : '',
            price: parseFloat(price.toFixed(2)),
            category: category.trim(),
            inStock: inStock !== undefined ? Boolean(inStock) : true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await itemsCollection.insertOne(newItem);

        const { _id, ...responseItem } = newItem;

        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            item: responseItem
        });

    } catch (error) {
        console.error('Error creating item:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: 'Duplicate ID',
                message: 'Item with this ID already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to create item'
        });
    }
});

router.put('/:id', validateApiKey, checkItemsDatabaseConnection, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID',
                message: 'ID must be a positive integer'
            });
        }

        const existingItem = await itemsCollection.findOne({ id: id });

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                error: 'Item not found',
                message: `No item found with ID: ${id}`
            });
        }

        const { name, description, price, category, inStock } = req.body;

        const updatedItem = {
            name: name?.trim(),
            description: description?.trim() || '',
            price: price !== undefined ? parseFloat(price) : undefined,
            category: category?.trim() || 'General',
            inStock: inStock !== undefined ? Boolean(inStock) : true,
            updatedAt: new Date()
        };

        const validationErrors = validateItem(updatedItem, false);

        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: 'Please provide all required fields:',
                errors: validationErrors
            });
        }

        const result = await itemsCollection.updateOne(
            { id: id },
            {
                $set: {
                    ...updatedItem,
                    createdAt: existingItem.createdAt
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(200).json({
                success: true,
                message: 'No changes made to the item',
                itemId: id
            });
        }

        const finalItem = await itemsCollection.findOne(
            { id: id },
            { projection: { _id: 0 } }
        );

        res.status(200).json({
            success: true,
            message: 'Item updated successfully',
            item: finalItem
        });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to update item'
        });
    }
});

router.patch('/:id', validateApiKey, checkItemsDatabaseConnection, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID',
                message: 'ID must be a positive integer'
            });
        }

        const existingItem = await itemsCollection.findOne({ id: id });

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                error: 'Item not found',
                message: `No item found with ID: ${id}`
            });
        }

        const updates = req.body;

        const validationErrors = validateItem(updates, true);

        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: 'Please correct the following errors:',
                errors: validationErrors
            });
        }

        const updateFields = {};

        if (updates.name !== undefined) updateFields.name = updates.name.trim();
        if (updates.description !== undefined) updateFields.description = updates.description.trim();
        if (updates.price !== undefined) updateFields.price = parseFloat(updates.price);
        if (updates.category !== undefined) updateFields.category = updates.category.trim();
        if (updates.inStock !== undefined) updateFields.inStock = Boolean(updates.inStock);

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid updates',
                message: 'No valid fields provided for update'
            });
        }

        updateFields.updatedAt = new Date();

        const result = await itemsCollection.updateOne(
            { id: id },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return res.status(200).json({
                success: true,
                message: 'No changes made to the item',
                itemId: id
            });
        }

        const updatedItem = await itemsCollection.findOne(
            { id: id },
            { projection: { _id: 0 } }
        );

        res.status(200).json({
            success: true,
            message: 'Item partially updated successfully',
            item: updatedItem
        });
    } catch (error) {
        console.error('Error patching item:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to update item'
        });
    }
});

router.delete('/:id', validateApiKey, checkItemsDatabaseConnection, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID',
                message: 'ID must be a positive integer'
            });
        }

        const existingItem = await itemsCollection.findOne({ id: id });

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                error: 'Item not found',
                message: `No item found with ID: ${id}`
            });
        }

        const result = await itemsCollection.deleteOne({ id: id });

        if (result.deletedCount === 0) {
            return res.status(500).json({
                success: false,
                error: 'Deletion failed',
                message: 'Failed to delete the item'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Item deleted successfully',
            itemId: id
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to delete item'
        });
    }
});

module.exports = router;