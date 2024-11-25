const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB URI
const uri = "mongodb+srv://Mike_Wang:Wang090701@cluster.k8uyh.mongodb.net/groupData?retryWrites=true&w=majority&appName=Cluster";

// 设置视图引擎为 EJS
app.set('view engine', 'ejs');

// 中间件，用于解析请求体数据
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// 设置静态文件目录
app.use(express.static('public'));

app.use(methodOverride('_method'));

// 配置 session
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

// ========================== 修改部分：处理根路径 ==========================
// 根路径处理，提供一个默认页面或重定向
app.get('/', (req, res) => {
  res.redirect('/login'); // 默认重定向到登录页面
});

// ========================== 登录与权限验证相关路由 ==========================
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

// ========================== 主页路由 ==========================
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

// ========================== CRUD 操作界面路由 ==========================
app.get('/crud', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('crud');
});

// Create 页面
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

// Read 页面
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

// Update 页面
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

// 更新某个 item
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

// Delete 页面
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

// 登出
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/login');
    }
    res.redirect('/login');
  });
});

// ===============================================CURL===================================================
// ... CURL 路由保持不变

// ========================== 连接 MongoDB 并启动服务器 ==========================
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}/login`);
      console.log('Mongoose Connected!');
    });
  })
  .catch(err => console.log('Mongoose Connection Error:', err));
