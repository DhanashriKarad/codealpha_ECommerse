const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Get checkout page
router.get('/checkout', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const userId = req.session.user.id;
  db.all(`
    SELECT c.*, p.name, p.price
    FROM carts c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `, [userId], (err, cartItems) => {
    if (err) {
      return res.status(500).send('Database error');
    }

    if (cartItems.length === 0) {
      return res.redirect('/cart');
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.render('checkout', { cartItems, total, user: req.session.user });
  });
});

// Place order
router.post('/place', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const userId = req.session.user.id;
  const { address, city, zipcode, payment_method, card_number, expiry_date, cvv } = req.body;

  // Get cart items
  db.all(`
    SELECT c.*, p.price, p.stock
    FROM carts c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `, [userId], (err, cartItems) => {
    if (err) {
      return res.status(500).send('Database error');
    }

    if (cartItems.length === 0) {
      return res.redirect('/cart');
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check stock
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        return res.status(400).send(`Insufficient stock for ${item.name}`);
      }
    }

    // Create order
    db.run(`
      INSERT INTO orders (user_id, total_amount, shipping_address, city, zipcode, payment_method, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [userId, total, address, city, zipcode, payment_method], function(err) {
      if (err) {
        return res.status(500).send('Database error');
      }

      const orderId = this.lastID;

      // Add order items
      const orderItems = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      let completed = 0;
      orderItems.forEach(item => {
        db.run(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `, [item.order_id, item.product_id, item.quantity, item.price], (err) => {
          if (err) {
            return res.status(500).send('Database error');
          }

          // Update product stock
          db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id], (err) => {
            if (err) {
              return res.status(500).send('Database error');
            }

            completed++;
            if (completed === orderItems.length) {
              // Clear cart
              db.run('DELETE FROM carts WHERE user_id = ?', [userId], (err) => {
                if (err) {
                  return res.status(500).send('Database error');
                }
                res.redirect(`/orders/confirmation/${orderId}`);
              });
            }
          });
        });
      });
    });
  });
});

// Order confirmation
router.get('/confirmation/:id', (req, res) => {
  const orderId = req.params.id;

  db.get(`
    SELECT o.*, u.name, u.email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = ?
  `, [orderId], (err, order) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Get order items
    db.all(`
      SELECT oi.*, p.name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId], (err, orderItems) => {
      if (err) {
        return res.status(500).send('Database error');
      }
      res.render('order-confirmation', { order, orderItems, user: req.session.user });
    });
  });
});

// Order history
router.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const userId = req.session.user.id;

  // Get cart count for user
  let cartCount = 0;
  db.get('SELECT SUM(quantity) as count FROM carts WHERE user_id = ?', [userId], (err, cartResult) => {
    if (!err && cartResult) cartCount = cartResult.count || 0;

    db.all(`
      SELECT o.*, COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [userId], (err, orders) => {
      if (err) {
        return res.status(500).send('Database error');
      }
      res.render('orders', { orders, cartCount, user: req.session.user });
    });
  });
});

// Order details
router.get('/:id', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const orderId = req.params.id;
  const userId = req.session.user.id;

  db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId], (err, order) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Get order items
    db.all(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId], (err, orderItems) => {
      if (err) {
        return res.status(500).send('Database error');
      }
      res.render('order-details', { order, orderItems, user: req.session.user });
    });
  });
});

module.exports = router;
