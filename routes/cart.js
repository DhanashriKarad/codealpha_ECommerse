const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Get cart
router.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const userId = req.session.user.id;
  db.all(`
    SELECT c.*, p.name, p.price, p.image_url
    FROM carts c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `, [userId], (err, cartItems) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.render('cart', { cartItems, total, user: req.session.user });
  });
});

// Add to cart
router.post('/add/:productId', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const userId = req.session.user.id;
  const productId = req.params.productId;
  const quantity = parseInt(req.body.quantity) || 1;

  // Check if item already in cart
  db.get('SELECT * FROM carts WHERE user_id = ? AND product_id = ?', [userId, productId], (err, item) => {
    if (err) {
      return res.status(500).send('Database error');
    }

    if (item) {
      // Update quantity
      db.run('UPDATE carts SET quantity = quantity + ? WHERE id = ?', [quantity, item.id], (err) => {
        if (err) {
          return res.status(500).send('Database error');
        }
        res.redirect('/cart');
      });
    } else {
      // Add new item
      db.run('INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, productId, quantity], (err) => {
        if (err) {
          return res.status(500).send('Database error');
        }
        res.redirect('/cart');
      });
    }
  });
});

// Update cart item
router.post('/update/:cartId', (req, res) => {
  const cartId = req.params.cartId;
  const quantity = parseInt(req.body.quantity);

  if (quantity <= 0) {
    return router.post('/remove/:cartId', req, res);
  }

  db.run('UPDATE carts SET quantity = ? WHERE id = ?', [quantity, cartId], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.redirect('/cart');
  });
});

// Remove from cart
router.post('/remove/:cartId', (req, res) => {
  const cartId = req.params.cartId;

  db.run('DELETE FROM carts WHERE id = ?', [cartId], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.redirect('/cart');
  });
});

// API endpoint to get cart count
router.get('/api/count', (req, res) => {
  if (!req.session.user) {
    return res.json({ count: 0 });
  }

  const userId = req.session.user.id;
  db.get('SELECT SUM(quantity) as count FROM carts WHERE user_id = ?', [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ count: result.count || 0 });
  });
});

module.exports = router;
