// Toy Detail JavaScript Functions

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

// Price calculation function
function updatePrice() {
  const quantity = parseInt(document.getElementById("quantity").value);
  // ดึงราคาฐานจาก HTML
  const basePrice = getBasePrice();
  
  if (basePrice === 0) {
      console.error("ไม่พบราคาฐานสินค้า (basePrice is 0 or not found in data-attribute).");
  }
  
  const totalPrice = quantity * basePrice;

  // Update price displays
  // ใช้ basePrice ที่ดึงมาจาก database มาแสดง
  document.getElementById("unitPrice").textContent = basePrice.toFixed(2) + "฿";
  document.getElementById("totalPrice").textContent =
    totalPrice.toFixed(2) + "฿";
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Initialize price calculation
  updatePrice();

  // Add event listener for quantity input changes
  document.getElementById("quantity").addEventListener("input", updatePrice);

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
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;
    const customSize = width + ":" + height;

    // Create cart item object
    const cartItem = {
      product_id: productId,
      product_name: productName,
      product_price: productPrice,
      product_image: productImage,
      product_size: customSize,
      quantity: quantity,
      order_details: orderDetails,
      subtotal: productPrice * quantity
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
