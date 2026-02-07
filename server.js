const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);

// Home route
app.get('/', (req, res) => {
  // Fetch featured products (first 4 products)
  db.all('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC LIMIT 4', (err, featuredProducts) => {
    if (err) {
      console.error('Error fetching featured products:', err);
      return res.status(500).send('Database error');
    }
    res.render('index', { user: req.session.user, featuredProducts: featuredProducts || [] });
  });
});

// Profile route
app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const userId = req.session.user.id;

  // Get cart count for user
  let cartCount = 0;
  db.get('SELECT SUM(quantity) as count FROM carts WHERE user_id = ?', [userId], (err, cartResult) => {
    if (!err && cartResult) cartCount = cartResult.count || 0;

    res.render('profile', { user: req.session.user, cartCount });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
