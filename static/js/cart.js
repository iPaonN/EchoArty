// Cart page functionality for Flask/Bootstrap application
document.addEventListener("DOMContentLoaded", function () {
  loadCartFromLocalStorage();
  initializeCartFunctionality();
});

function initializeCartFunctionality() {
  setupQuantityControls();
  setupProductModals();
  setupPaymentModal();
  setupSlipUpload();
  updateCartTotals();
}

// ======= LOAD CART FROM LOCALSTORAGE =======
function loadCartFromLocalStorage() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart.length === 0) {
    // Show empty cart message
    const tbody = document.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4">
            <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
            <p class="text-muted">รถเข็นของคุณว่างเปล่า</p>
            <a href="/gallery" class="btn btn-primary mt-2">
              <i class="fas fa-shopping-bag me-2"></i>เริ่มช้อปปิ้งของเล่น
            </a>
          </td>
        </tr>
      `;
    }
    return;
  }

  // Render cart items
  renderCartItems(cart);
}

function renderCartItems(cart) {
  const tbody = document.querySelector('tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  cart.forEach((item, index) => {
    const row = document.createElement('tr');
    row.setAttribute('data-product-id', item.product_id);
    row.setAttribute('data-cart-index', index);
    
    // ใช้ unit_price ถ้ามี ไม่งั้นใช้ product_price (backward compatible)
    const unitPrice = item.unit_price || item.product_price;
    const subtotal = item.subtotal || (unitPrice * item.quantity);
    
    // แสดงขนาดที่เลือก
    const displaySize = item.custom_size || item.product_size || '1:1';
    const scaleInfo = item.scale_multiplier ? ` <span class="badge bg-info">×${item.scale_multiplier}</span>` : '';
    
    row.innerHTML = `
      <td>
        <img
          src="/static/images/products/${item.product_image || 'dummy.jpg'}"
          alt="${item.product_name}"
          class="cart-item-image"
          style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"
        />
      </td>
      <td>
        ${item.product_name}
        ${item.original_size && item.custom_size !== item.original_size ? 
          `<br><small class="text-muted">เดิม: ${item.original_size}</small>` : ''}
      </td>
      <td class="text-muted"><small>฿${parseFloat(item.product_price).toFixed(2)}</small></td>
      <td>${displaySize}${scaleInfo}</td>
      <td class="text-center">
        <div class="quantity-controls">
          <button
            class="btn btn-outline-danger btn-sm btn-decrease"
            type="button"
          >
            <i class="fas fa-minus"></i>
          </button>
          <span class="quantity-value mx-2">${item.quantity}</span>
          <button
            class="btn btn-outline-success btn-sm btn-increase"
            type="button"
          >
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </td>
      <td class="price-value"><strong>฿${parseFloat(unitPrice).toFixed(2)}</strong></td>
      <td class="subtotal-value"><strong>฿${parseFloat(subtotal).toFixed(2)}</strong></td>
      <td class="text-center">
        <div class="d-flex gap-2 justify-content-center flex-nowrap">
          <button
            type="button"
            class="btn btn-info btn-sm"
            onclick="showDetailModal(this)"
            data-product-name="${item.product_name}"
            data-product-image="${item.product_image || 'dummy.jpg'}"
            data-product-price="${item.product_price}"
            data-unit-price="${unitPrice}"
            data-original-size="${item.original_size || item.product_size || '1:1'}"
            data-custom-size="${displaySize}"
            data-scale-multiplier="${item.scale_multiplier || '1.0'}"
            data-product-quantity="${item.quantity}"
            data-product-id="${item.product_id}"
            data-product-details="${item.order_details || ''}"
            title="ดูรายละเอียด"
          >
            <i class="fas fa-info-circle me-1"></i>รายละเอียด
          </button>
          <button
            type="button"
            class="btn btn-danger btn-sm btn-remove"
            title="ลบสินค้า"
          >
            <i class="fas fa-trash-alt me-1"></i>ลบ
          </button>
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
  });

  // Show cart totals section if items exist
  showCartTotalsSection(cart.length > 0);
  
  // Re-initialize controls
  setupQuantityControls();
  updateCartTotals();
}

function showCartTotalsSection(show) {
  const totalsSection = document.querySelector('.row.mt-4.justify-content-center');
  if (totalsSection) {
    totalsSection.style.display = show ? 'flex' : 'none';
  }
}

// ======= QUANTITY CONTROLS =======
function setupQuantityControls() {
  document.querySelectorAll(".quantity-controls").forEach((container) => {
    const decreaseBtn = container.querySelector(".btn-decrease");
    const increaseBtn = container.querySelector(".btn-increase");
    const row = container.closest("tr");
    const cartIndex = parseInt(row.dataset.cartIndex);

    // Remove old listeners by cloning
    const newDecreaseBtn = decreaseBtn.cloneNode(true);
    const newIncreaseBtn = increaseBtn.cloneNode(true);
    decreaseBtn.parentNode.replaceChild(newDecreaseBtn, decreaseBtn);
    increaseBtn.parentNode.replaceChild(newIncreaseBtn, increaseBtn);

    newDecreaseBtn.addEventListener("click", () => {
      updateQuantityInCart(cartIndex, -1);
    });

    newIncreaseBtn.addEventListener("click", () => {
      updateQuantityInCart(cartIndex, 1);
    });
  });

  // Setup remove buttons
  document.querySelectorAll(".btn-remove").forEach((btn) => {
    const row = btn.closest("tr");
    const cartIndex = parseInt(row.dataset.cartIndex);
    
    // Remove old listener by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener("click", () => {
      removeItemFromCart(cartIndex);
    });
  });
}

function updateQuantityInCart(cartIndex, change) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cartIndex < 0 || cartIndex >= cart.length) return;
  
  const newQuantity = Math.max(1, cart[cartIndex].quantity + change);
  const unitPrice = cart[cartIndex].unit_price || cart[cartIndex].product_price;
  
  cart[cartIndex].quantity = newQuantity;
  cart[cartIndex].subtotal = unitPrice * newQuantity; // ✅ ใช้ unit_price แทน product_price
  cart[cartIndex].updated_at = new Date().toISOString();
  
  console.log(`📦 Updated quantity: ${cart[cartIndex].product_name} - Qty: ${newQuantity}, Unit: ${unitPrice}฿, Subtotal: ${cart[cartIndex].subtotal}฿`);
  
  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Re-render cart
  renderCartItems(cart);
}

function removeItemFromCart(cartIndex) {
  if (!confirm('คุณต้องการลบสินค้านี้ออกจากตะกร้าหรือไม่?')) return;
  
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cartIndex < 0 || cartIndex >= cart.length) return;
  
  // Remove item
  cart.splice(cartIndex, 1);
  
  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Show notification
  showNotification('ลบสินค้าออกจากตะกร้าแล้ว', 'success');
  
  // Re-render cart
  renderCartItems(cart);
}

function updateQuantity(productId, change, quantityElement) {
  let currentQuantity = parseInt(quantityElement.textContent);
  let newQuantity = Math.max(1, currentQuantity + change);

  // Update display
  quantityElement.textContent = newQuantity;

  // Update subtotal for this item
  updateItemSubtotal(productId, newQuantity);

  // Update cart totals
  updateCartTotals();
}

function updateItemSubtotal(productId, quantity) {
  const row = document.querySelector(`tr[data-product-id="${productId}"]`);
  const priceElement = row.querySelector(".price-value");
  const subtotalElement = row.querySelector(".subtotal-value");

  if (priceElement && subtotalElement) {
    const price = parseFloat(priceElement.textContent.replace(/[^\d.-]/g, ""));
    const subtotal = price * quantity;
    subtotalElement.textContent = subtotal.toLocaleString("th-TH", {
      style: "currency",
      currency: "THB",
    });
  }
}

// ======= PRODUCT MODAL =======
function setupProductModals() {
  document
    .querySelectorAll(
      '[data-bs-toggle="modal"][data-bs-target="#productDetailModal"]'
    )
    .forEach((trigger) => {
      trigger.addEventListener("click", function () {
        const productId = this.dataset.productId;
        loadProductDetails(productId);
      });
    });
}

function loadProductDetails(productId) {
  // Find product data from the cart table
  const row = document.querySelector(`tr[data-product-id="${productId}"]`);
  if (!row) return;

  const productName =
    row.querySelector(".product-name")?.textContent || "Unknown Product";
  const productImage = row.querySelector(".cart-item-image")?.src || "";
  const productPrice = row.querySelector(".price-value")?.textContent || "0";

  // Update modal content
  const modal = document.getElementById("productDetailModal");
  modal.querySelector("#modalProductName").textContent = productName;
  modal.querySelector("#modalProductImage").src = productImage;
  modal.querySelector("#modalProductPrice").textContent = productPrice;

  // You can add more product details here when backend is ready
  modal.querySelector("#modalProductDescription").textContent =
    "Product description will be loaded from the database.";
}

// ======= PAYMENT MODAL =======
function setupPaymentModal() {
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      const total = calculateTotal();
      generateQRCode(total);
    });
  }
}

function generateQRCode(amount) {
  const qrContainer = document.getElementById("qrCodeContainer");
  const amountDisplay = document.getElementById("paymentAmount");

  // Update amount display
  if (amountDisplay) {
    amountDisplay.textContent = amount.toLocaleString("th-TH", {
      style: "currency",
      currency: "THB",
    });
  }

  // Show loading state
  qrContainer.innerHTML = '<div class="loading">กำลังสร้าง QR Code...</div>';

  // Simulate QR code generation (replace with actual implementation)
  setTimeout(() => {
    qrContainer.innerHTML = `
            <div class="text-center">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=promptpay://0972073201/${amount}" 
                     alt="QR Code for payment" class="img-fluid">
                <div class="qr-info mt-2">
                    <small class="text-muted">สแกน QR Code เพื่อชำระเงิน</small>
                </div>
            </div>
        `;
  }, 1000);
}

// ======= SLIP UPLOAD =======
function setupSlipUpload() {
  const fileInput = document.getElementById("slipFile");
  const previewContainer = document.getElementById("slipPreview");
  const statusDiv = document.getElementById("uploadStatus");

  if (fileInput) {
    fileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        previewSlip(file, previewContainer);
        updateUploadStatus("กรุณารอสักครู่...", "text-info", statusDiv);

        // Simulate upload process
        setTimeout(() => {
          updateUploadStatus("อัปโหลดสำเร็จ!", "status-success", statusDiv);
        }, 1500);
      }
    });
  }
}

async function submitPayment() {
  const fileInput = document.getElementById("slipFile");
  if (!fileInput.files.length) {
    showNotification("กรุณาเลือกไฟล์หลักฐานการชำระเงิน", "warning");
    return;
  }

  // Check if user is logged in
  const userId = sessionStorage.getItem('user_id') || localStorage.getItem('user_id');
  if (!userId) {
    showNotification("กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน", "warning");
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
    return;
  }

  // Get cart items
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    showNotification("ตะกร้าสินค้าว่างเปล่า", "warning");
    return;
  }

  // Get user info for shipping address
  const userInfo = JSON.parse(sessionStorage.getItem('user_info') || localStorage.getItem('user_info') || '{}');
  const shippingAddress = userInfo.street_address 
    ? `${userInfo.street_address}, ${userInfo.city}, ${userInfo.postal_code}` 
    : 'กรุณาระบุที่อยู่จัดส่ง';

  showNotification("กำลังส่งข้อมูล...", "info");

  try {
    // Create checkout request
    const response = await fetch('/api/cart/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        u_id: parseInt(userId),
        cart_items: cart,
        shipping_address: shippingAddress
      })
    });

    const result = await response.json();

    if (result.success) {
      // Clear cart after successful checkout
      localStorage.removeItem('cart');
      
      showNotification(
        `สั่งซื้อสำเร็จ! สร้างออเดอร์ ${result.data.total_orders} รายการ`,
        "success"
      );

      // Close modal after success
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("qrModal")
        );
        if (modal) modal.hide();
        
        // Redirect to orders page or reload
        window.location.href = '/allorder';
      }, 2000);
    } else {
      showNotification(
        `เกิดข้อผิดพลาด: ${result.message}`,
        "danger"
      );
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showNotification(
      "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง",
      "danger"
    );
  }
}

function previewSlip(file, container) {
  const reader = new FileReader();
  reader.onload = function (e) {
    container.innerHTML = `
            <div class="preview-container">
                <img src="${e.target.result}" alt="Slip preview" class="img-fluid">
            </div>
        `;
    container.style.display = "block";
  };
  reader.readAsDataURL(file);
}

function updateUploadStatus(message, className, container) {
  if (container) {
    container.textContent = message;
    container.className = `upload-status ${className}`;
    container.style.display = "block";
  }
}

// ======= CART CALCULATIONS =======
function updateCartTotals() {
  const subtotal = calculateSubtotal();
  const shipping = 50; // Fixed shipping cost
  const total = subtotal + shipping;

  // Update display elements
  const subtotalElement = document.getElementById("cartSubtotal");
  const shippingElement = document.getElementById("cartShipping");
  const totalElement = document.getElementById("cartTotal");

  if (subtotalElement) {
    subtotalElement.textContent = subtotal.toLocaleString("th-TH", {
      style: "currency",
      currency: "THB",
    });
  }

  if (shippingElement) {
    shippingElement.textContent = shipping.toLocaleString("th-TH", {
      style: "currency",
      currency: "THB",
    });
  }

  if (totalElement) {
    totalElement.textContent = total.toLocaleString("th-TH", {
      style: "currency",
      currency: "THB",
    });
  }
}

function calculateSubtotal() {
  let subtotal = 0;
  document.querySelectorAll(".subtotal-value").forEach((element) => {
    const value = parseFloat(element.textContent.replace(/[^\d.-]/g, ""));
    if (!isNaN(value)) {
      subtotal += value;
    }
  });
  return subtotal;
}

function calculateTotal() {
  const subtotal = calculateSubtotal();
  const shipping = 50;
  return subtotal + shipping;
}

// ======= REMOVE ITEM =======
function removeItem(productId) {
  if (confirm("คุณต้องการลบสินค้านี้ออกจากตะกร้าหรือไม่?")) {
    const row = document.querySelector(`tr[data-product-id="${productId}"]`);
    if (row) {
      row.remove();
      updateCartTotals();

      // Optional: Update server (uncomment when backend is ready)
      // removeItemFromServer(productId);
    }
  }
}

// ======= SERVER COMMUNICATION (for future implementation) =======
/*
function updateQuantityOnServer(productId, quantity) {
    fetch('/api/cart/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_id: productId,
            quantity: quantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error('Failed to update quantity on server');
        }
    })
    .catch(error => {
        console.error('Error updating quantity:', error);
    });
}

function removeItemFromServer(productId) {
    fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_id: productId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error('Failed to remove item from server');
        }
    })
    .catch(error => {
        console.error('Error removing item:', error);
    });
}
*/

// ======= PRODUCT DETAIL MODAL =======
function showDetailModal(button) {
  try {
    // Get product data from button's data attributes
    const productData = {
      name: button.getAttribute("data-product-name") || "ไม่ระบุชื่อสินค้า",
      image: button.getAttribute("data-product-image") || "dummy.jpg",
      basePrice: parseFloat(button.getAttribute("data-product-price")) || 0,
      unitPrice: parseFloat(button.getAttribute("data-unit-price")) || 0,
      originalSize: button.getAttribute("data-original-size") || "1:1",
      customSize: button.getAttribute("data-custom-size") || "1:1",
      scaleMultiplier: button.getAttribute("data-scale-multiplier") || "1.0",
      quantity: parseInt(button.getAttribute("data-product-quantity")) || 1,
      product_id: button.getAttribute("data-product-id") || "",
      details: button.getAttribute("data-product-details") || "",
    };

    // Debug logging
    console.log("📋 Product detail modal data:", productData);

    // Update modal content
    const modal = document.getElementById("productDetailModal");
    if (!modal) {
      console.error("Modal element not found");
      showNotification("ไม่พบ Modal สำหรับแสดงรายละเอียดสินค้า", "error");
      return;
    }

    // Set product name
    const modalProductName = modal.querySelector("#modalProductName");
    if (modalProductName) {
      modalProductName.textContent = productData.name;
    }

    // Set product image
    const modalProductImage = modal.querySelector("#modalProductImage");
    if (modalProductImage) {
      const imagePath = `/static/images/products/${productData.image}`;
      modalProductImage.src = imagePath;
      modalProductImage.alt = productData.name;
    }

    // Set base price
    const modalBasePrice = modal.querySelector("#modalProductBasePrice");
    if (modalBasePrice) {
      modalBasePrice.textContent = productData.basePrice.toFixed(2);
    }

    // Set original size
    const modalOriginalSize = modal.querySelector("#modalOriginalSize");
    if (modalOriginalSize) {
      modalOriginalSize.textContent = productData.originalSize;
    }

    // Set custom size
    const modalCustomSize = modal.querySelector("#modalCustomSize");
    if (modalCustomSize) {
      modalCustomSize.textContent = productData.customSize;
    }

    // Set scale badge
    const modalScaleBadge = modal.querySelector("#modalScaleBadge");
    if (modalScaleBadge) {
      modalScaleBadge.textContent = `×${productData.scaleMultiplier}`;
      
      // เปลี่ยนสีตาม scale
      const scale = parseFloat(productData.scaleMultiplier);
      if (scale > 1) {
        modalScaleBadge.className = 'badge bg-success ms-1';
      } else if (scale < 1) {
        modalScaleBadge.className = 'badge bg-warning ms-1';
      } else {
        modalScaleBadge.className = 'badge bg-info ms-1';
      }
    }

    // Set unit price
    const modalUnitPrice = modal.querySelector("#modalUnitPrice");
    if (modalUnitPrice) {
      modalUnitPrice.textContent = productData.unitPrice.toFixed(2);
    }

    // Set product quantity
    const modalProductQuantity = modal.querySelector("#modalProductQuantity");
    if (modalProductQuantity) {
      modalProductQuantity.textContent = productData.quantity;
    }

    // Calculate and set total price
    const modalProductTotal = modal.querySelector("#modalProductTotal");
    if (modalProductTotal) {
      const total = (productData.unitPrice * productData.quantity).toFixed(2);
      modalProductTotal.textContent = total;
    }

    // Set product description from order_details
    const modalProductDetail = modal.querySelector("#modalProductDetail");
    if (modalProductDetail) {
      if (productData.details && productData.details.trim() !== '') {
        modalProductDetail.textContent = productData.details;
      } else {
        const sizeChange = productData.originalSize !== productData.customSize 
          ? ` (ปรับจาก ${productData.originalSize} เป็น ${productData.customSize})`
          : '';
        modalProductDetail.textContent = `รายละเอียดสินค้า ${productData.name}${sizeChange} - ราคา ฿${productData.unitPrice.toFixed(2)} ต่อชิ้น`;
      }
    }

    // Show the modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    console.log("✅ Modal displayed successfully");
  } catch (error) {
    console.error("❌ Error showing product detail modal:", error);
    showNotification(
      `เกิดข้อผิดพลาดในการแสดงรายละเอียดสินค้า: ${error.message}`,
      "error"
    );
  }
}

// ======= UTILITY FUNCTIONS =======
function showNotification(message, type = "info") {
  // Create toast notification (Bootstrap 5)
  const toastHTML = `
        <div class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

  // Add to toast container (create if doesn't exist)
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.className =
      "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(toastContainer);
  }

  toastContainer.insertAdjacentHTML("beforeend", toastHTML);

  // Show the toast
  const toastElement = toastContainer.lastElementChild;
  const toast = new bootstrap.Toast(toastElement);
  toast.show();

  // Remove from DOM after hiding
  toastElement.addEventListener("hidden.bs.toast", function () {
    this.remove();
  });
}
