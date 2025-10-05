// Manage Product page functionality for Flask/Bootstrap application
document.addEventListener("DOMContentLoaded", function () {
  initializeManageProduct();
});

let currentProductId = null;
const API_BASE_URL = 'http://localhost:5000/api';
const IMAGE_BASE_URL = '/static/images/products/';

function initializeManageProduct() {
  setupModals();
  setupFormHandlers();
  setupImagePreviews();
  fetchProducts(); 
}

// ======= NOTIFICATION SYSTEM =======
function showNotification(message, type = "success") {
  // Remove existing notification
  const existingNotification = document.getElementById("status-notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create new notification
  const notification = document.createElement("div");
  notification.id = "status-notification";

  const bgColor =
    type === "success"
      ? "linear-gradient(45deg, #4CAF50, #66BB6A)"
      : type === "error"
      ? "linear-gradient(45deg, #f44336, #ef5350)"
      : type === "warning"
      ? "linear-gradient(45deg, #ff9800, #ffb74d)"
      : "linear-gradient(45deg, #2196f3, #42a5f5)";

  const textColor = type === "warning" ? "#333" : "white";
  const shadowColor =
    type === "success"
      ? "rgba(76, 175, 80, 0.3)"
      : type === "error"
      ? "rgba(244, 67, 54, 0.3)"
      : type === "warning"
      ? "rgba(255, 193, 7, 0.3)"
      : "rgba(33, 150, 243, 0.3)";

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
        border: 2px solid rgba(255, 255, 255, 0.8);
    `;

  const icon =
    type === "success"
      ? "fa-check-circle"
      : type === "error"
      ? "fa-exclamation-circle"
      : type === "warning"
      ? "fa-exclamation-triangle"
      : "fa-info-circle";

  notification.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
  document.body.appendChild(notification);

  // Auto remove after 4 seconds
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.style.animation = "slideOutNotification 0.5s ease-in";
      setTimeout(() => {
        notification.remove();
      }, 500);
    }
  }, 4000);
}

// ======= MODAL MANAGEMENT =======
function setupModals() {
  // Setup Bootstrap modals
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  const addModal = new bootstrap.Modal(document.getElementById("addModal"));
  const deleteModal = new bootstrap.Modal(
    document.getElementById("deleteModal")
  );

  // Store modal instances globally
  window.editModalInstance = editModal;
  window.addModalInstance = addModal;
  window.deleteModalInstance = deleteModal;

  // Setup delete confirmation handler
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", confirmDeleteProduct);
  }
}

async function openEditModal(productId) {
    try {
        currentProductId = productId; // Store the current product ID
        
        // Fetch product data from API
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch product data');
        }
        const product = result.data;
        console.log('Product data received:', product); // Debug log
        
        // Fill form fields
        document.getElementById('editProductName').value = product.name || product.product_name || '';
        document.getElementById('editDescription').value = product.description || '';
        document.getElementById('editPrice').value = product.price || 0;
        
        // Handle size ratio
        let x = '1', y = '1';
        if (product.size) {
            const parts = product.size.split(':');
            if (parts.length === 2) {
                [x, y] = parts;
            }
        }
        document.getElementById('edit_number_x').value = x;
        document.getElementById('edit_number_y').value = y;
        
        // Set categories
        const checkboxes = document.querySelectorAll('#editModal input[name="category[]"]');
        checkboxes.forEach(checkbox => {
            const categoryId = parseInt(checkbox.value);
            checkbox.checked = product.categories && product.categories.includes(categoryId);
        });
        
        // Show current image
        const previewImg = document.getElementById('editImagePreview');
        const noImageText = document.querySelector('#editModal .no-image-text');
        
        if (product.image) {
            previewImg.src = IMAGE_BASE_URL + product.image;
            previewImg.style.display = 'block';
            if (noImageText) noImageText.style.display = 'none';
        } else {
            previewImg.src = '/static/images/placeholder.jpg';
            previewImg.style.display = 'block';
            if (noImageText) noImageText.style.display = 'block';
        }
        
        // Store product ID for form submission
        const editForm = document.getElementById('editForm');
        editForm.dataset.productId = productId;
        
        // Show modal using the stored instance
        if (window.editModalInstance) {
            window.editModalInstance.show();
        }
        
    } catch (error) {
        console.error('Error fetching product data:', error);
        showNotification('Failed to load product data', 'error');
    }
}

// Handle edit form submission
document.getElementById('editForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productId = this.dataset.productId;
    if (!productId) {
        showNotification('Product ID not found', 'error');
        return;
    }

    const formData = new FormData(this);
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'PUT',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Close modal using stored instance
            if (window.editModalInstance) {
                window.editModalInstance.hide();
            }
            
            // Show success notification
            showNotification('Product updated successfully', 'success');
            
            // Refresh products display without page reload
            await fetchProducts();
        } else {
            showNotification('Error updating product: ' + result.message, 'error');
        }
        
    } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Failed to update product', 'error');
    }
});

function openAddModal() {
  // Reset form
  const form = document.getElementById("addForm");
  form.reset();

  // Reset image preview
  resetImagePreview("addImagePreview");

  // Reset ratio inputs
  document.getElementById("add_number_x").value = "1";
  document.getElementById("add_number_y").value = "1";

  // Reset checkboxes
  document
    .querySelectorAll('#addModal input[name="category[]"]')
    .forEach((checkbox) => {
      checkbox.checked = false;
    });

  // Show modal
  window.addModalInstance.show();
}

function closeEditModal() {
  window.editModalInstance.hide();
}

function closeAddModal() {
  window.addModalInstance.hide();
}

// ======= DATA FETCHING (SIMULATION) =======
async function fetchProducts() {
    const tableBody = document.getElementById('productTableBody');
    // แสดงข้อความกำลังโหลด
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center"><i class="fas fa-spinner fa-spin me-2"></i>กำลังโหลดข้อมูลสินค้า...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/manage-product`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        if (result.success) {
            renderProductTable(result.data);
            console.log(`โหลดข้อมูลสินค้าสำเร็จ: ${result.data.length} รายการ`);
            showNotification(`โหลดข้อมูลสินค้าสำเร็จ: ${result.data.length} รายการ`, 'success');
        } else {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger"><i class="fas fa-exclamation-triangle me-2"></i>ไม่สามารถโหลดข้อมูลสินค้า: ' + (result.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ') + '</td></tr>';
            showNotification(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger"><i class="fas fa-plug me-2"></i>ไม่สามารถเชื่อมต่อกับ API Backend ได้</td></tr>';
        showNotification('เกิดข้อผิดพลาดในการเชื่อมต่อ API', 'error');
    }
}

function renderProductTable(products) {
    const tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = ''; // ล้างข้อความโหลด/ข้อมูลเก่า

    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">ไม่พบสินค้าในระบบ</td></tr>';
        return;
    }

    products.forEach(product => {
        // 1. จัดรูปแบบหมวดหมู่
        // (สมมติว่า product.categories เป็น array of {c_id, name})
        const categoriesHtml = product.categories.map(cat => 
            `<span class="badge bg-secondary me-1">${cat.name}</span>`
        ).join('');
        
        // 2. จำกัดความยาวรายละเอียด
        const shortDescription = product.description && product.description.length > 50 
            ? product.description.substring(0, 50) + '...' 
            : product.description || '-';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.p_id}</td>
            <td><strong>${product.name}</strong></td>
            <td class="text-start small">${shortDescription}</td>
            <td>฿${product.price.toFixed(2)}</td>
            <td>${product.size || '-'}</td>
            
            <td>
              <img
                src="${IMAGE_BASE_URL}${product.image}"
                alt="Product ID: {{ item.id }}"
                class="product-image"
                width="50"
              />
            </td>
            <td>${categoriesHtml}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2 edit-btn" data-id="${product.p_id}" onclick="openEditModal(${product.p_id})">
                    <i class="fas fa-edit"></i> แก้ไข
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${product.p_id}" onclick="openDeleteModal(${product.p_id}, '${product.name}', '${product.image}')">
                    <i class="fas fa-trash-alt"></i> ลบ
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function populateEditForm(product) {
  document.getElementById("editProductName").value = product.name;
  document.getElementById("editDescription").value = product.description;
  document.getElementById("editPrice").value = product.price;
  document.getElementById("editAmount").value = product.amount;

  // Set ratio values
  if (product.size) {
    const [x, y] = product.size.split(":");
    document.getElementById("edit_number_x").value = x || 1;
    document.getElementById("edit_number_y").value = y || 1;
  }

  // Set categories
  if (product.categories && product.categories.length > 0) {
    const categoryIds = product.categories.map((cat) => cat.id);
    document
      .querySelectorAll('#editModal input[name="category[]"]')
      .forEach((checkbox) => {
        checkbox.checked = categoryIds.includes(parseInt(checkbox.value));
      });
  }

  // Set image preview
  if (product.image) {
    const imagePreview = document.getElementById("editImagePreview");
    imagePreview.src = `/static/images/products/${product.image}`;
    imagePreview.style.opacity = "1";
    imagePreview.nextElementSibling.style.display = "none";
  }
}

// ======= FORM HANDLING =======
function setupFormHandlers() {
  const editForm = document.getElementById("editForm");
  const addForm = document.getElementById("addForm");

  if (editForm) {
    editForm.addEventListener("submit", handleEditSubmit);
  }

  if (addForm) {
    addForm.addEventListener("submit", handleAddSubmit);
  }
}

function handleEditSubmit(e) {
  e.preventDefault();

  if (!validateForm("editModal")) {
    return;
  }

  const formData = new FormData();
  const x = document.getElementById("edit_number_x").value;
  const y = document.getElementById("edit_number_y").value;
  const sizeRatio = `${x}:${y}`;

  // Get selected categories
  const selectedCategories = [];
  document
    .querySelectorAll('#editModal input[name="category[]"]:checked')
    .forEach((checkbox) => {
      selectedCategories.push(parseInt(checkbox.value));
    });

  formData.append(
    "productName",
    document.getElementById("editProductName").value
  );
  formData.append(
    "description",
    document.getElementById("editDescription").value
  );
  formData.append("price", document.getElementById("editPrice").value);
  formData.append("size", sizeRatio);
  formData.append("amount", document.getElementById("editAmount").value);
  formData.append("categories", JSON.stringify(selectedCategories));

  const imageFile = document.getElementById("editImage").files[0];
  if (imageFile) {
    formData.append("image", imageFile);
  }

  // Simulate API call
  showNotification("กำลังบันทึกข้อมูล...", "info");

  setTimeout(() => {
    showNotification("แก้ไขสินค้าเรียบร้อยแล้ว", "success");
    window.editModalInstance.hide();
    // window.location.reload(); // Uncomment for actual implementation
  }, 1500);
}

async function handleAddSubmit(e) {
  e.preventDefault();

  if (!validateForm("addModal")) {
    return;
  }

  const formData = new FormData();
  
  // Get form elements with null checks
  const xElement = document.getElementById("add_number_x");
  const yElement = document.getElementById("add_number_y");
  const nameElement = document.getElementById("addProductName");
  const descElement = document.getElementById("addDescription");
  const priceElement = document.getElementById("addPrice");
  
  if (!xElement || !yElement || !nameElement || !descElement || !priceElement) {
    console.error("Missing form elements");
    showNotification("เกิดข้อผิดพลาดในฟอร์ม", "error");
    return;
  }
  
  const x = xElement.value;
  const y = yElement.value;

  // Get selected categories
  const selectedCategories = [];
  document
    .querySelectorAll('#addModal input[name="category[]"]:checked')
    .forEach((checkbox) => {
      selectedCategories.push(checkbox.value); // Keep as string for form data
    });

  formData.append("productName", nameElement.value);
  formData.append("description", descElement.value);
  formData.append("price", priceElement.value);
  formData.append("number_x", x);
  formData.append("number_y", y);
  
  // Add categories as individual form fields
  selectedCategories.forEach(catId => {
    formData.append("category[]", catId);
  });

  // Handle image file upload
  const imageElement = document.getElementById("addImage");
  if (imageElement && imageElement.files && imageElement.files[0]) {
    formData.append("image", imageElement.files[0]);
  }

  try {
    showNotification("กำลังเพิ่มสินค้า...", "info");
    
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      showNotification("เพิ่มสินค้าเรียบร้อยแล้ว", "success");
      window.addModalInstance.hide();
      
      // Reset form
      document.getElementById("addForm").reset();
      resetImagePreview("addImagePreview");
      
      // Refresh products list
      await fetchProducts();
    } else {
      showNotification("Error: " + result.message, "error");
    }
    
  } catch (error) {
    console.error('Error adding product:', error);
    showNotification('ไม่สามารถเพิ่มสินค้าได้', 'error');
  }
}

// ======= FORM VALIDATION =======
function validateForm(modalId) {
  const modal = document.getElementById(modalId);

  // Validate categories
  const selectedCategories = modal.querySelectorAll(
    'input[name="category[]"]:checked'
  );
  
  if (selectedCategories.length === 0) {
    const feedback = modal.querySelector('[id$="-category-feedback"]');
    if (feedback) {
      feedback.style.display = "block";
      feedback.classList.add("d-block");
    }
    showNotification("กรุณาเลือกหมวดหมู่อย่างน้อย 1 รายการ", "warning");
    return false;
  }

  // Hide feedback if validation passes
  const feedback = modal.querySelector('[id$="-category-feedback"]');
  if (feedback) {
    feedback.style.display = "none";
    feedback.classList.remove("d-block");
  }

  return true;
}

// ======= IMAGE PREVIEW =======
function setupImagePreviews() {
  const editImageInput = document.getElementById("editImage");
  const addImageInput = document.getElementById("addImage");

  if (editImageInput) {
    editImageInput.addEventListener("change", function () {
      previewImage(this, "editImagePreview");
    });
  }

  if (addImageInput) {
    addImageInput.addEventListener("change", function () {
      previewImage(this, "addImagePreview");
    });
  }
}

function previewImage(input, previewId) {
  const preview = document.getElementById(previewId);
  const noImageText = preview.nextElementSibling;

  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.opacity = "1";
      if (noImageText) {
        noImageText.style.display = "none";
      }
    };

    reader.readAsDataURL(input.files[0]);
  } else {
    resetImagePreview(previewId);
  }
}

function resetImagePreview(previewId) {
  const preview = document.getElementById(previewId);
  const noImageText = preview.nextElementSibling;

  preview.src = "/static/images/placeholder.jpg";
  preview.style.opacity = "0.5";
  if (noImageText) {
    noImageText.style.display = "block";
  }
}

// ======= PRODUCT MANAGEMENT =======
let productToDelete = null;

function openDeleteModal(productId, productName, productImage) {
  productToDelete = productId;

  // Update delete modal with product information
  document.getElementById("deleteProductId").textContent = productId;
  document.getElementById("deleteProductName").textContent = productName;
  
  // Set product image
  const deleteProductImage = document.getElementById("deleteProductImage");
  if (productImage && productImage !== 'null' && productImage !== '') {
    deleteProductImage.src = IMAGE_BASE_URL + productImage;
  } else {
    deleteProductImage.src = '/static/images/placeholder.jpg';
  }
  
  document.getElementById("deleteProductInfo").style.display = "block";

  // Show delete confirmation modal
  window.deleteModalInstance.show();
}

function removeProduct(productId) {
  // This function is kept for backward compatibility
  // Get product information from the table row  
  const rows = document.querySelectorAll('#productTableBody tr');
  let productName = 'สินค้า';
  let productImage = '';
  
  rows.forEach(row => {
    const editBtn = row.querySelector('.edit-btn');
    if (editBtn && editBtn.dataset.id == productId) {
      productName = row.children[1].querySelector('strong').textContent;
      const imgElement = row.querySelector('.product-image');
      if (imgElement) {
        productImage = imgElement.src.split('/').pop();
      }
    }
  });

  openDeleteModal(productId, productName, productImage);
}

async function confirmDeleteProduct() {
  if (!productToDelete) return;

  try {
    showNotification("กำลังลบสินค้า...", "info");
    
    const response = await fetch(`${API_BASE_URL}/products/${productToDelete}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      // Hide modal first
      window.deleteModalInstance.hide();
      
      showNotification("ลบสินค้าเรียบร้อยแล้ว", "success");
      
      // Refresh products list
      await fetchProducts();
    } else {
      showNotification("Error: " + result.message, "error");
    }
    
  } catch (error) {
    console.error('Error deleting product:', error);
    showNotification('ไม่สามารถลบสินค้าได้', 'error');
  }

  // Reset productToDelete
  productToDelete = null;
}

// ======= UTILITY FUNCTIONS =======
function formatPrice(price) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(price);
}

function validateFileSize(file, maxSizeMB = 5) {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  return file.size <= maxSize;
}

function validateImageType(file) {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  return allowedTypes.includes(file.type);
}

// ======= CSS ANIMATIONS =======
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
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.95);
        }
    }
    
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-50px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    @keyframes deleteIconPulse {
        0%, 100% {
            transform: scale(1);
            opacity: 0.7;
        }
        50% {
            transform: scale(1.1);
            opacity: 0.9;
        }
    }
    
    @keyframes slideInInfo {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ======= CATEGORY MANAGEMENT =======
function showAddCategoryInput() {
  document.getElementById('addCategoryBtn').style.display = 'none';
  document.getElementById('addCategoryInput').style.display = 'block';
  document.getElementById('newCategoryName').focus();
}

function cancelAddCategory() {
  document.getElementById('addCategoryBtn').style.display = 'block';
  document.getElementById('addCategoryInput').style.display = 'none';
  document.getElementById('newCategoryName').value = '';
}

async function addNewCategory() {
  const categoryName = document.getElementById('newCategoryName').value.trim();
  
  if (!categoryName) {
    showNotification('กรุณาใส่ชื่อหมวดหมู่', 'warning');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('name', categoryName);
    
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      showNotification(`เพิ่มหมวดหมู่ "${categoryName}" สำเร็จ`, 'success');
      
      // Add new checkbox to the list
      const categoryContainer = document.querySelector('#addModal .category-checkbox-container');
      const newCheckbox = document.createElement('div');
      newCheckbox.className = 'form-check mb-2 d-flex align-items-center justify-content-between';
      newCheckbox.innerHTML = `
        <div class="d-flex align-items-center">
          <input
            class="form-check-input me-2"
            type="checkbox"
            name="category[]"
            value="${result.data.c_id}"
            id="add-category-${result.data.c_id}"
            checked
          />
          <label
            class="form-check-label"
            for="add-category-${result.data.c_id}"
          >
            ${categoryName}
          </label>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-outline-danger delete-category-btn"
          data-category-id="${result.data.c_id}"
          data-category-name="${categoryName}"
          title="ลบหมวดหมู่นี้"
        >
          <i class="fas fa-times"></i>
        </button>
      `;
      
      // Insert before the add button container
      const addButtonContainer = categoryContainer.querySelector('.mt-2');
      categoryContainer.insertBefore(newCheckbox, addButtonContainer);
      
      // Reset and hide input
      cancelAddCategory();
    } else {
      showNotification('เกิดข้อผิดพลาด: ' + result.message, 'error');
    }
    
  } catch (error) {
    console.error('Error adding category:', error);
    showNotification('ไม่สามารถเพิ่มหมวดหมู่ได้', 'error');
  }
}

// ======= CATEGORY DELETE FUNCTIONS =======
async function deleteCategoryConfirm(categoryId, categoryName) {
  const confirmed = confirm(`คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ "${categoryName}"?\n\nการลบหมวดหมู่นี้จะส่งผลต่อสินค้าทั้งหมดที่อยู่ในหมวดหมู่นี้`);
  
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      showNotification(`ลบหมวดหมู่ "${categoryName}" สำเร็จ`, 'success');
      
      // Remove category from both edit and add modals
      const editCategoryElement = document.querySelector(`#editModal [data-category-id="${categoryId}"]`)?.closest('.form-check');
      const addCategoryElement = document.querySelector(`#addModal [data-category-id="${categoryId}"]`)?.closest('.form-check');
      
      if (editCategoryElement) editCategoryElement.remove();
      if (addCategoryElement) addCategoryElement.remove();
      
      // Refresh the page to update product list
      setTimeout(() => {
        location.reload();
      }, 1500);
    } else {
      showNotification('เกิดข้อผิดพลาด: ' + result.message, 'error');
    }
    
  } catch (error) {
    console.error('Error deleting category:', error);
    showNotification('ไม่สามารถลบหมวดหมู่ได้', 'error');
  }
}

// Event delegation for dynamically added delete buttons
document.addEventListener('click', function(e) {
  if (e.target.closest('.delete-category-btn')) {
    const button = e.target.closest('.delete-category-btn');
    const categoryId = button.getAttribute('data-category-id');
    const categoryName = button.getAttribute('data-category-name');
    deleteCategoryConfirm(categoryId, categoryName);
  }
});

// ======= GLOBAL FUNCTIONS (for onclick handlers) =======
window.openEditModal = openEditModal;
window.openAddModal = openAddModal;
window.closeEditModal = closeEditModal;
window.closeAddModal = closeAddModal;
window.openDeleteModal = openDeleteModal;
window.removeProduct = removeProduct;
window.confirmDeleteProduct = confirmDeleteProduct;
window.previewImage = previewImage;
window.showAddCategoryInput = showAddCategoryInput;
window.cancelAddCategory = cancelAddCategory;
window.addNewCategory = addNewCategory;
window.deleteCategoryConfirm = deleteCategoryConfirm;
