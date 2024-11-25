const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3000;

const uri = "mongodb+srv://Mike_Wang:Wang090701@cluster.k8uyh.mongodb.net/groupData?retryWrites=true&w=majority&appName=Cluster";

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(methodOverride('_method'));
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

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password, admin } = req.body;

  try {
    const user = await users.findOne({ username: username });
    if (!user) {
      return res.send('Invalid Username');
    }

    if (password === user.password) {
      if (user.admin === false) {
        req.session.userId = user._id;
        return res.redirect('/userHome');
      } else {
        req.session.adminId = user._id;
        return res.redirect('/adminHome');
      }
    } else {
      return res.send('Wrong password');
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).send('Error logging in:' + err.message);
  }
});

app.get('/userHome', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('userHome');
});

app.get('/adminHome', (req, res) => {
  if (!req.session.adminId) {
    return res.redirect('/login');
  }
  res.render('adminHome');
});

app.get('/crud', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('crud');
});

app.get('/create', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('create');
});

app.post('/users/create', async (req, res) => {
  const { name, count, singlePrice } = req.body;

  try {
    const newItem = new items({ name, count, singlePrice });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).send("Error in creating item：" + err.message);
  }
});

app.get('/read', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    const itemsList = await items.find();
    const searchText = req.query.searchBar;
    let selectedItem = null;

    if (searchText) {
      selectedItem = await items.findOne({ name: new RegExp(searchText, 'i') });
      if (!selectedItem) {
        return res.render('read', {
          items: itemsList,
          name: 'No such item found',
          count: '-',
          singlePrice: '-'
        });
      }
    }

    res.render('read', {
      items: itemsList,
      name: selectedItem ? selectedItem.name : '',
      count: selectedItem ? selectedItem.count : '',
      singlePrice: selectedItem ? selectedItem.singlePrice : ''
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Server Error');
  }
});

app.get('/update', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    const itemsList = await items.find();
    res.render('update', { items: itemsList, selectedItem: null });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Server Error');
  }
});

app.put('/user/update/:id', async (req, res) => {
  const { id } = req.params;
  const { name, count, singlePrice } = req.body;

  try {
    const existingItem = await items.findOne({ name: name, _id: { $ne: id } });
    if (existingItem) {
      return res.status(400).json({ message: 'Item with the same name already exists' });
    }

    const updatedItem = await items.findByIdAndUpdate(
      id,
      { name: name, count: parseInt(count), singlePrice: parseFloat(singlePrice) },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item updated successfully', updatedItem });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/delete', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    const itemsList = await items.find();
    res.render('delete', { items: itemsList });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Server Error');
  }
});

app.delete('/user/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await items.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/login');
    }
    res.redirect('/login');
  });
});

// ===============================================CURL===================================================
app.post('/curl/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await users.findOne({ username });
    if (!user) return res.status(400).json({ message: 'invalid username' });

    if (password === user.password) {
      if (user.admin) {
        req.session.adminId = user._id;
        return res.status(200).json({ message: 'Admin login success' });
      } else {
        req.session.userId = user._id;
        return res.status(200).json({ message: 'User login success' });
      }
    } else {
      return res.status(400).json({ message: 'wrong password' });
    }
  } catch (err) {
    console.error('Error logging in：', err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.post('/curl/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Error logging in' });
    res.status(200).json({ message: 'logout success' });
  });
});

function isLoggedIn(req, res, next) {
  if (req.session.userId || req.session.adminId) {
    next();
  } else {
    res.status(401).json({ message: 'please login first' });
  }
}

app.post('/curl/items', isLoggedIn, async (req, res) => {
  const { name, count, singlePrice } = req.body;

  try {
    const newItem = new items({ name, count, singlePrice });
    await newItem.save();
    res.status(201).json(newItem); 
  } catch (err) {
    console.error('error when create items：', err);
    res.status(500).json({ message: 'error when create items' });
  }
});

app.get('/curl/items', isLoggedIn, async (req, res) => {
  try {
    const allItems = await items.find();
    res.status(200).json(allItems);
  } catch (err) {
    console.error('error when read items：', err);
    res.status(500).json({ message: 'error when read items' });
  }
});

app.get('/curl/items/name/:name', isLoggedIn, async (req, res) => {
  try {
    const item = await items.findOne({ name: req.params.name });
    if (!item) return res.status(404).json({ message: 'no such project' });

    res.status(200).json(item);
  } catch (err) {
    console.error('error when read items：', err);
    res.status(500).json({ message: 'error when read items' });
  }
});

app.put('/curl/items/name/:name', isLoggedIn, async (req, res) => {
  const { count, singlePrice } = req.body;

  try {
    const updatedItem = await items.findOneAndUpdate(
      { name: req.params.name },
      { count, singlePrice },
      { new: true }
    );

    if (!updatedItem) return res.status(404).json({ message: '项目未找到' });

    res.status(200).json(updatedItem);
  } catch (err) {
    console.error('error when update items：', err);
    res.status(500).json({ message: 'error when update items' });
  }
});

app.delete('/curl/items/name/:name', isLoggedIn, async (req, res) => {
  try {
    const deletedItem = await items.findOneAndDelete({ name: req.params.name });
    if (!deletedItem) return res.status(404).json({ message: 'no such project' });

    res.status(200).json({ message: 'item deleted', deletedItem });
  } catch (err) {
    console.error('An error occurred while deleting the project：', err);
    res.status(500).json({ message: 'An error occurred while deleting the project' });
  }
});

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}/login`);
      console.log('Mongoose Connected!');
    });
  })
  .catch(err => console.log('Mongoose Connection Error:', err));
