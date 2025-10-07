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

// Scale management functions (maintain aspect ratio)
let isRatioLocked = true; // เริ่มต้นล็อคอัตราส่วน
let isUpdatingFromSlider = false; // ป้องกัน infinite loop

// Toggle lock/unlock ratio
function toggleLockRatio() {
  isRatioLocked = !isRatioLocked;
  const lockIcon = document.getElementById("lockIcon");
  
  if (isRatioLocked) {
    lockIcon.className = "fas fa-lock text-primary";
    showNotification("ล็อคอัตราส่วนแล้ว - ขนาดจะปรับตามสัดส่วนเดิม", "info");
  } else {
    lockIcon.className = "fas fa-unlock text-secondary";
    showNotification("ปลดล็อคอัตราส่วน - สามารถปรับขนาดอิสระได้", "info");
  }
}

// Set scale from preset buttons
function setScale(multiplier) {
  const slider = document.getElementById("scaleSlider");
  slider.value = multiplier;
  updateDimensionsFromSlider(multiplier);
}

// Update dimensions from slider
function updateDimensionsFromSlider(sliderValue) {
  if (isUpdatingFromSlider) return;
  isUpdatingFromSlider = true;
  
  const originalSize = getOriginalSize();
  const scale = parseFloat(sliderValue);
  
  // คำนวณขนาดใหม่
  const newWidth = (originalSize.width * scale).toFixed(1);
  const newHeight = (originalSize.height * scale).toFixed(1);
  
  // อัปเดต inputs
  document.getElementById("width").value = newWidth;
  document.getElementById("height").value = newHeight;
  
  // อัปเดต badge
  document.getElementById("scaleDisplay").textContent = `×${scale.toFixed(1)}`;
  
  // อัปเดตข้อมูล
  updateDimensionInfo(newWidth, newHeight, originalSize);
  
  // คำนวณราคา
  updatePrice();
  
  isUpdatingFromSlider = false;
}

// Update dimension info display
function updateDimensionInfo(width, height, originalSize) {
  const w = parseFloat(width);
  const h = parseFloat(height);
  const scale = (w / originalSize.width).toFixed(1);
  
  // คำนวณขนาดจริงประมาณการ (สมมติว่า base scale คือ 1:6 = 30cm)
  // ถ้า original size คือ 1:6 (1 หน่วย = 30cm จริง)
  const baseHeightCm = 30; // ถ้า 1:6 scale
  const currentHeightCm = (h * baseHeightCm).toFixed(1);
  const currentWidthCm = (w * baseHeightCm).toFixed(1);
  
  // คำนวณพื้นที่เปรียบเทียบ
  const area = w * h;
  const originalArea = originalSize.width * originalSize.height;
  const areaIncrease = ((area / originalArea - 1) * 100).toFixed(0);
  
  let infoText = `ความสูงประมาณ ${currentHeightCm} cm, กว้าง ${currentWidthCm} cm`;
  if (scale != 1.0) {
    if (areaIncrease > 0) {
      infoText += ` (ใหญ่ขึ้น ${areaIncrease}%)`;
    } else if (areaIncrease < 0) {
      infoText += ` (เล็กลง ${Math.abs(areaIncrease)}%)`;
    }
  } else {
    infoText += ` (ขนาดมาตรฐาน)`;
  }
  
  document.getElementById("dimensionInfo").textContent = infoText;
}

// Handle manual width input with ratio lock
function handleWidthChange() {
  if (isUpdatingFromSlider) return;
  
  const width = parseFloat(document.getElementById("width").value);
  const originalSize = getOriginalSize();
  
  if (isRatioLocked && !isNaN(width)) {
    // คำนวณ height ตามอัตราส่วนเดิม
    const ratio = originalSize.height / originalSize.width;
    const newHeight = (width * ratio).toFixed(1);
    document.getElementById("height").value = newHeight;
    
    // อัปเดต slider
    const scale = width / originalSize.width;
    document.getElementById("scaleSlider").value = scale;
    document.getElementById("scaleDisplay").textContent = `×${scale.toFixed(1)}`;
  }
  
  updateDimensionInfo(
    document.getElementById("width").value,
    document.getElementById("height").value,
    originalSize
  );
  updatePrice();
}

// Handle manual height input with ratio lock
function handleHeightChange() {
  if (isUpdatingFromSlider) return;
  
  const height = parseFloat(document.getElementById("height").value);
  const originalSize = getOriginalSize();
  
  if (isRatioLocked && !isNaN(height)) {
    // คำนวณ width ตามอัตราส่วนเดิม
    const ratio = originalSize.width / originalSize.height;
    const newWidth = (height * ratio).toFixed(1);
    document.getElementById("width").value = newWidth;
    
    // อัปเดต slider
    const scale = height / originalSize.height;
    document.getElementById("scaleSlider").value = scale;
    document.getElementById("scaleDisplay").textContent = `×${scale.toFixed(1)}`;
  }
  
  updateDimensionInfo(
    document.getElementById("width").value,
    document.getElementById("height").value,
    originalSize
  );
  updatePrice();
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
  // Initialize ratio lock state
  isRatioLocked = true;
  
  // Initialize dimension info
  const originalSize = getOriginalSize();
  updateDimensionInfo(originalSize.width, originalSize.height, originalSize);
  
  // Initialize price calculation
  updatePrice();

  // Add event listeners
  document.getElementById("quantity").addEventListener("input", updatePrice);
  document.getElementById("width").addEventListener("input", handleWidthChange);
  document.getElementById("height").addEventListener("input", handleHeightChange);
  
  // Slider event listener
  document.getElementById("scaleSlider").addEventListener("input", function(e) {
    updateDimensionsFromSlider(e.target.value);
  });

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
    const productSize = container.getAttribute("data-product-size"); // ขนาดเดิม

    // Get form data
    const orderDetails = document.getElementById("orderDetails").value.trim();
    const quantity = parseInt(document.getElementById("quantity").value);
    const width = parseFloat(document.getElementById("width").value);
    const height = parseFloat(document.getElementById("height").value);
    const customSize = width + ":" + height; // ขนาดที่เลือก

    // ดึงขนาดเดิม
    const originalSize = getOriginalSize();

    // คำนวณราคาจริงโดยใช้ฟังก์ชัน calculatePrice
    const priceResult = calculatePrice(productPrice, width, height, quantity, originalSize.width, originalSize.height);

    // คำนวณ scale multiplier
    const scaleMultiplier = (width / originalSize.width).toFixed(1);

    // Create cart item object with complete data
    const cartItem = {
      product_id: productId,
      product_name: productName,
      product_price: productPrice,           // ราคาฐาน
      product_image: productImage,
      original_size: productSize,            // ✅ ขนาดเดิม "2:3"
      custom_size: customSize,               // ✅ ขนาดที่เลือก "4:6"
      scale_multiplier: scaleMultiplier,     // ✅ ตัวคูณ "2.0"
      quantity: quantity,
      order_details: orderDetails,
      unit_price: priceResult.unitPrice,     // ราคาต่อหน่วยที่คำนวณแล้ว
      subtotal: priceResult.totalPrice,      // ราคารวม
      added_at: new Date().toISOString()     // เวลาที่เพิ่ม
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
    showNotification(
      `เพิ่ม ${productName} (${customSize}) ลงตะกร้าสำเร็จ!`, 
      "success"
    );

    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove("btn-success");
      button.disabled = false;
    }, 2000);

    // Log for debugging
    console.log("✅ Added to cart:", cartItem);
  });
});

// ======= CART MANAGEMENT FUNCTIONS =======
function addToCart(cartItem) {
  // Get existing cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Check if product already exists in cart (same product ID and custom size)
  const existingItemIndex = cart.findIndex(item => 
    item.product_id === cartItem.product_id && 
    item.custom_size === cartItem.custom_size  // ✅ เปลี่ยนจาก product_size เป็น custom_size
  );

  if (existingItemIndex > -1) {
    // Update quantity if item exists
    const oldQuantity = cart[existingItemIndex].quantity;
    cart[existingItemIndex].quantity += cartItem.quantity;
    
    // อัปเดต unit_price และ subtotal
    cart[existingItemIndex].unit_price = cartItem.unit_price;
    cart[existingItemIndex].subtotal = cart[existingItemIndex].quantity * cartItem.unit_price;
    
    // อัปเดต timestamp
    cart[existingItemIndex].updated_at = new Date().toISOString();
    
    console.log(`📦 Updated existing item in cart:`);
    console.log(`  - Product: ${cartItem.product_name}`);
    console.log(`  - Size: ${cartItem.custom_size} (×${cartItem.scale_multiplier})`);
    console.log(`  - Quantity: ${oldQuantity} → ${cart[existingItemIndex].quantity}`);
    console.log(`  - Unit Price: ${cartItem.unit_price.toFixed(2)}฿`);
    console.log(`  - Subtotal: ${cart[existingItemIndex].subtotal.toFixed(2)}฿`);
  } else {
    // Add new item to cart
    cart.push(cartItem);
    
    console.log(`🆕 Added new item to cart:`);
    console.log(`  - Product: ${cartItem.product_name}`);
    console.log(`  - Original Size: ${cartItem.original_size}`);
    console.log(`  - Custom Size: ${cartItem.custom_size} (×${cartItem.scale_multiplier})`);
    console.log(`  - Quantity: ${cartItem.quantity}`);
    console.log(`  - Unit Price: ${cartItem.unit_price.toFixed(2)}฿`);
    console.log(`  - Subtotal: ${cartItem.subtotal.toFixed(2)}฿`);
  }

  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart badge if exists
  updateCartBadge();
  
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  
  console.log(`🛒 Cart Summary:`);
  console.log(`  - Unique items: ${cart.length}`);
  console.log(`  - Total quantity: ${totalQuantity}`);
  console.log(`  - Grand total: ${grandTotal.toFixed(2)}฿`);
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
window.setScale = setScale;
window.toggleLockRatio = toggleLockRatio;
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
