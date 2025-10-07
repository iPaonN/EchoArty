// Home Page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeScrollButtons();
    initializeTouchScroll();
});

// ======= HORIZONTAL SCROLL FUNCTIONALITY =======
function scrollCategory(containerId, direction) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const scrollAmount = 300; // pixels to scroll
    const currentScrollLeft = container.scrollLeft;
    const targetScrollLeft = currentScrollLeft + (direction * scrollAmount);
    
    // Smooth scroll animation
    container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
    });
    
    // Update button visibility
    setTimeout(() => updateScrollButtons(containerId), 300);
}

// ======= SCROLL BUTTON MANAGEMENT =======
function initializeScrollButtons() {
    // Get all horizontal scroll containers
    const containers = document.querySelectorAll('.horizontal-scroll-container');
    
    containers.forEach(container => {
        const containerId = container.id;
        updateScrollButtons(containerId);
        
        // Add scroll event listener to update buttons
        container.addEventListener('scroll', () => {
            updateScrollButtons(containerId);
        });
    });
}

function updateScrollButtons(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const wrapper = container.closest('.horizontal-scroll-wrapper');
    if (!wrapper) return;
    
    const leftBtn = wrapper.querySelector('.scroll-btn-left');
    const rightBtn = wrapper.querySelector('.scroll-btn-right');
    
    if (!leftBtn || !rightBtn) return;
    
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    
    // Show/hide left button
    if (scrollLeft <= 10) {
        leftBtn.style.opacity = '0.3';
        leftBtn.style.pointerEvents = 'none';
    } else {
        leftBtn.style.opacity = '1';
        leftBtn.style.pointerEvents = 'auto';
    }
    
    // Show/hide right button
    if (scrollLeft >= maxScroll - 10) {
        rightBtn.style.opacity = '0.3';
        rightBtn.style.pointerEvents = 'none';
    } else {
        rightBtn.style.opacity = '1';
        rightBtn.style.pointerEvents = 'auto';
    }
}

// ======= TOUCH/MOBILE SCROLL SUPPORT =======
function initializeTouchScroll() {
    const containers = document.querySelectorAll('.horizontal-scroll-container');
    
    containers.forEach(container => {
        let isDown = false;
        let startX;
        let scrollLeftStart;
        
        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            scrollLeftStart = container.scrollLeft;
        });
        
        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });
        
        container.addEventListener('mouseup', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });
        
        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeftStart - walk;
        });
        
        // Set initial cursor
        container.style.cursor = 'grab';
    });
}

// ======= SMOOTH SCROLL TO CATEGORY =======
function scrollToCategory(categoryId) {
    const element = document.getElementById(`category-${categoryId}-scroll`);
    if (element) {
        const wrapper = element.closest('.category-section');
        if (wrapper) {
            wrapper.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// ======= KEYBOARD NAVIGATION =======
document.addEventListener('keydown', function(e) {
    // Only handle arrow keys when not in input fields
    if (document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA') {
        return;
    }
    
    const focusedContainer = document.querySelector('.horizontal-scroll-container:hover');
    if (focusedContainer) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            scrollCategory(focusedContainer.id, -1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            scrollCategory(focusedContainer.id, 1);
        }
    }
});

// ======= INTERSECTION OBSERVER FOR ANIMATIONS =======
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe category sections for animation
document.addEventListener('DOMContentLoaded', function() {
    const categorySection = document.querySelectorAll('.category-section');
    categorySection.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

// ======= GLOBAL FUNCTIONS =======
window.scrollCategory = scrollCategory;
window.scrollToCategory = scrollToCategory;