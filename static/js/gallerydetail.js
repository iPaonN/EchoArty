// Toy Detail JavaScript Functions

// ======= PRICE CALCULATION FUNCTION =======
function calculatePrice(basePrice, x, y, quantity, originalX, originalY) {
    x = parseFloat(x);
    y = parseFloat(y);
    quantity = parseInt(quantity) || 1;
    basePrice = parseFloat(basePrice);
    originalX = parseFloat(originalX) || 1;
    originalY = parseFloat(originalY) || 1;

    if (isNaN(x) || isNaN(y) || x <= 0 || y <= 0 || isNaN(basePrice)) {
        console.log("Invalid input values, using defaults");
        x = 1;
        y = 1;
    }

    console.log(`Price calculation - Base: ${basePrice}, Original: ${originalX}x${originalY}, Current: ${x}x${y}, Quantity: ${quantity}`);
    
    // ถ้าเป็นขนาดเดิม ใช้ราคาฐานเลย
    if (x === originalX && y === originalY) {
        const unitPrice = basePrice;
        const totalPrice = unitPrice * quantity;
        console.log(`Original size - Unit price: ${unitPrice}฿, Total: ${totalPrice}฿`);
        return {
            unitPrice: unitPrice,
            totalPrice: totalPrice
        };
    }
    
    // คำนวณ scale factor จากขนาดเดิม
    const originalRatio = Math.max(originalX, originalY) / Math.min(originalX, originalY);
    const currentRatio = Math.max(x, y) / Math.min(x, y);
    
    let unitPrice;
    
    if (Math.abs(x - y) < 0.001) { // Square (same dimensions)
        unitPrice = basePrice * (x / Math.max(originalX, originalY));
        console.log(`Square pricing: ${basePrice} × (${x}/${Math.max(originalX, originalY)}) = ${unitPrice}`);
    } else if (currentRatio > 5) {
        unitPrice = basePrice * (((x + y) / 2) / ((originalX + originalY) / 2));
        console.log(`Extreme rectangle pricing: ${basePrice} × scale = ${unitPrice}`);
    } else if (currentRatio > 2) {
        unitPrice = basePrice * (Math.max(x, y) / Math.max(originalX, originalY));
        console.log(`Moderate rectangle pricing: ${basePrice} × (${Math.max(x, y)}/${Math.max(originalX, originalY)}) = ${unitPrice}`);
    } else {
        unitPrice = basePrice * ((x * y) / (originalX * originalY));
        console.log(`Mild rectangle pricing: ${basePrice} × (${x}×${y})/(${originalX}×${originalY}) = ${unitPrice}`);
    }

    // Multiply by quantity for final price
    const totalPrice = unitPrice * quantity;
    console.log(`Final calculation: ${unitPrice} × ${quantity} = ${totalPrice}`);
    
    return {
        unitPrice: unitPrice,
        totalPrice: totalPrice
    };
}

// Quantity management functions
function increaseQuantity() {
  const quantityInput = document.getElementById("quantity");
  let currentValue = parseInt(quantityInput.value);
  quantityInput.value = currentValue + 1;
  updatePrice();
}

function decreaseQuantity() {
  const quantityInput = document.getElementById("quantity");
  let currentValue = parseInt(quantityInput.value);
  if (currentValue > 1) {
    quantityInput.value = currentValue - 1;
    updatePrice();
  }
}

function getBasePrice() {
  const container = document.querySelector(".product-detail-container");
  // อ่านค่า data-product-price และแปลงเป็นตัวเลข (float)
  const price = parseFloat(container.getAttribute("data-product-price"));
  return isNaN(price) ? 0 : price; // คืนค่า 0 ถ้าแปลงไม่ได้
}

function getOriginalSize() {
  const container = document.querySelector(".product-detail-container");
  const size = container.getAttribute("data-product-size");
  if (size && size.includes(':')) {
    const parts = size.split(':');
    return {
      width: parseFloat(parts[0]),
      height: parseFloat(parts[1])
    };
  }
  return { width: 1, height: 1 };
}

// Price calculation function
function updatePrice() {
  const quantity = parseInt(document.getElementById("quantity").value) || 1;
  const width = parseFloat(document.getElementById("width").value) || 1;
  const height = parseFloat(document.getElementById("height").value) || 1;
  
  // ดึงราคาฐานจาก HTML
  const basePrice = getBasePrice();
  
  if (basePrice === 0) {
      console.error("ไม่พบราคาฐานสินค้า (basePrice is 0 or not found in data-attribute).");
      return;
  }
  
  // ดึงขนาดเดิม
  const originalSize = getOriginalSize();
  
  // คำนวณราคาโดยใช้ฟังก์ชัน calculatePrice
  const priceResult = calculatePrice(basePrice, width, height, quantity, originalSize.width, originalSize.height);

  // Update price displays
  document.getElementById("unitPrice").textContent = priceResult.unitPrice.toFixed(2) + "฿";
  document.getElementById("totalPrice").textContent = priceResult.totalPrice.toFixed(2) + "฿";
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Initialize price calculation
  updatePrice();

  // Add event listener for quantity input changes
  document.getElementById("quantity").addEventListener("input", updatePrice);
  
  // Add event listeners for dimension changes
  document.getElementById("width").addEventListener("input", updatePrice);
  document.getElementById("height").addEventListener("input", updatePrice);

  // File upload handling
  document
    .getElementById("fileUpload")
    .addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const fileUploadSection = document.querySelector(
          ".file-upload-section"
        );
        fileUploadSection.innerHTML = `
        <div class="file-upload-icon text-success">
            <i class="fas fa-check-circle"></i>
        </div>
        <div>
            <strong>ไฟล์ที่เลือก:</strong> ${file.name}
        </div>
        <div class="file-info">
            ขนาด: ${(file.size / 1024 / 1024).toFixed(2)} MB
        </div>
      `;
      }
    });

  // Form submission handling - Add to cart
  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();

    // Get product data from container
    const container = document.querySelector(".product-detail-container");
    const productId = container.getAttribute("data-product-id");
    const productName = container.getAttribute("data-product-name");
    const productPrice = parseFloat(container.getAttribute("data-product-price"));
    const productImage = container.getAttribute("data-product-image");
    const productSize = container.getAttribute("data-product-size");

    // Get form data
    const orderDetails = document.getElementById("orderDetails").value.trim();
    const quantity = parseInt(document.getElementById("quantity").value);
    const width = parseFloat(document.getElementById("width").value);
    const height = parseFloat(document.getElementById("height").value);
    const customSize = width + ":" + height;

    // ดึงขนาดเดิม
    const originalSize = getOriginalSize();

    // คำนวณราคาจริงโดยใช้ฟังก์ชัน calculatePrice
    const priceResult = calculatePrice(productPrice, width, height, quantity, originalSize.width, originalSize.height);

    // Create cart item object
    const cartItem = {
      product_id: productId,
      product_name: productName,
      product_price: productPrice,
      product_image: productImage,
      product_size: customSize,
      quantity: quantity,
      order_details: orderDetails,
      unit_price: priceResult.unitPrice,
      subtotal: priceResult.totalPrice
    };

    // Add to cart (localStorage)
    addToCart(cartItem);

    // Show success message
    const button = document.querySelector(".btn-submit");
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check me-2"></i>เพิ่มเข้าตะกร้าแล้ว';
    button.classList.add("btn-success");
    button.disabled = true;

    // Show notification
    showNotification("เพิ่มสินค้าลงตะกร้าสำเร็จ!", "success");

    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove("btn-success");
      button.disabled = false;
    }, 2000);

    // Log for debugging
    console.log("Added to cart:", cartItem);
  });
});

// ======= CART MANAGEMENT FUNCTIONS =======
function addToCart(cartItem) {
  // Get existing cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Check if product already exists in cart
  const existingItemIndex = cart.findIndex(item => 
    item.product_id === cartItem.product_id && 
    item.product_size === cartItem.product_size
  );

  if (existingItemIndex > -1) {
    // Update quantity if item exists
    cart[existingItemIndex].quantity += cartItem.quantity;
    cart[existingItemIndex].subtotal = cart[existingItemIndex].quantity * cart[existingItemIndex].product_price;
  } else {
    // Add new item to cart
    cart.push(cartItem);
  }

  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart badge if exists
  updateCartBadge();
  
  console.log('Cart updated:', cart);
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Update badge in navbar if exists
  const cartBadge = document.querySelector('.cart-badge, .badge');
  if (cartBadge) {
    cartBadge.textContent = totalItems;
    if (totalItems > 0) {
      cartBadge.style.display = 'inline-block';
    }
  }
}

// ======= NOTIFICATION FUNCTION =======
function showNotification(message, type = 'info') {
  // Create toast notification
  const toastHTML = `
    <div class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  // Add to toast container (create if doesn't exist)
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }

  toastContainer.insertAdjacentHTML('beforeend', toastHTML);

  // Show the toast
  const toastElement = toastContainer.lastElementChild;
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 3000
  });
  toast.show();

  // Remove from DOM after hiding
  toastElement.addEventListener('hidden.bs.toast', function () {
    this.remove();
  });
}

// Global functions for button onclick events
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCart = addToCart;
window.showNotification = showNotification;

// ======= REVIEW MANAGEMENT FUNCTIONS =======

// Load reviews when page loads
document.addEventListener("DOMContentLoaded", function() {
  const container = document.querySelector(".product-detail-container");
  const productId = container ? container.getAttribute("data-product-id") : null;
  
  if (productId) {
    loadReviews(productId);
    checkCanReview(productId);
    setupReviewForm(productId);
  }
});

async function loadReviews(productId) {
  try {
    const response = await fetch(`http://localhost:5000/api/products/${productId}/reviews`);
    const data = await response.json();
    
    if (data.success) {
      displayReviews(data.data);
    } else {
      console.error('Failed to load reviews:', data.message);
    }
  } catch (error) {
    console.error('Error loading reviews:', error);
  }
}

function displayReviews(data) {
  const { reviews, total_reviews, average_score } = data;
  
  // Update rating summary
  const avgScoreEl = document.getElementById('avgScore');
  const avgStarsEl = document.getElementById('avgStars');
  const totalReviewsEl = document.getElementById('totalReviews');
  
  if (total_reviews === 0) {
    avgScoreEl.textContent = '0';
    avgStarsEl.innerHTML = '';
    totalReviewsEl.textContent = 'ยังไม่มีรีวิว';
    return;
  }
  
  avgScoreEl.textContent = average_score.toFixed(1);
  avgStarsEl.innerHTML = generateStars(average_score);
  totalReviewsEl.textContent = `จาก ${total_reviews} รีวิว`;
  
  // Display individual reviews
  const reviewsList = document.getElementById('reviewsList');
  if (reviews.length === 0) {
    reviewsList.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="fas fa-comments fa-3x mb-3"></i>
        <p>ยังไม่มีรีวิวสำหรับสินค้านี้</p>
      </div>
    `;
  } else {
    reviewsList.innerHTML = reviews.map(review => `
      <div class="review-item">
        <div class="reviewer-info">
          <div class="reviewer-avatar">${getInitial(review.customer_name || review.username)}</div>
          <div>
            <div class="reviewer-name">${review.customer_name || review.username}</div>
            ${review.title ? `<div class="fw-bold">${review.title}</div>` : ''}
            <div class="review-stars">${generateStars(review.score)}</div>
          </div>
          <div class="review-date">${formatDate(review.review_date)}</div>
        </div>
        ${review.description ? `<p class="mb-0">${review.description}</p>` : ''}
      </div>
    `).join('');
  }
}

function generateStars(score) {
  const fullStars = Math.floor(score);
  const halfStar = score % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  let starsHTML = '';
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>';
  }
  if (halfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>';
  }
  return starsHTML;
}

function getInitial(name) {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543; // Convert to Buddhist year
  return `${day} ${month} ${year}`;
}

async function checkCanReview(productId) {
  const userData = sessionStorage.getItem('user_id');
  console.log('🔍 Checking review eligibility...');
  console.log('User ID from sessionStorage:', userData);
  
  if (!userData) {
    console.log('❌ User not logged in - cannot review');
    return; // User not logged in
  }
  
  const userId = userData;
  
  try {
    const url = `http://localhost:5000/api/products/${productId}/reviews/can-review?user_id=${userId}`;
    console.log('📡 Fetching:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('✅ API Response:', data);
    
    if (data.success && data.can_review) {
      // Show write review button
      console.log('✨ User CAN review - showing button');
      document.getElementById('writeReviewSection').style.display = 'block';
    } else {
      console.log('❌ User CANNOT review:', data.message);
    }
  } catch (error) {
    console.error('💥 Error checking review eligibility:', error);
  }
}

function setupReviewForm(productId) {
  // Rating star selection
  const ratingStars = document.querySelectorAll('.rating-input i');
  const scoreInput = document.getElementById('reviewScore');
  
  ratingStars.forEach(star => {
    star.addEventListener('click', function() {
      const score = this.getAttribute('data-score');
      scoreInput.value = score;
      
      // Update star display
      ratingStars.forEach((s, idx) => {
        if (idx < score) {
          s.classList.remove('far');
          s.classList.add('fas');
          s.style.color = '#ffc107';
        } else {
          s.classList.remove('fas');
          s.classList.add('far');
          s.style.color = '#dee2e6';
        }
      });
    });
  });
  
  // Submit review
  document.getElementById('submitReview').addEventListener('click', async function() {
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
      showNotification('กรุณาเข้าสู่ระบบก่อนเขียนรีวิว', 'warning');
      return;
    }
    
    const score = scoreInput.value;
    if (!score) {
      showNotification('กรุณาเลือกคะแนน', 'warning');
      return;
    }
    
    const title = document.getElementById('reviewTitle').value.trim();
    const description = document.getElementById('reviewDescription').value.trim();
    
    const reviewData = {
      user_id: parseInt(userId),
      score: parseInt(score),
      title: title,
      description: description
    };
    
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('ส่งรีวิวสำเร็จ ขอบคุณค่ะ!', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('reviewForm').reset();
        scoreInput.value = '';
        ratingStars.forEach(s => {
          s.classList.remove('fas');
          s.classList.add('far');
          s.style.color = '#dee2e6';
        });
        
        // Reload reviews
        loadReviews(productId);
        
        // Hide write review button
        document.getElementById('writeReviewSection').style.display = 'none';
      } else {
        showNotification(data.message || 'เกิดข้อผิดพลาด', 'danger');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showNotification('เกิดข้อผิดพลาดในการส่งรีวิว', 'danger');
    }
  });
}

// ======= EXPORT FOR NODE.JS AND BROWSER =======
// For use in Node.js (server-side)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculatePrice };
}

// For use in browser (client-side)
if (typeof window !== 'undefined') {
    window.calculatePrice = calculatePrice;
}
