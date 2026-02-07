// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Add to cart functionality with AJAX
document.addEventListener('DOMContentLoaded', function() {
    const addToCartForms = document.querySelectorAll('.add-to-cart-form');

    addToCartForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const button = form.querySelector('.add-to-cart-btn');
            if (button.disabled) return;

            const formData = new FormData(form);
            const productId = form.action.split('/').pop();

            // Disable button and show loading state
            const originalText = button.textContent;
            button.textContent = 'Adding...';
            button.disabled = true;
            button.style.backgroundColor = '#6c757d';

            // Send AJAX request
            fetch(`/cart/add/${productId}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                if (response.redirected) {
                    // If redirected (not logged in), redirect to login
                    window.location.href = response.url;
                    return;
                }
                return response.text();
            })
            .then(data => {
                if (data) {
                    // Success - show feedback and update cart count
                    button.textContent = 'Added!';
                    button.style.backgroundColor = '#28a745';
                    button.style.borderColor = '#28a745';

                    // Update cart count in navigation
                    updateCartCount();

                    // Reset button after 2 seconds
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.backgroundColor = '';
                        button.style.borderColor = '';
                        button.disabled = false;
                    }, 2000);
                }
            })
            .catch(error => {
                console.error('Error adding to cart:', error);
                // Reset button on error
                button.textContent = originalText;
                button.style.backgroundColor = '';
                button.style.borderColor = '';
                button.disabled = false;

                // Show error message
                alert('Error adding item to cart. Please try again.');
            });
        });
    });
});

// Function to update cart count in navigation
function updateCartCount() {
    fetch('/api/cart/count', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        const cartLinks = document.querySelectorAll('.nav-link[href="/cart"], .nav-link[href*="cart"]');
        cartLinks.forEach(link => {
            const text = link.textContent.replace(/\(\d+\)/, '').trim();
            link.textContent = `${text} (${data.count || 0})`;
        });
    })
    .catch(error => {
        console.error('Error updating cart count:', error);
    });
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});
