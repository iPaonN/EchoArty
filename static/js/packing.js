// Packing page functionality for Flask/Bootstrap application
document.addEventListener("DOMContentLoaded", function () {
  initializePacking();
});

function initializePacking() {
  setupModals();
  setupNotifications();
}

// ======= STATUS TRANSLATIONS =======
const STATUS_TRANSLATIONS = {
  Pending: "Pending (รอดำเนินการ)",
  Processing: "Processing (กำลังดำเนินการ)",
  Packing: "Packing (กำลังแพ็ค)",
  Delivery: "Delivery (กำลังจัดส่ง)",
  Complete: "Complete (เสร็จสิ้น)",
  Cancelled: "Cancelled (ยกเลิก)",
};

// Map status names to status IDs
const STATUS_TO_ID = {
  Pending: 1,
  Processing: 2,
  Packing: 3,
  Delivery: 4,
  Complete: 5,
  Cancelled: 6,
};

// ======= MODAL MANAGEMENT =======
function setupModals() {
  // Setup Bootstrap image modal
  const imageModal = new bootstrap.Modal(document.getElementById("imageModal"));
  window.imageModalInstance = imageModal;
}

// ======= STATUS MANAGEMENT =======
function changeStatus(statusElementId, status, orderId) {
  const statusElement = document.getElementById(statusElementId);

  if (!statusElement) {
    console.error("Status element not found:", statusElementId);
    return;
  }

  // Remove all existing status classes
  statusElement.classList.remove(
    "status-pending",
    "status-processing",
    "status-packing",
    "status-delivery",
    "status-success",
    "status-failed",
    "bg-secondary",
    "bg-info",
    "bg-primary",
    "bg-warning",
    "bg-success",
    "bg-danger"
  );

  // Add animation class
  statusElement.classList.add("status-changing");

  // Add appropriate status class and update text
  let statusClass = "";
  let notificationType = "";

  switch (status) {
    case "Pending":
      statusClass = "status-pending";
      notificationType = "info";
      break;
    case "Processing":
      statusClass = "status-processing";
      notificationType = "info";
      break;
    case "Packing":
      statusClass = "status-packing";
      notificationType = "packing";
      break;
    case "Delivery":
      statusClass = "status-delivery";
      notificationType = "info";
      break;
    case "Complete":
      statusClass = "status-success";
      notificationType = "success";
      break;
    case "Cancelled":
      statusClass = "status-failed";
      notificationType = "failed";
      break;
    default:
      statusClass = "bg-secondary";
      notificationType = "info";
  }

  statusElement.classList.add(statusClass);
  statusElement.textContent = STATUS_TRANSLATIONS[status] || status;

  // Remove animation class after animation completes
  setTimeout(() => {
    statusElement.classList.remove("status-changing");
  }, 500);

  // Show notification with appropriate color
  showNotification(
    `อัปเดตสถานะเป็น "${STATUS_TRANSLATIONS[status]}" แล้ว`,
    notificationType
  );

  // Send request to update status in the database
  updateOrderStatusAPI(orderId, status);
}

// ======= API CALLS =======
async function updateOrderStatusAPI(orderId, status) {
  try {
    // Convert status name to status_id
    const statusId = STATUS_TO_ID[status];
    
    if (!statusId) {
      console.error("Invalid status:", status);
      showNotification("สถานะไม่ถูกต้อง", "error");
      return;
    }

    // Call backend API which will then call the main API
    const response = await fetch("/update-order-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({
        order_id: parseInt(orderId),
        status_id: statusId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update status");
    }

    if (!data.success) {
      showNotification(`ไม่สามารถอัปเดตสถานะได้: ${data.message}`, "error");
    } else {
      console.log("Status updated successfully:", data);
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    showNotification("ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่อีกครั้ง", "error");
  }
}

// ======= NOTIFICATION SYSTEM =======
function setupNotifications() {
  // Create notification container if it doesn't exist
  if (!document.getElementById("notification-container")) {
    const container = document.createElement("div");
    container.id = "notification-container";
    container.style.cssText = `
            position: fixed;
            bottom: 120px;
            right: 20px;
            z-index: 9999;
            pointer-events: none;
        `;
    document.body.appendChild(container);
  }
}

function showNotification(message, type = "success") {
  // Remove existing notification
  const existingNotification = document.getElementById("status-notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create new notification
  const notification = document.createElement("div");
  notification.id = "status-notification";

  // Define colors based on status type
  let bgColor, textColor, shadowColor;

  switch (type) {
    case "success":
      bgColor = "linear-gradient(45deg, #4CAF50, #66BB6A)";
      textColor = "white";
      shadowColor = "rgba(76, 175, 80, 0.3)";
      break;
    case "failed":
    case "error":
      bgColor = "linear-gradient(45deg, #F44336, #EF5350)";
      textColor = "white";
      shadowColor = "rgba(244, 67, 54, 0.3)";
      break;
    case "packing":
      bgColor = "linear-gradient(45deg, #2196F3, #42A5F5)";
      textColor = "white";
      shadowColor = "rgba(33, 150, 243, 0.3)";
      break;
    case "waiting":
    case "warning":
      bgColor = "linear-gradient(45deg, #FFC107, #FFB74D)";
      textColor = "#333";
      shadowColor = "rgba(255, 193, 7, 0.3)";
      break;
    default:
      bgColor = "linear-gradient(45deg, #2196f3, #42a5f5)";
      textColor = "white";
      shadowColor = "rgba(33, 150, 243, 0.3)";
  }

  notification.style.cssText = `
        position: fixed;
        bottom: 120px;
        right: 20px;
        background: ${bgColor};
        color: ${textColor};
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px ${shadowColor};
        z-index: 9999;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInNotification 0.5s ease-out;
        pointer-events: auto;
        cursor: pointer;
        max-width: 350px;
        word-wrap: break-word;
        border: 2px solid rgba(255, 255, 255, 0.8);
    `;

  const icon =
    type === "success"
      ? "fa-check-circle"
      : type === "failed" || type === "error"
      ? "fa-exclamation-circle"
      : type === "packing"
      ? "fa-box"
      : type === "waiting" || type === "warning"
      ? "fa-clock"
      : "fa-info-circle";

  notification.innerHTML = `<i class="fas ${icon}"></i> ${message}`;

  // Add click to dismiss
  notification.addEventListener("click", () => {
    notification.remove();
  });

  document.body.appendChild(notification);

  // Auto remove after 4 seconds
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.style.animation = "slideOutNotification 0.5s ease-in";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 500);
    }
  }, 4000);
}

// ======= IMAGE MODAL FUNCTIONS =======
function viewImages(billSrc, productSrc) {
  const billImage = document.getElementById("billImage");
  const productImage = document.getElementById("productImage");

  if (!billImage || !productImage) {
    console.error("Image elements not found");
    return;
  }

  // Set image sources
  billImage.src = billSrc;
  productImage.src = productSrc;

  // Add error handling for images
  billImage.onerror = function () {
    this.src = "/static/images/placeholder.jpg";
    this.alt = "ไม่พบรูปใบเสร็จ";
  };

  productImage.onerror = function () {
    this.src = "/static/images/placeholder.jpg";
    this.alt = "ไม่พบรูปสินค้า";
  };

  // Show the modal
  if (window.imageModalInstance) {
    window.imageModalInstance.show();
  }
}

function closeImageModal() {
  if (window.imageModalInstance) {
    window.imageModalInstance.hide();
  }
}

// ======= UTILITY FUNCTIONS =======
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    return dateString;
  }
}

function formatOrderId(orderId) {
  return String(orderId).padStart(6, "0");
}

function truncateText(text, maxLength = 50) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// ======= CSS ANIMATIONS (Added via JavaScript) =======
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInNotification {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutNotification {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    @keyframes statusChange {
        0% { 
            transform: scale(0.9); 
            opacity: 0.7; 
        }
        50% { 
            transform: scale(1.05); 
        }
        100% { 
            transform: scale(1); 
            opacity: 1; 
        }
    }
    
    .status-changing {
        animation: statusChange 0.5s ease;
    }
`;
document.head.appendChild(style);

// ======= ERROR HANDLING =======
window.addEventListener("error", function (e) {
  console.error("JavaScript Error:", e.error);
  showNotification("เกิดข้อผิดพลาดในระบบ กรุณารีเฟรชหน้าเว็บ", "error");
});

// ======= GLOBAL FUNCTIONS (for onclick handlers) =======
window.changeStatus = changeStatus;
window.viewImages = viewImages;
window.closeImageModal = closeImageModal;
window.showNotification = showNotification;
