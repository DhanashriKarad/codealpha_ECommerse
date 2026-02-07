const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Access denied');
  }
  next();
};

// Admin dashboard
router.get('/', requireAdmin, (req, res) => {
  db.all('SELECT * FROM products', (err, products) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.render('admin', { products, user: req.session.user });
  });
});

// Add product
router.get('/products/add', requireAdmin, (req, res) => {
  db.all('SELECT * FROM categories', (err, categories) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.render('admin-product-form', { product: null, categories, action: 'add', user: req.session.user });
  });
});

router.post('/products/add', requireAdmin, (req, res) => {
  const { name, description, price, category_id, image_url, stock } = req.body;
  db.run('INSERT INTO products (name, description, price, category_id, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, price, category_id, image_url, stock], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.redirect('/admin');
  });
});

router.post('/products/edit/:id', requireAdmin, (req, res) => {
  const productId = req.params.id;
  const { name, description, price, category_id, image_url, stock } = req.body;
  db.run('UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, stock = ? WHERE id = ?',
    [name, description, price, category_id, image_url, stock, productId], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.redirect('/admin');
  });
});

// Edit product
router.get('/products/edit/:id', requireAdmin, (req, res) => {
  const productId = req.params.id;
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    db.all('SELECT * FROM categories', (err, categories) => {
      if (err) {
        return res.status(500).send('Database error');
      }
      res.render('admin-product-form', { product, categories, action: 'edit', user: req.session.user });
    });
  });
});

router.post('/products/edit/:id', requireAdmin, (req, res) => {
  const productId = req.params.id;
  const { name, description, price, category_id, image_url, stock } = req.body;
  db.run('UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, stock = ? WHERE id = ?',
    [name, description, price, category_id, image_url, stock, productId], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.redirect('/admin');
  });
});

// Delete product
router.post('/products/delete/:id', requireAdmin, (req, res) => {
  const productId = req.params.id;
  db.run('DELETE FROM products WHERE id = ?', [productId], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.redirect('/admin');
  });
});

module.exports = router;
