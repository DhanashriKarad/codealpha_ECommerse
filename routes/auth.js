const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');

const router = express.Router();

// Register route
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  // Check if user already exists
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.render('register', { error: 'Database error' });
    }
    if (user) {
      return res.render('register', { error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name], function(err) {
      if (err) {
        return res.render('register', { error: 'Registration failed' });
      }
      req.session.user = { id: this.lastID, email, name, role: 'user' };
      res.redirect('/');
    });
  });
});

// Login route
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.render('login', { error: 'Database error' });
    }
    if (!user) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    req.session.user = { id: user.id, email: user.email, name: user.name, role: user.role };
    res.redirect('/');
  });
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;
