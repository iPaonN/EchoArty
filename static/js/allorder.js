// AllOrder page JavaScript functionality

/**
 * Function to view images in Bootstrap modal
 * @param {string} customImg - Filename of custom image uploaded by customer
 * @param {string} billImg - Filename of payment slip image
 */
function viewImages(customImg, billImg) {
  console.log('🖼️ Opening image modal:', { customImg, billImg });
  
  const billImage = document.getElementById("billImage");
  const productImage = document.getElementById("productImage");
  const billCard = billImage.closest('.col-md-6');
  const productCard = productImage.closest('.col-md-6');

  // Build full paths for images
  const customImgPath = customImg ? `/static/images/customers/img_customize_products/${customImg}` : '';
  const billImgPath = billImg ? `/static/images/customers/slips/${billImg}` : '';

  console.log('📂 Image paths:', { customImgPath, billImgPath });

  // Handle custom product image
  if (customImgPath) {
    productImage.src = customImgPath;
    productCard.style.display = 'block';
    productImage.onerror = function () {
      console.warn('⚠️ Failed to load custom image:', customImgPath);
      this.src = "/static/images/placeholder.png";
      this.alt = "ไม่พบรูปสินค้า";
    };
  } else {
    productCard.style.display = 'none';
  }

  // Handle bill/slip image
  if (billImgPath) {
    billImage.src = billImgPath;
    billCard.style.display = 'block';
    billImage.onerror = function () {
      console.warn('⚠️ Failed to load slip image:', billImgPath);
      this.src = "/static/images/placeholder.png";
      this.alt = "ไม่พบรูปสลิป";
    };
  } else {
    billCard.style.display = 'none';
  }

  // Show the Bootstrap modal
  const modal = new bootstrap.Modal(document.getElementById("imageModal"));
  modal.show();
  
  console.log('✅ Modal opened successfully');
}

/**
 * Function to zoom image when clicked
 * @param {HTMLImageElement} img - Image element to zoom
 */
function zoomImage(img) {
  const src = img.src;
  const zoomWindow = window.open('', '_blank', 'width=800,height=600');
  zoomWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ดูรูปภาพ</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          background: #000;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        img {
          max-width: 100%;
          max-height: 100vh;
          object-fit: contain;
          box-shadow: 0 0 20px rgba(255,255,255,0.3);
        }
      </style>
    </head>
    <body>
      <img src="${src}" alt="Zoomed Image" />
    </body>
    </html>
  `);
}

// Document ready event listener
document.addEventListener("DOMContentLoaded", function () {
  // Add click to zoom functionality for modal images
  document.getElementById('billImage')?.addEventListener('click', function() {
    if (this.src && !this.src.includes('placeholder')) {
      zoomImage(this);
    }
  });
  
  document.getElementById('productImage')?.addEventListener('click', function() {
    if (this.src && !this.src.includes('placeholder')) {
      zoomImage(this);
    }
  });
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
