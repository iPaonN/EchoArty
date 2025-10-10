// AllOrder page JavaScript functionality

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
  setupSearch();
  setupFilters();
  setupSort();
  initializeOrderCount();
});

let searchTimeout = null;

// ======= SEARCH FUNCTIONALITY =======
function setupSearch() {
  const searchInput = document.getElementById('orderSearch');
  const clearBtn = document.getElementById('clearSearchBtn');
  
  if (!searchInput) return;
  
  searchInput.addEventListener('input', function() {
    const query = this.value.trim();
    
    // Show/hide clear button
    if (clearBtn) {
      clearBtn.style.display = query ? 'block' : 'none';
    }
    
    // Debounce search
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  });
  
  // Clear search
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      searchInput.value = '';
      searchInput.focus();
      clearBtn.style.display = 'none';
      performSearch('');
    });
  }
}

function performSearch(query) {
  const rows = document.querySelectorAll('#orderTableBody .order-row');
  const searchResultCount = document.getElementById('searchResultCount');
  let visibleCount = 0;
  
  const lowerQuery = query.toLowerCase();
  
  rows.forEach(row => {
    const orderId = row.querySelector('td:first-child')?.textContent.toLowerCase() || '';
    const productName = row.querySelector('.product-name')?.textContent.toLowerCase() || '';
    const description = row.querySelector('.order-description')?.textContent.toLowerCase() || '';
    
    const matches = !query || 
                    orderId.includes(lowerQuery) || 
                    productName.includes(lowerQuery) ||
                    description.includes(lowerQuery);
    
    if (matches) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });
  
  // Update search result count
  if (searchResultCount) {
    if (query && visibleCount < rows.length) {
      searchResultCount.textContent = `พบ ${visibleCount} รายการ`;
      searchResultCount.style.display = 'inline-block';
    } else {
      searchResultCount.style.display = 'none';
    }
  }
  
  updateOrderCount();
  showNoResultsMessage(visibleCount === 0 && query !== '');
}

function showNoResultsMessage(show) {
  const tableBody = document.getElementById('orderTableBody');
  let noResultsRow = document.getElementById('noSearchResults');
  
  if (show && !noResultsRow) {
    noResultsRow = document.createElement('tr');
    noResultsRow.id = 'noSearchResults';
    noResultsRow.innerHTML = `
      <td colspan="7" class="text-center py-5">
        <i class="fas fa-search fa-3x text-muted mb-3 d-block"></i>
        <h5 class="text-muted">ไม่พบคำสั่งซื้อที่ค้นหา</h5>
        <p class="text-muted">ลองเปลี่ยนคำค้นหาหรือกรองด้วยสถานะอื่น</p>
      </td>
    `;
    tableBody.appendChild(noResultsRow);
  } else if (!show && noResultsRow) {
    noResultsRow.remove();
  }
}

// ======= FILTER FUNCTIONALITY =======
function setupFilters() {
  const statusFilter = document.getElementById('statusFilter');
  if (!statusFilter) return;
  
  statusFilter.addEventListener('change', function() {
    applyFilters();
  });
}

function applyFilters() {
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';
  const rows = document.querySelectorAll('#orderTableBody .order-row');
  
  rows.forEach(row => {
    const status = row.dataset.status;
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    if (matchesStatus && row.style.display !== 'none') {
      row.style.display = '';
    } else if (!matchesStatus) {
      row.style.display = 'none';
    }
  });
  
  updateOrderCount();
}

// ======= SORT FUNCTIONALITY =======
function setupSort() {
  const sortOrder = document.getElementById('sortOrder');
  if (!sortOrder) return;
  
  sortOrder.addEventListener('change', function() {
    sortOrders(this.value);
  });
}

function sortOrders(order) {
  const tbody = document.getElementById('orderTableBody');
  const rows = Array.from(tbody.querySelectorAll('.order-row'));
  
  rows.sort((a, b) => {
    const dateA = new Date(a.dataset.date);
    const dateB = new Date(b.dataset.date);
    
    if (order === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });
  
  rows.forEach(row => tbody.appendChild(row));
}

// ======= ORDER COUNT =======
function initializeOrderCount() {
  updateOrderCount();
}

function updateOrderCount() {
  const rows = document.querySelectorAll('#orderTableBody .order-row');
  const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
  const orderCount = document.getElementById('orderCount');
  
  if (orderCount && rows.length > 0) {
    orderCount.innerHTML = `<i class="fas fa-box me-1"></i> แสดง ${visibleRows.length} จาก ${rows.length} คำสั่งซื้อ`;
  }
}

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
