# codealpha_ECommerse
#

## Description
This is a basic e-commerce website built using Node.js, Express, and SQLite. It features product listings, a shopping cart, user authentication, and order management. The site includes admin functionality for managing products and uses EJS for templating. It supports user registration, login, and secure checkout processes.

## Features
- User registration and authentication
- Product browsing and search
- Shopping cart functionality
- Order placement and management
- Admin panel for product management
- Responsive design with CSS
- Session-based user management

## Technologies Used
- **Backend:** Node.js, Express.js
- **Database:** SQLite
- **Frontend:** EJS templating, HTML, CSS, JavaScript
- **Authentication:** bcryptjs for password hashing, express-session for sessions
- **File Upload:** Multer for image uploads

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd E-Commerse
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```
   For development with auto-restart:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage
- Register a new account or login with existing credentials.
- Browse products on the homepage.
- Add items to your cart and proceed to checkout.
- Admins can access the admin panel to manage products.

## Database
The application uses SQLite. The database file `ecommerce.db` will be created automatically when the server starts.

## Contributing
Feel free to submit issues and pull requests.

## License
This project is licensed under the ISC License.
