// Gallery Detail JavaScript Functions

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

// Price calculation function
function updatePrice() {
  const quantity = parseInt(document.getElementById("quantity").value);
  const basePrice = 800; // Updated base price
  const totalPrice = quantity * basePrice;

  // Update price displays
  document.getElementById("unitPrice").textContent = basePrice + "฿";
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

  // Form submission handling
  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();

    const orderTitle = document.getElementById("orderTitle").value.trim();
    const orderDetails = document.getElementById("orderDetails").value.trim();
    const quantity = document.getElementById("quantity").value;
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;

    // Basic validation
    if (!orderTitle) {
      alert("กรุณากรอกรายละเอียด");
      document.getElementById("orderTitle").focus();
      return;
    }

    if (!orderDetails) {
      alert("กรุณากรอกรายละเอียดเพิ่มเติม");
      document.getElementById("orderDetails").focus();
      return;
    }

    // Show success message
    const button = document.querySelector(".btn-submit");
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check me-2"></i>เพิ่มเข้ารถเข็นแล้ว';
    button.classList.add("btn-success");
    button.disabled = true;

    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove("btn-success");
      button.disabled = false;
    }, 2000);

    // Log form data for debugging
    console.log("Order submitted:", {
      title: orderTitle,
      details: orderDetails,
      quantity: quantity,
      dimensions: width + ":" + height,
      totalPrice: document.getElementById("totalPrice").textContent,
    });
  });
});

// Global functions for button onclick events
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
