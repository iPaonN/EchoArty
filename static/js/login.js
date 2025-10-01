// Login page functionality
document.addEventListener("DOMContentLoaded", function () {
  initializeLoginPage();
});

function initializeLoginPage() {
  setupFormEffects();
  setupFormValidation();
}

// Add interactive effects to form inputs
function setupFormEffects() {
  const loginForm = document.querySelector(".login-form");
  if (!loginForm) return;

  const inputs = loginForm.querySelectorAll("input");

  // Add focus effects to inputs
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.style.transform = "scale(1.02)";
    });

    input.addEventListener("blur", function () {
      this.style.transform = "scale(1)";
    });
  });
}

// Setup form validation
function setupFormValidation() {
  const loginForm = document.querySelector(".login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", function (e) {
    if (!validateLoginForm(this)) {
      e.preventDefault();
      return false;
    }
  });
}

// Validate login form
function validateLoginForm(form) {
  const emailOrUsername = form
    .querySelector('input[name="email"]')
    .value.trim();
  const password = form.querySelector('input[name="password"]').value;

  // Check if fields are filled
  if (!emailOrUsername || !password) {
    showLoginError("Please fill in all fields");
    return false;
  }

  // Validate username or email format
  if (!isValidUsernameOrEmail(emailOrUsername)) {
    showLoginError("Please enter a valid username or email address");
    return false;
  }

  // Password length validation
  if (password.length < 6) {
    showLoginError("Password must be at least 6 characters long");
    return false;
  }

  return true;
}

// Check if input is valid username or email
function isValidUsernameOrEmail(input) {
  // If not empty and has reasonable length, accept it
  // Let the backend handle the actual validation
  if (input && input.length >= 3 && input.length <= 100) {
    return true;
  }

  return false;
}

// Show error message
function showLoginError(message) {
  // Remove existing error messages
  const existingError = document.querySelector(".login-error");
  if (existingError) {
    existingError.remove();
  }

  // Create error element
  const errorDiv = document.createElement("div");
  errorDiv.className = "login-error";
  errorDiv.style.cssText = `
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
    border-radius: 10px;
    padding: 1rem;
    text-align: center;
    margin-bottom: 1rem;
    font-weight: 500;
    animation: slideDown 0.3s ease;
  `;
  errorDiv.textContent = message;

  // Add CSS for animation
  if (!document.querySelector("#login-error-styles")) {
    const style = document.createElement("style");
    style.id = "login-error-styles";
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Insert error message
  const loginForm = document.querySelector(".login-form");
  loginForm.insertBefore(errorDiv, loginForm.firstChild);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (errorDiv && errorDiv.parentNode) {
      errorDiv.style.animation = "slideUp 0.3s ease";
      setTimeout(() => errorDiv.remove(), 300);
    }
  }, 5000);
}

// Enhanced form submission with loading state
function enhanceFormSubmission() {
  const loginForm = document.querySelector(".login-form");
  const submitBtn = document.querySelector(".login-btn");

  if (!loginForm || !submitBtn) return;

  loginForm.addEventListener("submit", function (e) {
    // Add loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Logging in...';

    // Reset button state after 3 seconds (in case of server delay)
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Click to login";
    }, 3000);
  });
}

// Initialize enhanced features
document.addEventListener("DOMContentLoaded", function () {
  enhanceFormSubmission();
});
