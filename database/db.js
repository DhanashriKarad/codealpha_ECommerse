const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database path
const dbPath = path.join(__dirname, '..', 'ecommerce.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase(() => {
      console.log('Database initialized successfully.');
    });
  }
});

// Initialize database tables and sample data
function initializeDatabase() {
  // Create tables
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category_id INTEGER,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )`,
    `CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      shipping_address TEXT,
      city TEXT,
      zipcode TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    )`,
    `CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    )`,
    `CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      zipcode TEXT NOT NULL,
      country TEXT DEFAULT 'USA',
      is_default BOOLEAN DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`
  ];

  // Execute table creation
  tables.forEach(sql => {
    db.run(sql, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      }
    });
  });

  // Insert sample data
  insertSampleData();
}

function insertSampleData() {
  // Insert categories
  const categories = [
    ['Electronics', 'Electronic devices and gadgets'],
    ['Clothing', 'Fashion and apparel'],
    ['Books', 'Books and literature'],
    ['Home', 'Home and garden items'],
    ['Sports', 'Sports and outdoor equipment'],
    ['Other', 'Miscellaneous items']
  ];

  categories.forEach(category => {
    db.run('INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)', category);
  });

  // Insert sample products
  const products = [
    // Electronics (30+ products)
    ['iPhone 15', 'Latest iPhone with advanced features', 999.99, 1, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop', 50],
    ['MacBook Pro', 'Powerful laptop for professionals', 1999.99, 1, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop', 25],
    ['Samsung Galaxy S24', 'Android flagship smartphone', 899.99, 1, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&h=300&fit=crop', 40],
    ['iPad Air', 'Versatile tablet for work and play', 599.99, 1, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop', 35],
    ['Sony WH-1000XM5', 'Premium noise-canceling headphones', 349.99, 1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop', 60],
    ['Apple Watch Series 9', 'Smartwatch with health features', 399.99, 1, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop', 45],
    ['Dell XPS 13', 'Ultrabook laptop', 1299.99, 1, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&h=300&fit=crop', 20],
    ['Google Pixel 8', 'Pure Android experience', 699.99, 1, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop', 30],
    ['Mac Mini', 'Compact desktop computer', 699.99, 1, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=300&h=300&fit=crop', 15],
    ['AirPods Pro', 'Wireless earbuds with noise cancellation', 249.99, 1, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c9f188?w=300&h=300&fit=crop', 80],
    ['iMac 24"', 'All-in-one desktop', 1299.99, 1, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop', 10],
    ['Surface Pro 9', '2-in-1 laptop tablet', 999.99, 1, 'https://images.unsplash.com/photo-1587614295999-6c1bd9c4b6f6?w=300&h=300&fit=crop', 25],
    ['Nintendo Switch OLED', 'Gaming console', 349.99, 1, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 70],
    ['Kindle Paperwhite', 'E-reader device', 129.99, 1, 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=300&h=300&fit=crop', 90],
    ['Roku Streaming Stick', 'Streaming device', 39.99, 1, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300&h=300&fit=crop', 100],
    ['Logitech MX Master 3', 'Wireless mouse', 99.99, 1, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop', 55],
    ['Anker PowerCore', 'Portable charger', 49.99, 1, 'https://images.unsplash.com/photo-1609592806580-9b8b3b0e8c8b?w=300&h=300&fit=crop', 120],
    ['Ring Video Doorbell', 'Smart doorbell', 179.99, 1, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=300&fit=crop', 40],
    ['Echo Dot', 'Smart speaker', 49.99, 1, 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=300&h=300&fit=crop', 85],
    ['Fire TV Stick', 'Streaming device', 39.99, 1, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop', 95],
    ['WD My Passport', 'External hard drive', 79.99, 1, 'https://images.unsplash.com/photo-1531492746076-742c0aea0b5e?w=300&h=300&fit=crop', 65],
    ['JBL GO 3', 'Portable speaker', 39.99, 1, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop', 110],
    ['Chromecast', 'Streaming device', 29.99, 1, 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=300&h=300&fit=crop', 75],
    ['Tile Mate', 'Bluetooth tracker', 24.99, 1, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 130],
    ['Sony A7 III', 'Mirrorless camera', 1999.99, 1, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop', 8],
    ['GoPro HERO9', 'Action camera', 399.99, 1, 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=300&h=300&fit=crop', 25],
    ['DJI Mini 3', 'Drone', 669.99, 1, 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300&h=300&fit=crop', 12],
    ['Apple Pencil', 'Stylus for iPad', 129.99, 1, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=300&fit=crop', 50],
    ['Magic Keyboard', 'Wireless keyboard', 299.99, 1, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop', 35],
    ['Logitech C920', 'Webcam', 79.99, 1, 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=300&h=300&fit=crop', 45],
    ['Anker USB Hub', 'Multi-port USB hub', 49.99, 1, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300&h=300&fit=crop', 60],

    // Clothing (30+ products)
    ['Nike Air Max', 'Comfortable running shoes', 129.99, 2, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop', 100],
    ['Levi\'s Jeans', 'Classic denim jeans', 79.99, 2, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop', 75],
    ['Adidas Ultraboost', 'Performance running shoes', 189.99, 2, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop', 65],
    ['H&M Cotton T-Shirt', 'Basic cotton t-shirt', 19.99, 2, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop', 200],
    ['Zara Blazer', 'Professional blazer', 89.99, 2, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop', 40],
    ['Uniqlo Sweater', 'Warm wool sweater', 49.99, 2, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop', 85],
    ['Nike Joggers', 'Comfortable jogger pants', 69.99, 2, 'https://images.unsplash.com/photo-1506629905607-0b5b8b5e4b4e?w=300&h=300&fit=crop', 90],
    ['Gap Hoodie', 'Cotton blend hoodie', 39.99, 2, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop', 110],
    ['Puma Sneakers', 'Casual sneakers', 79.99, 2, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=300&fit=crop', 70],
    ['Old Navy Jeans', 'Slim fit jeans', 49.99, 2, 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=300&h=300&fit=crop', 95],
    ['Forever 21 Dress', 'Floral summer dress', 29.99, 2, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop', 60],
    ['Banana Republic Shirt', 'Button-down shirt', 59.99, 2, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop', 55],
    ['Under Armour Shorts', 'Athletic shorts', 34.99, 2, 'https://images.unsplash.com/photo-1506629905607-0b5b8b5e4b4e?w=300&h=300&fit=crop', 80],
    ['Tommy Hilfiger Polo', 'Classic polo shirt', 69.99, 2, 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=300&fit=crop', 45],
    ['Converse Chuck Taylor', 'Classic canvas sneakers', 59.99, 2, 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=300&h=300&fit=crop', 120],
    ['Calvin Klein Underwear', 'Cotton underwear set', 24.99, 2, 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=300&fit=crop', 150],
    ['Ralph Lauren Sweater', 'Cable knit sweater', 129.99, 2, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop', 35],
    ['Vans Old Skool', 'Skate shoes', 64.99, 2, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&h=300&fit=crop', 85],
    ['American Eagle Jeans', 'Straight leg jeans', 54.99, 2, 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=300&h=300&fit=crop', 75],
    ['Hollister Hoodie', 'Graphic hoodie', 44.99, 2, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop', 65],
    ['New Balance 574', 'Classic sneakers', 79.99, 2, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop', 55],
    ['Abercrombie Tee', 'V-neck t-shirt', 29.99, 2, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop', 90],
    ['Champion Sweatpants', 'Fleece sweatpants', 39.99, 2, 'https://images.unsplash.com/photo-1506629905607-0b5b8b5e4b4e?w=300&h=300&fit=crop', 100],
    ['Guess Jeans', 'Skinny jeans', 89.99, 2, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop', 50],
    ['Express Blouse', 'Silk blouse', 49.99, 2, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop', 40],
    ['J.Crew Cardigan', 'Merino wool cardigan', 99.99, 2, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop', 30],
    ['Reebok CrossFit', 'Cross-training shoes', 109.99, 2, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop', 45],
    ['Ann Taylor Skirt', 'Pencil skirt', 79.99, 2, 'https://images.unsplash.com/photo-1583496661160-fb5886a6aaaa?w=300&h=300&fit=crop', 35],
    ['Brooks Brothers Shirt', 'Oxford shirt', 89.99, 2, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop', 25],
    ['Lululemon Leggings', 'Performance leggings', 98.99, 2, 'https://images.unsplash.com/photo-1506629905607-0b5b8b5e4b4e?w=300&h=300&fit=crop', 70],
    ['North Face Jacket', 'Waterproof jacket', 149.99, 2, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop', 40],

    // Books (30+ products)
    ['The Great Gatsby', 'Classic American novel', 12.99, 3, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop', 200],
    ['To Kill a Mockingbird', 'Award-winning novel', 14.99, 3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop', 150],
    ['1984', 'Dystopian novel by George Orwell', 13.99, 3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop', 180],
    ['Pride and Prejudice', 'Jane Austen classic', 11.99, 3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop', 160],
    ['The Catcher in the Rye', 'J.D. Salinger novel', 12.49, 3, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop', 140],
    ['Harry Potter and the Sorcerer\'s Stone', 'Fantasy adventure', 15.99, 3, 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=300&fit=crop', 250],
    ['The Lord of the Rings', 'Epic fantasy trilogy', 29.99, 3, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop', 120],
    ['Dune', 'Science fiction classic', 16.99, 3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop', 100],
    ['The Hobbit', 'Fantasy adventure', 14.99, 3, 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=300&fit=crop', 130],
    ['Atomic Habits', 'Self-help book', 18.99, 3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop', 90],
    ['Sapiens', 'History of humankind', 19.99, 3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop', 85],
    ['Educated', 'Memoir', 16.49, 3, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop', 110],
    ['The Midnight Library', 'Fantasy novel', 15.99, 3, 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=300&fit=crop', 95],
    ['Where the Crawdads Sing', 'Mystery novel', 14.99, 3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop', 140],
    ['The Seven Husbands of Evelyn Hugo', 'Historical fiction', 16.99, 3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop', 105],
    ['Becoming', 'Michelle Obama memoir', 20.99, 3, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop', 80],
    ['The Subtle Art of Not Giving a F*ck', 'Self-help', 17.99, 3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop', 125],
    ['Circe', 'Mythology retelling', 15.49, 3, 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=300&fit=crop', 115],
    ['Normal People', 'Contemporary fiction', 14.99, 3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop', 100],
    ['The Vanishing Half', 'Literary fiction', 16.99, 3, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop', 95],
    ['Such a Fun Age', 'Satirical novel', 15.99, 3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop', 85],
    ['The Guest List', 'Thriller', 14.49, 3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop', 120],
    ['Transcendent Kingdom', 'Literary fiction', 16.99, 3, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop', 75],
    ['Interior Chinatown', 'Satire novel', 15.99, 3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop', 90],
    ['The Invisible Life of Addie LaRue', 'Fantasy', 17.99, 3, 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=300&fit=crop', 110],
    ['Klara and the Sun', 'Science fiction', 16.49, 3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop', 85],
    ['The Ministry for the Future', 'Climate fiction', 18.99, 3, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop', 70],
    ['Project Hail Mary', 'Science fiction', 17.99, 3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop', 130],
    ['The Four Winds', 'Historical fiction', 15.99, 3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop', 105],
    ['Anxious People', 'Humorous mystery', 14.99, 3, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop', 115],
    ['The Song of Achilles', 'Mythology retelling', 15.49, 3, 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=300&fit=crop', 95],

    // Home (30+ products)
    ['Coffee Maker', 'Automatic drip coffee maker', 49.99, 4, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop', 30],
    ['Dyson Vacuum', 'Cordless vacuum cleaner', 399.99, 4, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 20],
    ['KitchenAid Mixer', 'Stand mixer', 299.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 15],
    ['Instant Pot', 'Multi-cooker', 89.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 45],
    ['Cuisinart Blender', 'High-performance blender', 149.99, 4, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 25],
    ['Ninja Air Fryer', 'Air fryer oven', 129.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 35],
    ['Breville Toaster', '4-slice toaster', 79.99, 4, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop', 50],
    ['Vitamix Blender', 'Professional blender', 599.99, 4, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 10],
    ['Roomba Robot', 'Robotic vacuum', 299.99, 4, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 18],
    ['Keurig Coffee Maker', 'Single-serve coffee maker', 69.99, 4, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop', 40],
    ['Hamilton Beach Mixer', 'Hand mixer', 29.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 60],
    ['Crock-Pot Slow Cooker', '6-quart slow cooker', 39.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 55],
    ['Oster Blender', 'Glass jar blender', 49.99, 4, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 45],
    ['Black+Decker Toaster Oven', 'Convection toaster oven', 59.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 30],
    ['Mr. Coffee Maker', '12-cup coffee maker', 24.99, 4, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop', 70],
    ['Sunbeam Mixer', 'Stand mixer', 89.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 20],
    ['DeLonghi Espresso Machine', 'Espresso maker', 199.99, 4, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop', 12],
    ['Wolfgang Puck Blender', 'Personal blender', 79.99, 4, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 35],
    ['All-Clad Pan Set', 'Non-stick cookware set', 149.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 25],
    ['Calphalon Knife Set', 'Professional knife set', 99.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 40],
    ['Le Creuset Dutch Oven', 'Cast iron dutch oven', 299.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 15],
    ['OXO Kitchen Tools', 'Kitchen gadget set', 49.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 65],
    ['Pyrex Glassware', 'Glass baking dishes', 39.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 50],
    ['Tupperware Containers', 'Food storage containers', 29.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 80],
    ['Whirlpool Refrigerator', 'French door refrigerator', 1499.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 5],
    ['LG Washing Machine', 'Front load washer', 799.99, 4, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 8],
    ['Samsung Dryer', 'Electric dryer', 699.99, 4, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 8],
    ['Dyson Air Purifier', 'HEPA air purifier', 499.99, 4, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 12],
    ['Honeywell Thermostat', 'Smart thermostat', 149.99, 4, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300&h=300&fit=crop', 20],
    ['Philips Air Fryer', 'Compact air fryer', 99.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 28],
    ['GE Microwave', 'Countertop microwave', 89.99, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', 22],

    // Sports (30+ products)
    ['Yoga Mat', 'Non-slip exercise mat', 29.99, 5, 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=300&h=300&fit=crop', 80],
    ['Nike Running Shoes', 'Performance running shoes', 149.99, 5, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop', 60],
    ['Adidas Soccer Ball', 'Official size soccer ball', 24.99, 5, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=300&fit=crop', 100],
    ['Wilson Basketball', 'Indoor/outdoor basketball', 49.99, 5, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=300&fit=crop', 75],
    ['Peloton Bike', 'Stationary exercise bike', 2495.99, 5, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', 5],
    ['Bowflex Dumbbells', 'Adjustable dumbbells', 299.99, 5, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', 15],
    ['Treadmill', 'Electric treadmill', 899.99, 5, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', 8],
    ['Yoga Block Set', 'Foam yoga blocks', 19.99, 5, 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=300&h=300&fit=crop', 120],
    ['Resistance Bands', 'Set of resistance bands', 14.99, 5, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', 150],
    ['Foam Roller', 'Muscle recovery roller', 24.99, 5, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', 90],
    ['Kettlebell', 'Cast iron kettlebell', 39.99, 5, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', 70],
    ['Jump Rope', 'Speed jump rope', 12.99, 5, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', 200],
    ['Protein Powder', 'Whey protein supplement', 34.99, 5, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', 85],
    ['Heart Rate Monitor', 'Chest strap HRM', 49.99, 5, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', 55],
  ];
  

  // Create admin user
  const bcrypt = require('bcryptjs');
  bcrypt.hash('admin123', 10, (err, hash) => {
    if (!err) {
      db.run('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin@example.com', hash, 'Admin User', 'admin']);
    }
  });
}

module.exports = db;
