const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const app = express();
const PORT = 3000;

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
      return res.send('用户名无效');
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
      return res.send('密码错误');
    }

  } catch (err) {
    console.error('登录时发生错误：', err);
    res.status(500).send('登录时发生错误：' + err.message);
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
  const {name, count, singlePrice} = req.body;

  try {
    // 创建新用户
    const newItem = new items({
      name: name,
	  count: count,
      singlePrice: singlePrice
    });

    // 保存到数据库
    await newItem.save();

    // 重定向到用户创建成功页面
    res.redirect('/crud');
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).send("创建用户时发生错误：" + err.message);
  }
});

// Read 页面，仅已登录的用户可访问
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
	//console.log('search');

    const { query } = req.query; // 從查詢字符串中獲取查詢參數
	const searchText = req.query.searchBar;
	
    try {
        // 使用正則表達式進行不區分大小寫的搜索
        const results = await items.findOne({ name: searchText });
		if (!results) {
		  return res.send('no this item');
		}		
		
		console.log(req.query.searchBar);
		console.log(results);
        
		res.render('read', { 
			name: results.name, 
			count: results.count, 
			singlePrice: results.singlePrice 
			});
		
    } catch (error) {
        console.error(error); // 輸出錯誤信息
        res.status(500).send('Server Error');
    }
});

app.get('/update', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  const searchBarText = '';
  const nameText = ''; 
  const countText = ''; 
  const singlePriceText = ''; 
  res.render('update', { 
	searchBar: searchBarText,
    name: nameText, 
    count: countText, 
    singlePrice: singlePriceText 
	});
});

app.get('/user/update', async (req, res) => {
	console.log('get');

    const { query } = req.query; // 從查詢字符串中獲取查詢參數
	const searchText = req.query.searchBar;
	
    try {
        // 使用正則表達式進行不區分大小寫的搜索
        const results = await items.findOne({ name: searchText });
		if (!results) {
		  return res.send('no this item');
		}		
		
		console.log(req.query.searchBar);
		console.log(results);
        
		res.render('update', { 
			searchBar: results.name,
			name: results.name, 
			count: results.count, 
			singlePrice: results.singlePrice 
			});
		
    } catch (error) {
        console.error(error); // 輸出錯誤信息
        res.status(500).send('Server Error');
    }
});

app.put('/user/update', async (req, res) => {
	console.log('put');
	
	const { searchBar, count, price } = req.body;
	console.log(searchBar);

    try {
        // 假设你根据名称查找项目并更新
        const updatedItem = await items.findOneAndUpdate(
            { name: searchBar }, // 查找条件
            { count: count, price: price }, // 更新内容
            { new: true } // 返回更新后的文档
        );

        if (!updatedItem) {
            return res.status(404).json({ message: '项目未找到' });
        }

        // 重定向到用户创建成功页面
        res.redirect('/crud');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
});

app.get('/delete', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  const searchBarText = '';
  const nameText = ''; 
  const countText = ''; 
  const singlePriceText = ''; 
  res.render('delete', { 
	searchBar: searchBarText,
    name: nameText, 
    count: countText, 
    singlePrice: singlePriceText 
	});
});

app.get('/user/delete', async (req, res) => {
	console.log('get');

    const { query } = req.query; // 從查詢字符串中獲取查詢參數
	const searchText = req.query.searchBar;
	
    try {
        // 使用正則表達式進行不區分大小寫的搜索
        const results = await items.findOne({ name: searchText });
		if (!results) {
		  return res.send('no this item');
		}		
		
		console.log(req.query.searchBar);
		console.log(results);
        
		res.render('delete', { 
			searchBar: results.name,
			name: results.name, 
			count: results.count, 
			singlePrice: results.singlePrice 
			});
		
    } catch (error) {
        console.error(error); // 輸出錯誤信息
        res.status(500).send('Server Error');
    }
});

app.delete('/user/delete', async (req, res) => {
		
	const { searchBar } = req.body;
	console.log(searchBar);

    try {
        // 假设你根据名称查找项目并更新
		const deletedItem = await items.findOne({ name: searchBar });
		console.log(deletedItem.name);

        if (!deletedItem) {
            return res.status(404).json({ message: '项目未找到' });
        } else {
			await items.findOneAndDelete({ name: deletedItem.name });
			console.log('delete');
		}

        // 重定向到用户创建成功页面
        res.redirect('/crud');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
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
    if (!user) return res.status(400).json({ message: '用户名无效' });

    if (password === user.password) {
      if (user.admin) {
        req.session.adminId = user._id;
        return res.status(200).json({ message: 'Admin 登录成功' });
      } else {
        req.session.userId = user._id;
        return res.status(200).json({ message: 'User 登录成功' });
      }
    } else {
      return res.status(400).json({ message: '密码错误' });
    }
  } catch (err) {
    console.error('登录时发生错误：', err);
    res.status(500).json({ message: '登录时发生错误' });
  }
});

// 登出
app.post('/curl/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: '登出时发生错误' });
    res.status(200).json({ message: '成功登出' });
  });
});

// 需要登录的中间件
function isLoggedIn(req, res, next) {
  if (req.session.userId || req.session.adminId) {
    next();
  } else {
    res.status(401).json({ message: '请先登录' });
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
    console.error('创建项目时发生错误：', err);
    res.status(500).json({ message: '创建项目时发生错误' });
  }
});

// Read - 获取项目列表 (GET /api/items)
app.get('/curl/items', isLoggedIn, async (req, res) => {
  try {
    const allItems = await items.find();
    res.status(200).json(allItems);
  } catch (err) {
    console.error('读取项目时发生错误：', err);
    res.status(500).json({ message: '读取项目时发生错误' });
  }
});

// Read - 根据名称获取项目 (GET /api/items/name/:name)
app.get('/curl/items/name/:name', isLoggedIn, async (req, res) => {
  try {
    const item = await items.findOne({ name: req.params.name });
    if (!item) return res.status(404).json({ message: '项目未找到' });

    res.status(200).json(item);
  } catch (err) {
    console.error('读取项目时发生错误：', err);
    res.status(500).json({ message: '读取项目时发生错误' });
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
    console.error('更新项目时发生错误：', err);
    res.status(500).json({ message: '更新项目时发生错误' });
  }
});

// Delete - 删除项目 (DELETE /api/items/name/:name)
app.delete('/curl/items/name/:name', isLoggedIn, async (req, res) => {
  try {
    const deletedItem = await items.findOneAndDelete({ name: req.params.name });
    if (!deletedItem) return res.status(404).json({ message: '项目未找到' });

    res.status(200).json({ message: '项目已删除', deletedItem });
  } catch (err) {
    console.error('删除项目时发生错误：', err);
    res.status(500).json({ message: '删除项目时发生错误' });
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
