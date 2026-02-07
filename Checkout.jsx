import React, { useState } from 'react';
import './Checkout.css';

const Checkout = () => {
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    zipcode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  // Mock cart items - replace with actual cart data
  const cartItems = [
    { id: 1, name: 'Product 1', price: 29.99, quantity: 2 },
    { id: 2, name: 'Product 2', price: 19.99, quantity: 1 }
  ];

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleShippingChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleCardChange = (e) => {
    setCardDetails({
      ...cardDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Order placed:', { shippingAddress, paymentMethod, cardDetails });
  };

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <nav className="nav">
          <div className="nav-logo">
            <h1>E-Commerce</h1>
          </div>
          <ul className="nav-menu">
            <li><a href="/" className="nav-link">Home</a></li>
            <li><a href="/products" className="nav-link">Products</a></li>
            <li><a href="/cart" className="nav-link">Cart</a></li>
            <li><a href="/orders" className="nav-link">Orders</a></li>
            <li><a href="/profile" className="nav-link">Profile</a></li>
            <li><a href="/auth/logout" className="nav-link">Logout</a></li>
          </ul>
        </nav>
      </header>

      <main className="checkout-main">
        <div className="checkout-container">
          <h1 className="checkout-title">Checkout</h1>

          <div className="checkout-content">
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="checkout-section">
                <div className="checkout-card">
                  <div className="card-header">
                    <h2 className="card-title">Shipping Address</h2>
                  </div>
                  <div className="card-body">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="address" className="form-label">Address</label>
                        <textarea
                          id="address"
                          name="address"
                          value={shippingAddress.address}
                          onChange={handleShippingChange}
                          className="form-input form-textarea"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="city" className="form-label">City</label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={shippingAddress.city}
                          onChange={handleShippingChange}
                          className="form-input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="zipcode" className="form-label">Zip Code</label>
                        <input
                          type="text"
                          id="zipcode"
                          name="zipcode"
                          value={shippingAddress.zipcode}
                          onChange={handleShippingChange}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="checkout-section">
                <div className="checkout-card">
                  <div className="card-header">
                    <h2 className="card-title">Payment Method</h2>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="payment_method" className="form-label">Payment Method</label>
                      <select
                        id="payment_method"
                        name="payment_method"
                        value={paymentMethod}
                        onChange={handlePaymentChange}
                        className="form-input form-select"
                        required
                      >
                        <option value="credit_card">Credit Card</option>
                        <option value="paypal">PayPal</option>
                        <option value="cod">Cash on Delivery</option>
                      </select>
                    </div>

                    {paymentMethod === 'credit_card' && (
                      <div className="payment-fields">
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="card_number" className="form-label">Card Number</label>
                            <input
                              type="text"
                              id="card_number"
                              name="cardNumber"
                              value={cardDetails.cardNumber}
                              onChange={handleCardChange}
                              className="form-input"
                              required
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="expiry_date" className="form-label">Expiry Date</label>
                            <input
                              type="text"
                              id="expiry_date"
                              name="expiryDate"
                              value={cardDetails.expiryDate}
                              onChange={handleCardChange}
                              placeholder="MM/YY"
                              className="form-input"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="cvv" className="form-label">CVV</label>
                            <input
                              type="text"
                              id="cvv"
                              name="cvv"
                              value={cardDetails.cvv}
                              onChange={handleCardChange}
                              className="form-input"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="checkout-actions">
                <button type="submit" className="btn btn-primary">Place Order</button>
              </div>
            </form>

            <div className="checkout-summary">
              <div className="checkout-card">
                <div className="card-header">
                  <h2 className="card-title">Order Summary</h2>
                </div>
                <div className="card-body">
                  <div className="order-items">
                    {cartItems.map(item => (
                      <div key={item.id} className="order-item">
                        <div className="order-item-info">
                          <span className="order-item-name">{item.name}</span>
                          <span className="order-item-quantity">Qty: {item.quantity}</span>
                        </div>
                        <span className="order-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-total">
                    <div className="order-total-row">
                      <span>Total:</span>
                      <span className="total-amount">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="checkout-footer">
        <p>&copy; 2023 E-Commerce Site. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Checkout;
