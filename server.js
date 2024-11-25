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

// 登录页路由
app.get('/login', (req, res) => {
  res.render('login');
});

// 处理登录请求
app.post('/login', async (req, res) => {
  const { username, password , admin} = req.body;

  try {
    // 从 MongoDB 查找用户
    const user = await users.findOne({ username: username });
    
    if (!user) {
      return res.send('Invalid Username');
    }

    // 直接比较明文密码
    if (password === user.password) {
      if (user.admin == false){
		// 如果密码匹配，创建会话并重定向到用户主页
		console.log('userP');
		req.session.userId = user._id;
		return res.redirect('/userHome');
	  } else {
		console.log('adminP');
		req.session.adminId = user._id;
		return res.redirect('/adminHome');		
	  }
    } else {
      return res.send('Wrong password');
    }

  } catch (err) {
    console.error('Error logging in：', err);
    res.status(500).send('Error logging in：' + err.message);
  }
});

// 普通用户主页
app.get('/userHome', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('userHome');
});

// 管理员主页
app.get('/adminHome', (req, res) => {
  if (!req.session.adminId) {
    return res.redirect('/login');
  }
  res.render('adminHome');
});

// CRUD 页面，仅已登录的用户可访问
app.get('/crud', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('crud');
});

// Create 页面，仅已登录的用户可访问
app.get('/create', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('create');
});

// 处理创建用户的 POST 请求
app.post('/users/create', async (req, res) => {
    const { name, count, singlePrice } = req.body;

    try {
        // 创建新配件
        const newItem = new items({
            name: name,
            count: count,
            singlePrice: singlePrice
        });

        // 保存到数据库
        await newItem.save();

        // 返回创建的配件信息作为 JSON 响应
        res.status(201).json(newItem);
    } catch (err) {
        console.error('Error creating item:', err);
        res.status(500).send("Error in creating item：" + err.message);
    }
});

// Read 页面，仅已登录的用户可访问，显示所有 items，并处理搜索功能
app.get('/read', async (req, res) => {
    // 检查用户是否登录
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    try {
        // 查询数据库中的所有 items
        const itemsList = await items.find();

        // 如果有查询参数，则按名称查询特定 item
        const searchText = req.query.searchBar;
        let selectedItem = null;

        if (searchText) {
            // 使用正则表达式进行不区分大小写的搜索
            selectedItem = await items.findOne({ name: new RegExp(searchText, 'i') });
            if (!selectedItem) {
                // 如果没有找到相应的配件，传递提示信息到前端
                return res.render('read', {
                    items: itemsList,
                    name: 'No such item found',
                    count: '-',
                    singlePrice: '-'
                });
            }
        }

        // 渲染 read.ejs 页面，传递 items 列表和选中的 item 信息（如果有的话）
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

// 显示 update 页面并列出所有 items
app.get('/update', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    try {
        // 查询所有 items
        const itemsList = await items.find();

        // 渲染页面，传递 items 列表和空的选中 item 信息
        res.render('update', {
            items: itemsList,
            selectedItem: null // 初始情况下没有选中的 item
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Server Error');
    }
});

// 更新某个 item 的数据
app.put('/user/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, count, singlePrice } = req.body;

    try {
        // 检查是否存在相同名称的其他项目
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
        // 查询所有 items
        const itemsList = await items.find();

        // 渲染 delete 页面，传递 items 列表
        res.render('delete', { items: itemsList });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Server Error');
    }
});
app.delete('/user/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // 根据 ID 删除对应的 item
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
// 处理登出请求
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/login');
    }
    res.redirect('/login');
  });
});



// ===============================================CURL===================================================
// 登录
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

// 登出
app.post('/curl/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Error logging in' });
    res.status(200).json({ message: 'logout success' });
  });
});

// 需要登录的中间件
function isLoggedIn(req, res, next) {
  if (req.session.userId || req.session.adminId) {
    next();
  } else {
    res.status(401).json({ message: 'please login first' });
  }
}

// CRUD 操作

// Create - 创建新项目 (POST /api/items)
app.post('/curl/items', isLoggedIn, async (req, res) => {
  const { name, count, singlePrice } = req.body;

  try {
    const newItem = new items({ name, count, singlePrice });
    await newItem.save();
    res.status(201).json(newItem); // 返回创建的项目
  } catch (err) {
    console.error('error when create items：', err);
    res.status(500).json({ message: 'error when create items' });
  }
});

// Read - 获取项目列表 (GET /api/items)
app.get('/curl/items', isLoggedIn, async (req, res) => {
  try {
    const allItems = await items.find();
    res.status(200).json(allItems);
  } catch (err) {
    console.error('error when read items：', err);
    res.status(500).json({ message: 'error when read items' });
  }
});

// Read - 根据名称获取项目 (GET /api/items/name/:name)
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

// Update - 更新项目 (PUT /api/items/name/:name)
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

// Delete - 删除项目 (DELETE /api/items/name/:name)
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

// 连接 MongoDB 并启动服务器
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}/login`);
      console.log('Mongoose Connected!');
    });
  })
  .catch(err => console.log('Mongoose Connection Error:', err));
