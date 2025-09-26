// Register page functionality
document.addEventListener("DOMContentLoaded", function () {
  initializeRegisterPage();
});

function initializeRegisterPage() {
  setupFormEffects();
  setupPasswordFunctionality();
  setupFormValidation();
}

// Add interactive effects to form inputs
function setupFormEffects() {
  const registerForm = document.querySelector(".register-form");
  if (!registerForm) return;

  const inputs = registerForm.querySelectorAll("input");

  // Add focus effects to inputs
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.style.transform = "scale(1.02)";
      this.classList.remove("is-invalid");
    });

    input.addEventListener("blur", function () {
      this.style.transform = "scale(1)";
      validateField(this);
    });
  });
}

// Setup password related functionality
function setupPasswordFunctionality() {
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const showPasswordCheckbox = document.getElementById("showPassword");

  if (!passwordInput || !confirmPasswordInput || !showPasswordCheckbox) return;

  // Show/Hide password functionality
  showPasswordCheckbox.addEventListener("change", function () {
    const type = this.checked ? "text" : "password";
    passwordInput.type = type;
    confirmPasswordInput.type = type;
  });

  // Password strength checker
  passwordInput.addEventListener("input", function () {
    checkPasswordStrength(this.value);
    checkPasswordMatch();
  });

  // Password confirmation checker
  confirmPasswordInput.addEventListener("input", checkPasswordMatch);
}

// Check password strength
function checkPasswordStrength(password) {
  const passwordStrength = document.getElementById("passwordStrength");
  if (!passwordStrength) return;

  let strength = 0;
  let strengthText = "";
  let strengthClass = "";

  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (password.length === 0) {
    strengthText = "";
    strengthClass = "";
  } else if (strength < 2) {
    strengthText = "Weak password";
    strengthClass = "strength-weak";
  } else if (strength < 4) {
    strengthText = "Medium password";
    strengthClass = "strength-medium";
  } else {
    strengthText = "Strong password";
    strengthClass = "strength-strong";
  }

  passwordStrength.textContent = strengthText;
  passwordStrength.className = "password-strength " + strengthClass;
}

// Check if passwords match
function checkPasswordMatch() {
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const passwordMatch = document.getElementById("passwordMatch");

  if (!passwordInput || !confirmPasswordInput || !passwordMatch) return;

  if (confirmPasswordInput.value === "") {
    passwordMatch.textContent = "";
    passwordMatch.className = "";
    confirmPasswordInput.classList.remove("is-valid", "is-invalid");
    return;
  }

  if (passwordInput.value !== confirmPasswordInput.value) {
    passwordMatch.textContent = "Passwords do not match";
    passwordMatch.className = "password-match-error";
    confirmPasswordInput.classList.add("is-invalid");
    confirmPasswordInput.classList.remove("is-valid");
  } else {
    passwordMatch.textContent = "Passwords match";
    passwordMatch.className = "password-match-success";
    confirmPasswordInput.classList.add("is-valid");
    confirmPasswordInput.classList.remove("is-invalid");
  }
}

// Validate individual field
function validateField(field) {
  const value = field.value.trim();
  let isValid = true;

  switch (field.name) {
    case "username":
      isValid = value.length >= 3;
      break;
    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(value);
      break;
    case "password":
      isValid = value.length >= 6;
      break;
    case "phone":
      const phoneRegex = /^[\d\-\+\(\)\s]+$/;
      isValid = phoneRegex.test(value) && value.length >= 10;
      break;
    default:
      isValid = value.length > 0;
  }

  if (isValid) {
    field.classList.add("is-valid");
    field.classList.remove("is-invalid");
  } else {
    field.classList.add("is-invalid");
    field.classList.remove("is-valid");
  }

  return isValid;
}

// Setup form validation
function setupFormValidation() {
  const registerForm = document.querySelector(".register-form");
  if (!registerForm) return;

  registerForm.addEventListener("submit", function (e) {
    if (!validateRegisterForm(this)) {
      e.preventDefault();
      return false;
    }
  });
}

// Validate entire register form
function validateRegisterForm(form) {
  const username = form.querySelector('input[name="username"]').value.trim();
  const email = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value;
  const confirmPassword = form.querySelector(
    'input[name="confirm_password"]'
  ).value;
  const phone = form.querySelector('input[name="phone"]').value.trim();

  // Clear previous errors
  clearErrors();

  // Validate all fields
  if (!username) {
    showRegisterError("Username is required");
    return false;
  }

  if (username.length < 3) {
    showRegisterError("Username must be at least 3 characters long");
    return false;
  }

  if (!email) {
    showRegisterError("Email is required");
    return false;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showRegisterError("Please enter a valid email address");
    return false;
  }

  if (!password) {
    showRegisterError("Password is required");
    return false;
  }

  // Password strength validation
  if (password.length < 6) {
    showRegisterError("Password must be at least 6 characters long");
    return false;
  }

  if (!confirmPassword) {
    showRegisterError("Please confirm your password");
    return false;
  }

  // Password match validation
  if (password !== confirmPassword) {
    showRegisterError("Passwords do not match");
    return false;
  }

  if (!phone) {
    showRegisterError("Phone number is required");
    return false;
  }

  // Phone number basic validation
  const phoneRegex = /^[\d\-\+\(\)\s]+$/;
  if (!phoneRegex.test(phone)) {
    showRegisterError("Please enter a valid phone number");
    return false;
  }

  if (phone.length < 10) {
    showRegisterError("Phone number must be at least 10 digits long");
    return false;
  }

  // If all validations pass
  showLoadingState();
  return true;
}

// Show error message
function showRegisterError(message) {
  clearErrors();

  const errorDiv = document.createElement("div");
  errorDiv.className = "register-error";
  errorDiv.textContent = message;

  const registerForm = document.querySelector(".register-form");
  registerForm.insertBefore(errorDiv, registerForm.firstChild);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (errorDiv && errorDiv.parentNode) {
      errorDiv.style.animation = "slideUp 0.3s ease";
      setTimeout(() => errorDiv.remove(), 300);
    }
  }, 5000);
}

// Show success message
function showRegisterSuccess(message) {
  clearErrors();

  const successDiv = document.createElement("div");
  successDiv.className = "register-success";
  successDiv.textContent = message;

  const registerForm = document.querySelector(".register-form");
  registerForm.insertBefore(successDiv, registerForm.firstChild);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (successDiv && successDiv.parentNode) {
      successDiv.style.animation = "slideUp 0.3s ease";
      setTimeout(() => successDiv.remove(), 300);
    }
  }, 5000);
}

// Clear all error and success messages
function clearErrors() {
  const existingMessages = document.querySelectorAll(
    ".register-error, .register-success"
  );
  existingMessages.forEach((msg) => msg.remove());
}

// Show loading state on form submission
function showLoadingState() {
  const submitBtn = document.querySelector(".register-btn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Creating account...';

    // Reset button state after 5 seconds (in case of server delay)
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Click to register!";
    }, 5000);
  }
}

// Real-time validation as user types
function setupRealTimeValidation() {
  const inputs = document.querySelectorAll(".register-form input");

  inputs.forEach((input) => {
    let timeout;

    input.addEventListener("input", function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (this.value.trim()) {
          validateField(this);
        }
      }, 500); // Validate 500ms after user stops typing
    });
  });
}

// Initialize real-time validation
document.addEventListener("DOMContentLoaded", function () {
  setupRealTimeValidation();
});
