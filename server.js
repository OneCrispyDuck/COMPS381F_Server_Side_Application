//BASIC TEMPLATE BELOW:

// Import required modules
const express = require('express');
const session = require('cookie-session');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // For PUT and DELETE methods in forms
app.use(express.static('public'));

// View engine setup
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'your-secret-key'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Authentication middleware
const authenticateUser = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Routes

// Home route
app.get('/', (req, res) => {
    res.render('index');
});

// Authentication routes
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    // Login logic here
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

// CRUD Web Routes (Protected)
app.get('/dashboard', authenticateUser, (req, res) => {
    res.render('dashboard');
});

// Create
app.get('/create', authenticateUser, (req, res) => {
    res.render('create');
});

app.post('/create', authenticateUser, async (req, res) => {
    // Create logic here
});

// Read
app.get('/read', authenticateUser, async (req, res) => {
    // Read logic here
});

// Update
app.get('/edit/:id', authenticateUser, async (req, res) => {
    // Get item for editing
});

app.put('/update/:id', authenticateUser, async (req, res) => {
    // Update logic here
});

// Delete
app.delete('/delete/:id', authenticateUser, async (req, res) => {
    // Delete logic here
});

// RESTful API Routes (No authentication required as per project specs)

// CREATE - Using GET (as required)
app.get('/api/create', async (req, res) => {
    try {
        // Create logic here
        res.status(201).json({ message: 'Resource created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ - Using POST (as required)
app.post('/api/read', async (req, res) => {
    try {
        // Read logic here
        res.json({ data: 'your data' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE - Using PUT
app.put('/api/update/:id', async (req, res) => {
    try {
        // Update logic here
        res.json({ message: 'Resource updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Using DELETE
app.delete('/api/delete/:id', async (req, res) => {
    try {
        // Delete logic here
        res.json({ message: 'Resource deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: err });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});