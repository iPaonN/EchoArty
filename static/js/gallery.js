// Gallery filtering and search functionality
let allProducts = [];
let categories = [];
let filteredProducts = [];
let currentCategoryFilter = 'all';
let currentSearchQuery = '';

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Store original products data
    loadProductsData();
    // Load categories from API
    loadCategoriesData();
    // Initialize event listeners
    initializeEventListeners();
});

// Load products data from the page
function loadProductsData() {
    const productCards = document.querySelectorAll('.toy-card');
    allProducts = Array.from(productCards).map(card => {
        const nameEl = card.querySelector('.card-title');
        const descEl = card.querySelector('.card-text');
        const priceEl = card.querySelector('.price-badge');
        const categoryEls = card.querySelectorAll('.category-badge');
        
        return {
            element: card,
            name: nameEl ? nameEl.textContent.trim() : '',
            description: descEl ? descEl.textContent.trim() : '',
            price: parseFloat(priceEl ? priceEl.textContent.replace(/[^0-9.]/g, '') : '0'),
            categories: Array.from(categoryEls).map(cat => cat.textContent.trim())
        };
    });
    
    filteredProducts = [...allProducts];
    updateResultCount();
}

// Load categories from template data
function loadCategoriesData() {
    // Get categories from data attribute
    const container = document.querySelector('.toy-container');
    if (container) {
        try {
            const categoriesJson = container.getAttribute('data-categories');
            const categoriesFromTemplate = JSON.parse(categoriesJson);
            
            if (categoriesFromTemplate && categoriesFromTemplate.length > 0) {
                categories = categoriesFromTemplate;
                populateCategoryFilter();
                return;
            }
        } catch (error) {
            console.error('Error parsing categories data:', error);
        }
    }
    
    // Fallback: extract categories from products
    extractCategoriesFromProducts();
}

// Extract categories from existing products as fallback
function extractCategoriesFromProducts() {
    const categorySet = new Set();
    allProducts.forEach(product => {
        product.categories.forEach(cat => {
            if (cat && cat !== 'ไม่ระบุหมวดหมู่') {
                categorySet.add(cat);
            }
        });
    });
    
    categories = Array.from(categorySet).map(name => ({ name }));
    populateCategoryFilter();
}

// Populate category filter list
function populateCategoryFilter() {
    const filterList = document.getElementById('categoryFilterList');
    if (!filterList) return;
    
    // Keep the "all" option and add dynamic categories
    const dynamicCategories = categories.map(category => `
        <a
            href="javascript:void(0)"
            class="list-group-item list-group-item-action category-filter-btn"
            data-category-name="${category.name}"
        >
            <i class="fas fa-tag me-2"></i>${category.name}
        </a>
    `).join('');
    
    // Insert after the "show all" option
    const allOption = filterList.querySelector('[data-category-id="all"]');
    if (allOption) {
        allOption.insertAdjacentHTML('afterend', dynamicCategories);
    }
    
    // Add click listeners to new category buttons
    filterList.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.addEventListener('click', handleCategoryFilter);
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Sort dropdown
    const sortOptions = document.querySelectorAll('.sort-option');
    sortOptions.forEach(option => {
        option.addEventListener('click', handleSort);
    });
    
    // Category filter buttons (initial)
    const categoryBtns = document.querySelectorAll('.category-filter-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', handleCategoryFilter);
    });
}

// Handle search input
function handleSearch(event) {
    currentSearchQuery = event.target.value.toLowerCase().trim();
    applyFilters();
}

// Handle category filter
function handleCategoryFilter(event) {
    event.preventDefault();
    
    // Update active state
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Get category filter
    const categoryId = event.target.getAttribute('data-category-id');
    const categoryName = event.target.getAttribute('data-category-name');
    
    if (categoryId === 'all') {
        currentCategoryFilter = 'all';
    } else {
        currentCategoryFilter = categoryName || categoryId;
    }
    
    // Update active filter display
    updateActiveFilterDisplay();
    
    // Apply filters
    applyFilters();
    
    // Close offcanvas on mobile
    const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('categoryFilter'));
    if (offcanvas) {
        offcanvas.hide();
    }
}

// Handle sorting
function handleSort(event) {
    event.preventDefault();
    
    const sortType = event.target.getAttribute('data-sort');
    let sortedProducts = [...filteredProducts];
    
    switch (sortType) {
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
    }
    
    // Re-arrange DOM elements
    const container = document.querySelector('.toy-container .row:last-child');
    if (container) {
        sortedProducts.forEach(product => {
            container.appendChild(product.element.parentNode); // Append the column div
        });
    }
    
    // Update dropdown text
    const dropdownToggle = document.getElementById('sortDropdown');
    if (dropdownToggle) {
        dropdownToggle.innerHTML = `<i class="fas fa-sort me-2"></i>${event.target.textContent}`;
    }
}

// Apply all filters
function applyFilters() {
    filteredProducts = allProducts.filter(product => {
        // Search filter
        const matchesSearch = !currentSearchQuery || 
            product.name.toLowerCase().includes(currentSearchQuery) ||
            product.description.toLowerCase().includes(currentSearchQuery) ||
            product.categories.some(cat => cat.toLowerCase().includes(currentSearchQuery));
        
        // Category filter
        const matchesCategory = currentCategoryFilter === 'all' ||
            product.categories.some(cat => cat === currentCategoryFilter);
        
        return matchesSearch && matchesCategory;
    });
    
    // Show/hide products
    updateProductDisplay();
    updateResultCount();
    updateActiveFilterDisplay();
}

// Update product display
function updateProductDisplay() {
    allProducts.forEach(product => {
        const isVisible = filteredProducts.includes(product);
        const columnDiv = product.element.parentNode; // Get the column div
        
        if (isVisible) {
            columnDiv.style.display = '';
            product.element.classList.remove('hidden');
            product.element.classList.add('fade-in');
        } else {
            columnDiv.style.display = 'none';
            product.element.classList.add('hidden');
            product.element.classList.remove('fade-in');
        }
    });
    
    // Show/hide no results message
    const container = document.querySelector('.toy-container .row:last-child');
    let noResultsDiv = container.querySelector('.no-results-container');
    
    if (filteredProducts.length === 0) {
        if (!noResultsDiv) {
            noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'col-12 no-results-container';
            noResultsDiv.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h4>ไม่พบสินค้าที่ค้นหา</h4>
                    <p class="text-muted">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
                    <button type="button" class="btn btn-primary" onclick="clearAllFilters()">
                        <i class="fas fa-refresh me-2"></i>แสดงทั้งหมด
                    </button>
                </div>
            `;
            container.appendChild(noResultsDiv);
        }
        noResultsDiv.style.display = '';
    } else if (noResultsDiv) {
        noResultsDiv.style.display = 'none';
    }
}

// Update result count
function updateResultCount() {
    const countEl = document.getElementById('resultCount');
    if (countEl) {
        countEl.textContent = filteredProducts.length;
    }
}

// Update active filter display
function updateActiveFilterDisplay() {
    const activeFiltersDiv = document.getElementById('activeFilters');
    const activeCategorySpan = document.getElementById('activeCategory');
    
    const hasActiveFilters = currentCategoryFilter !== 'all' || currentSearchQuery;
    
    if (hasActiveFilters) {
        activeFiltersDiv.style.display = '';
        
        if (currentCategoryFilter !== 'all') {
            activeCategorySpan.style.display = '';
            activeCategorySpan.querySelector('.filter-text').textContent = currentCategoryFilter;
        } else {
            activeCategorySpan.style.display = 'none';
        }
    } else {
        activeFiltersDiv.style.display = 'none';
    }
}

// Clear category filter
function clearCategoryFilter() {
    currentCategoryFilter = 'all';
    
    // Update active state
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[data-category-id="all"]').classList.add('active');
    
    applyFilters();
}

// Clear all filters
function clearAllFilters() {
    currentCategoryFilter = 'all';
    currentSearchQuery = '';
    
    // Reset search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Reset category selection
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[data-category-id="all"]').classList.add('active');
    
    // Reset sort dropdown
    const dropdownToggle = document.getElementById('sortDropdown');
    if (dropdownToggle) {
        dropdownToggle.innerHTML = '<i class="fas fa-sort me-2"></i>เรียง';
    }
    
    applyFilters();
}

// Expose functions globally
window.clearCategoryFilter = clearCategoryFilter;
window.clearAllFilters = clearAllFilters;