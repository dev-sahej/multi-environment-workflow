const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// In-Memory Data Storage
// ============================================
let menuItems = [
    {
        id: '1',
        name: 'Margherita Pizza',
        description: 'Classic tomato sauce, fresh mozzarella, and basil',
        price: 14.99,
        category: 'Pizza',
        available: true
    },
    {
        id: '2',
        name: 'Spaghetti Carbonara',
        description: 'Creamy pasta with pancetta, egg, and parmesan',
        price: 16.99,
        category: 'Pasta',
        available: true
    },
    {
        id: '3',
        name: 'Caesar Salad',
        description: 'Romaine lettuce, croutons, parmesan, and Caesar dressing',
        price: 10.99,
        category: 'Salads',
        available: true
    },
    {
        id: '4',
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
        price: 8.99,
        category: 'Desserts',
        available: true
    },
    {
        id: '5',
        name: 'Bruschetta',
        description: 'Toasted bread topped with fresh tomatoes, garlic, and basil',
        price: 7.99,
        category: 'Appetizers',
        available: false
    }
];

// ID counter for new items
let nextId = 6;

// ============================================
// Health Check Endpoint
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'backend-api',
        timestamp: new Date().toISOString(),
        itemCount: menuItems.length
    });
});

// ============================================
// Menu Items API Endpoints
// ============================================

// GET /api/menu - Get all menu items
app.get('/api/menu', (req, res) => {
    // Optional: Filter by category
    const { category } = req.query;
    
    let items = menuItems;
    
    if (category) {
        items = items.filter(item => 
            item.category.toLowerCase() === category.toLowerCase()
        );
    }
    
    res.json(items);
});

// GET /api/menu/:id - Get single menu item
app.get('/api/menu/:id', (req, res) => {
    const { id } = req.params;
    const item = menuItems.find(item => item.id === id);
    
    if (!item) {
        return res.status(404).json({
            error: 'Item not found',
            message: `No menu item found with id: ${id}`
        });
    }
    
    res.json(item);
});

// POST /api/menu - Create new menu item
app.post('/api/menu', (req, res) => {
    const { name, description, price, category, available } = req.body;
    
    // Validation
    if (!name || !description || price === undefined || !category) {
        return res.status(400).json({
            error: 'Validation failed',
            message: 'Name, description, price, and category are required'
        });
    }
    
    const newItem = {
        id: String(nextId++),
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category,
        available: available !== undefined ? available : true
    };
    
    menuItems.push(newItem);
    
    console.log(`Created new item: ${newItem.name} (ID: ${newItem.id})`);
    
    res.status(201).json(newItem);
});

// PUT /api/menu/:id - Update menu item
app.put('/api/menu/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, available } = req.body;
    
    const itemIndex = menuItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
        return res.status(404).json({
            error: 'Item not found',
            message: `No menu item found with id: ${id}`
        });
    }
    
    // Update item
    const updatedItem = {
        ...menuItems[itemIndex],
        name: name !== undefined ? name.trim() : menuItems[itemIndex].name,
        description: description !== undefined ? description.trim() : menuItems[itemIndex].description,
        price: price !== undefined ? parseFloat(price) : menuItems[itemIndex].price,
        category: category !== undefined ? category : menuItems[itemIndex].category,
        available: available !== undefined ? available : menuItems[itemIndex].available
    };
    
    menuItems[itemIndex] = updatedItem;
    
    console.log(`Updated item: ${updatedItem.name} (ID: ${updatedItem.id})`);
    
    res.json(updatedItem);
});

// DELETE /api/menu/:id - Delete menu item
app.delete('/api/menu/:id', (req, res) => {
    const { id } = req.params;
    
    const itemIndex = menuItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
        return res.status(404).json({
            error: 'Item not found',
            message: `No menu item found with id: ${id}`
        });
    }
    
    const deletedItem = menuItems.splice(itemIndex, 1)[0];
    
    console.log(`Deleted item: ${deletedItem.name} (ID: ${deletedItem.id})`);
    
    res.json({
        message: 'Item deleted successfully',
        item: deletedItem
    });
});

// ============================================
// Error Handling
// ============================================
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
    console.log(`Backend API server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Menu items: http://localhost:${PORT}/api/menu`);
    console.log(`Loaded ${menuItems.length} seed menu items`);
});