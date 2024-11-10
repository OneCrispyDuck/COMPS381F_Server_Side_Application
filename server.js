const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// MongoDB URI
const uri = "mongodb+srv://Mike_Wang:Wang090701@cluster.k8uyh.mongodb.net/groupData?retryWrites=true&w=majority&appName=Cluster0";

// Set view engine to EJS
app.set('view engine', 'ejs');

// Middleware to parse request body data
app.use(bodyParser.urlencoded({ extended: true }));

// Set static file directory
app.use(express.static('public'));

// Configure session
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const itemSchema = require('./models/item');
const items = mongoose.model('items', itemSchema);

const userSchema = require('./models/user');
const users = mongoose.model('users', userSchema);

// Login page route
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle login request
app.post('/login', async (req, res) => {
  const { username, password, admin } = req.body;

  try {
    // Find user from MongoDB
    const user = await users.findOne({ username: username });
    
    if (!user) {
      return res.send('Invalid username');
    }

    // Compare plain text password directly
    if (password === user.password) {
      if (user.admin == false) {
        // If password matches, create session and redirect to user homepage
        console.log('User login');
        req.session.userId = user._id;
        return res.redirect('/userHome');
      } else {
        console.log('Admin login');
        req.session.adminId = user._id;
        return res.redirect('/adminHome');		
      }
    } else {
      return res.send('Incorrect password');
    }

  } catch (err) {
    console.error('Error occurred during login:', err);
    res.status(500).send('Error occurred during login: ' + err.message);
  }
});

// User homepage
app.get('/userHome', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('userHome');
});

// Admin homepage
app.get('/adminHome', (req, res) => {
  if (!req.session.adminId) {
    return res.redirect('/login');
  }
  res.render('adminHome');
});

// CRUD page, accessible only to logged-in users
app.get('/crud', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('crud');
});

// Create page, accessible only to logged-in users
app.get('/create', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('create');
});

// Handle POST request to create new item
app.post('/users/create', async (req, res) => {
  const { name, count, singlePrice } = req.body;

  try {
    // Create new item
    const newItem = new items({
      name: name,
      count: count,
      singlePrice: singlePrice
    });

    // Save to database
    await newItem.save();
    res.redirect('/crud');
    // Redirect to user creation success page
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).send("Error occurred while creating item: " + err.message);
  }
});

// Read page, accessible only to logged-in users
app.get('/read', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  const nameText = ''; 
  const countText = ''; 
  const singlePriceText = ''; 
  res.render('read', { 
    name: nameText, 
    count: countText, 
    singlePrice: singlePriceText 
  });
});

app.get('/user/read', async (req, res) => {
  console.log('Searching');

  const { query } = req.query; // Get the query parameter from the query string
  const searchText = req.query.searchBar;
  
  try {
    // Use regular expression for case-insensitive search
    const results = await items.findOne({ name: searchText });
    if (!results) {
      return res.send('No such item');
    }
    
    console.log(req.query.searchBar);
    console.log(results);
    
    res.render('read', { 
      name: results.name, 
      count: results.count, 
      singlePrice: results.singlePrice 
    });
    
  } catch (error) {
    console.error(error); // Log error message
    res.status(500).send('Server Error');
  }
});

// Delete page, accessible only to logged-in users
app.get('/delete', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('delete');
});

// Handle logout request
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/login');
    }
    res.redirect('/login');
  });
});

// Connect to MongoDB and start the server
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}/login`);
      console.log('Mongoose Connected!');
    });
  })
  .catch(err => console.log('Mongoose Connection Error:', err));
