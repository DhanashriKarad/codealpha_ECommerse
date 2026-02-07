const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Get all products with optional search and category filter
router.get('/', (req, res) => {
  const { search, category } = req.query;
  let sql = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id';
  let params = [];

  if (search || category) {
    sql += ' WHERE';
    if (search) {
      sql += ' p.name LIKE ? OR p.description LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      if (search) sql += ' AND';
      sql += ' p.category_id = ?';
      params.push(category);
    }
  }

  sql += ' ORDER BY p.id DESC';

  db.all(sql, params, (err, products) => {
    if (err) {
      return res.status(500).send('Database error');
    }

    // Get categories for filter
    db.all('SELECT DISTINCT id, name FROM categories ORDER BY name', (err, categories) => {
      if (err) {
        return res.status(500).send('Database error');
      }

      // Get cart count for user
      let cartCount = 0;
      if (req.session.user) {
        db.get('SELECT SUM(quantity) as count FROM carts WHERE user_id = ?', [req.session.user.id], (err, result) => {
          if (!err && result) cartCount = result.count || 0;
          res.render('products', { products, categories, search, categoryId: category, cartCount, user: req.session.user });
        });
      } else {
        res.render('products', { products, categories, search, categoryId: category, cartCount, user: req.session.user });
      }
    });
  });
});

// Get product details
router.get('/:id', (req, res) => {
  const productId = req.params.id;

  db.get('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Get reviews for the product
    db.all('SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC', [productId], (err, reviews) => {
      if (err) {
        return res.status(500).send('Database error');
      }

      res.render('product-details', { product, reviews, user: req.session.user });
    });
  });
});

// Add review to product (requires login)
router.post('/:id/review', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const productId = req.params.id;
  const { rating, comment } = req.body;

  db.run('INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
    [req.session.user.id, productId, rating, comment], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.redirect(`/products/${productId}`);
  });
});

module.exports = router;
