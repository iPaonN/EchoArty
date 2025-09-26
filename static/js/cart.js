// Cart page functionality for Flask/Bootstrap application
document.addEventListener("DOMContentLoaded", function () {
  initializeCartFunctionality();
});

function initializeCartFunctionality() {
  setupQuantityControls();
  setupProductModals();
  setupPaymentModal();
  setupSlipUpload();
  updateCartTotals();
}

// ======= QUANTITY CONTROLS =======
function setupQuantityControls() {
  document.querySelectorAll(".quantity-controls").forEach((container) => {
    const decreaseBtn = container.querySelector(".btn-decrease");
    const increaseBtn = container.querySelector(".btn-increase");
    const quantitySpan = container.querySelector(".quantity-value");
    const productId = container.closest("tr").dataset.productId;

    decreaseBtn.addEventListener("click", () => {
      updateQuantity(productId, -1, quantitySpan);
    });

    increaseBtn.addEventListener("click", () => {
      updateQuantity(productId, 1, quantitySpan);
    });
  });
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

  // Optional: Send to server (uncomment when backend is ready)
  // updateQuantityOnServer(productId, newQuantity);
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
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=promptpay://0123456789/${amount}" 
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

function submitPayment() {
  const fileInput = document.getElementById("slipFile");
  if (!fileInput.files.length) {
    showNotification("กรุณาเลือกไฟล์หลักฐานการชำระเงิน", "warning");
    return;
  }

  // Simulate payment submission
  showNotification("กำลังส่งข้อมูล...", "info");

  setTimeout(() => {
    showNotification(
      "ส่งหลักฐานการชำระเงินสำเร็จ! เรากำลังตรวจสอบการชำระเงินของคุณ",
      "success"
    );

    // Close modal after success
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("qrModal")
      );
      if (modal) modal.hide();
    }, 2000);
  }, 1500);
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
      price: parseFloat(button.getAttribute("data-product-price")) || 0,
      size: button.getAttribute("data-product-size") || "1:1",
      quantity: parseInt(button.getAttribute("data-product-quantity")) || 1,
      product_id: button.getAttribute("data-product-id") || "",
    };

    // Debug logging
    console.log("Product data:", productData);

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

    // Set product price
    const modalProductPrice = modal.querySelector("#modalProductPrice");
    if (modalProductPrice) {
      modalProductPrice.textContent = productData.price.toFixed(2);
    }

    // Set product size/ratio
    const modalProductSize = modal.querySelector("#modalProductSize");
    if (modalProductSize) {
      modalProductSize.textContent = productData.size;
    }

    // Set product quantity
    const modalProductQuantity = modal.querySelector("#modalProductQuantity");
    if (modalProductQuantity) {
      modalProductQuantity.textContent = productData.quantity;
    }

    // Calculate and set total price
    const modalProductTotal = modal.querySelector("#modalProductTotal");
    if (modalProductTotal) {
      const total = (productData.price * productData.quantity).toFixed(2);
      modalProductTotal.textContent = total;
    }

    // Set product description (default message for now)
    const modalProductDetail = modal.querySelector("#modalProductDetail");
    if (modalProductDetail) {
      modalProductDetail.textContent = `รายละเอียดสินค้า ${
        productData.name
      } - ขนาดอัตราส่วน ${productData.size} ราคา ฿${productData.price.toFixed(
        2
      )} ต่อชิ้น`;
    }

    // Show the modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    console.log("Modal should be displayed now");
  } catch (error) {
    console.error("Error showing product detail modal:", error);
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
