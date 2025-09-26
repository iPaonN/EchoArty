// AllOrder page JavaScript functionality

/**
 * Function to view images in Bootstrap modal
 * @param {string} billSrc - Path to bill/receipt image
 * @param {string} productSrc - Path to product image
 */
function viewImages(billSrc, productSrc) {
  const billImage = document.getElementById("billImage");
  const productImage = document.getElementById("productImage");

  // Set image sources
  billImage.src = billSrc;
  productImage.src = productSrc;

  // Handle image loading errors
  billImage.onerror = function () {
    this.src = "/static/images/placeholder.png";
    this.alt = "ไม่พบรูปใบเสร็จ";
  };

  productImage.onerror = function () {
    this.src = "/static/images/placeholder.png";
    this.alt = "ไม่พบรูปสินค้า";
  };

  // Show the Bootstrap modal
  const modal = new bootstrap.Modal(document.getElementById("imageModal"));
  modal.show();
}

// Document ready event listener
document.addEventListener("DOMContentLoaded", function () {
  // Add click event for table rows to show hover effect
  const tableRows = document.querySelectorAll(".table tbody tr");

  tableRows.forEach((row) => {
    row.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-1px)";
      this.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
    });

    row.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "none";
    });
  });

  // Add loading state for image buttons
  const imageButtons = document.querySelectorAll(".btn-outline-purple");

  imageButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const originalText = this.innerHTML;
      this.innerHTML =
        '<i class="fas fa-spinner fa-spin me-1"></i> กำลังโหลด...';
      this.disabled = true;

      // Reset button after a short delay
      setTimeout(() => {
        this.innerHTML = originalText;
        this.disabled = false;
      }, 1000);
    });
  });

  // Enhanced table responsiveness
  const table = document.querySelector(".table");
  if (table && window.innerWidth < 768) {
    // Add mobile-friendly scrolling hint
    const tableContainer = table.closest(".table-responsive");
    if (tableContainer) {
      tableContainer.setAttribute("data-bs-toggle", "tooltip");
      tableContainer.setAttribute(
        "title",
        "เลื่อนซ้าย-ขวาเพื่อดูข้อมูลเพิ่มเติม"
      );
    }
  }
});

// Window resize handler for responsive adjustments
window.addEventListener("resize", function () {
  const isMobile = window.innerWidth < 768;
  const table = document.querySelector(".table");

  if (table) {
    if (isMobile) {
      table.classList.add("table-sm");
    } else {
      table.classList.remove("table-sm");
    }
  }
});
