// EchoArty - Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    // Initialize enhanced navigation
    initializeNavigation();
    
    // Initialize tooltips if using Bootstrap
    if (typeof bootstrap !== 'undefined') {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add active class to current navigation item
    const currentLocation = location.pathname;
    const menuItems = document.querySelectorAll('.navbar-nav .nav-link');
    
    menuItems.forEach(item => {
        if (item.getAttribute('href') === currentLocation) {
            item.classList.add('active');
        }
    });

    // Form validation for contact form - ONLY if contact form exists
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check if elements exist before accessing their values
            const nameEl = document.getElementById('name');
            const emailEl = document.getElementById('email');
            const subjectEl = document.getElementById('subject');
            const messageEl = document.getElementById('message');
            
            // Only proceed if all elements exist
            if (nameEl && emailEl && subjectEl && messageEl) {
                const name = nameEl.value.trim();
                const email = emailEl.value.trim();
                const subject = subjectEl.value.trim();
                const message = messageEl.value.trim();
                
                if (name && email && subject && message) {
                    // Show success message
                    showNotification('Thank you for your message! We will get back to you soon.', 'success');
                    contactForm.reset();
                } else {
                    showNotification('Please fill in all required fields.', 'warning');
                }
            } else {
                console.warn('Contact form elements not found - this is normal on non-contact pages');
            }
        });
    }

    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card');
    if (cards.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
});

// ======= ENHANCED NAVIGATION UX =======
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdownMenus = document.querySelectorAll('.dropdown-menu');
    
    // 1. Auto-close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Close mobile menu
            if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || 
                                  new bootstrap.Collapse(navbarCollapse, { toggle: false });
                bsCollapse.hide();
            }
            
            // Add loading indicator for page navigation
            if (!this.getAttribute('href').startsWith('#') && 
                !this.getAttribute('href').startsWith('javascript:')) {
                showLoadingIndicator();
            }
        });
    });
    
    // 2. Keyboard navigation enhancement
    navLinks.forEach((link, index) => {
        link.addEventListener('keydown', function(e) {
            // Arrow key navigation
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const nextLink = navLinks[index + 1] || navLinks[0];
                nextLink.focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prevLink = navLinks[index - 1] || navLinks[navLinks.length - 1];
                prevLink.focus();
            }
        });
    });
    
    // 3. Dropdown hover enhancement (desktop only)
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    dropdowns.forEach(dropdown => {
        let hoverTimeout;
        
        dropdown.addEventListener('mouseenter', function() {
            if (window.innerWidth >= 992) {
                clearTimeout(hoverTimeout);
                const dropdownToggle = this.querySelector('.dropdown-toggle');
                const dropdownMenu = this.querySelector('.dropdown-menu');
                
                if (dropdownToggle && dropdownMenu) {
                    dropdownToggle.classList.add('show');
                    dropdownMenu.classList.add('show');
                }
            }
        });
        
        dropdown.addEventListener('mouseleave', function() {
            if (window.innerWidth >= 992) {
                hoverTimeout = setTimeout(() => {
                    const dropdownToggle = this.querySelector('.dropdown-toggle');
                    const dropdownMenu = this.querySelector('.dropdown-menu');
                    
                    if (dropdownToggle && dropdownMenu) {
                        dropdownToggle.classList.remove('show');
                        dropdownMenu.classList.remove('show');
                    }
                }, 200);
            }
        });
    });
    
    // 4. Navbar hide/show on scroll (for better UX on mobile)
    let lastScrollTop = 0;
    let scrollThreshold = 5; // minimum scroll distance
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (Math.abs(scrollTop - lastScrollTop) < scrollThreshold) {
            return;
        }
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down & past threshold
            navbar.style.transform = 'translateY(-100%)';
            navbar.style.transition = 'transform 0.3s ease-in-out';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
            navbar.style.transition = 'transform 0.3s ease-in-out';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // 5. Smooth scroll to top when clicking brand/logo
    const brandLink = document.querySelector('.navbar-brand');
    if (brandLink) {
        brandLink.addEventListener('click', function(e) {
            if (this.getAttribute('href') === window.location.pathname || 
                this.getAttribute('href') === '/') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // 6. Add visual feedback on active state
    const currentPath = window.location.pathname;
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '/' && href === '/')) {
            link.classList.add('active');
            // Add aria-current for accessibility
            link.setAttribute('aria-current', 'page');
        }
    });
    
    // 7. Prevent focus trap in collapsed menu
    if (navbarCollapse) {
        navbarCollapse.addEventListener('shown.bs.collapse', function() {
            const firstLink = this.querySelector('.nav-link');
            if (firstLink) firstLink.focus();
        });
    }
}

// Loading indicator for page transitions
function showLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'page-loading-indicator';
    indicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
    indicator.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        background: rgba(255, 255, 255, 0.95);
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    document.body.appendChild(indicator);
    
    // Remove if page doesn't load within 5 seconds (fallback)
    setTimeout(() => {
        if (document.getElementById('page-loading-indicator')) {
            indicator.remove();
        }
    }, 5000);
}

// Utility function for showing notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}
