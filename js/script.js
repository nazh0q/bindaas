document.addEventListener('headerLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuItems = document.querySelectorAll('.menu-item');
  const header = document.querySelector('.site-header');
  const root = document.documentElement;

  // Handle hash on page load - scroll to section and clear hash from URL
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          history.replaceState(null, '', window.location.pathname);
        }, 800);
      }, 100);
    }
  }

  // Expose header height to CSS for full-screen sections
  const setHeaderHeightVar = () => {
    if (!header) return;
    root.style.setProperty('--header-height', `${header.offsetHeight}px`);
  };

  window.addEventListener('resize', setHeaderHeightVar);
  setHeaderHeightVar();

  // Header: visible at top, fades away when idle after scroll, reappears on scroll or when mouse in header area
  const TOP_THRESHOLD = 80;
  const HIDE_DELAY_MS = 400;
  let scrollTimeout = null;
  let mouseInHeaderZone = false;

  const getHeaderZoneHeight = () => (header ? header.offsetHeight : 120);

  const scheduleHideHeader = () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (!mouseInHeaderZone && !document.body.classList.contains('menu-open')) {
        header?.classList.add('header-hidden');
      }
      scrollTimeout = null;
    }, HIDE_DELAY_MS);
  };

  const handleHeaderScroll = () => {
    const y = window.scrollY;
    const menuOpen = document.body.classList.contains('menu-open');

    if (y <= TOP_THRESHOLD) {
      header?.classList.remove('scrolled');
      header?.classList.remove('header-hidden');
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
      }
      return;
    }

    header?.classList.add('scrolled');
    header?.classList.remove('header-hidden');

    if (menuOpen) return;
    scheduleHideHeader();
  };

  document.addEventListener('mousemove', (e) => {
    const zoneHeight = getHeaderZoneHeight();
    const wasInZone = mouseInHeaderZone;
    mouseInHeaderZone = e.clientY < zoneHeight;

    const y = window.scrollY;
    const menuOpen = document.body.classList.contains('menu-open');
    if (y <= TOP_THRESHOLD || menuOpen) return;

    if (mouseInHeaderZone) {
      header?.classList.remove('header-hidden');
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
      }
    } else if (wasInZone && !header?.classList.contains('header-hidden')) {
      scheduleHideHeader();
    }
  }, { passive: true });

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // Initial check

  // Menu toggle functionality
  function openMenu() {
    document.body.classList.add('menu-open');
    if (menuOverlay) {
      menuOverlay.classList.add('active');
    }
  }

  function closeMenu() {
    document.body.classList.remove('menu-open');
    if (menuOverlay) {
      menuOverlay.classList.remove('active');
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', openMenu);
  }

  if (menuClose) {
    menuClose.addEventListener('click', closeMenu);
  }

  // Close menu when clicking outside
  if (menuOverlay) {
    menuOverlay.addEventListener('click', (e) => {
      if (e.target === menuOverlay) {
        closeMenu();
      }
    });
  }

  // Handle menu item clicks
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const href = item.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        closeMenu();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          setTimeout(() => {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
              history.replaceState(null, '', window.location.pathname);
            }, 800);
          }, 300);
        }
      }
    });
  });

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.length > 1) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOverlay?.classList.contains('active')) {
      closeMenu();
    }
  });
});
