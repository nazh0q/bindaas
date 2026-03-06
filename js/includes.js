// HTML Include Loader
// Automatically loads header and footer into pages

document.addEventListener('DOMContentLoaded', function() {
  // Load header
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    fetch('/includes/header.html')
      .then(response => response.text())
      .then(data => {
        headerPlaceholder.outerHTML = data;
        // Reinitialize menu functionality after header loads
        initializeMenu();
        // Signal that the header is in the DOM so other scripts can wire up
        document.dispatchEvent(new CustomEvent('headerLoaded'));
      })
      .catch(error => console.error('Error loading header:', error));
  }

  // Load footer
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    fetch('/includes/footer.html')
      .then(response => response.text())
      .then(data => {
        footerPlaceholder.outerHTML = data;
        // Signal that the footer is in the DOM so other scripts can wire up
        document.dispatchEvent(new CustomEvent('footerLoaded'));
      })
      .catch(error => console.error('Error loading footer:', error));
  }
});

// Initialize menu toggle functionality
function initializeMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');
  const menuOverlay = document.getElementById('menuOverlay');
  const body = document.body;

  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      menuOverlay.classList.add('active');
      body.classList.add('menu-open');
    });
  }

  if (menuClose) {
    menuClose.addEventListener('click', function() {
      menuOverlay.classList.remove('active');
      body.classList.remove('menu-open');
    });
  }

  if (menuOverlay) {
    menuOverlay.addEventListener('click', function(e) {
      if (e.target === menuOverlay) {
        menuOverlay.classList.remove('active');
        body.classList.remove('menu-open');
      }
    });
  }

  // Close menu when clicking menu items
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', function() {
      menuOverlay.classList.remove('active');
      body.classList.remove('menu-open');
    });
  });
}
