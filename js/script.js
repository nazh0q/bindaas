// Dynamically load GSAP + ScrollTrigger if not already on the page
function loadGSAP() {
  return new Promise(resolve => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      resolve();
      return;
    }
    const s1 = document.createElement('script');
    s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    s1.onload = () => {
      const s2 = document.createElement('script');
      s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
      s2.onload = resolve;
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  });
}

document.addEventListener('headerLoaded', async () => {
  const menuToggle = document.getElementById('menuToggle');
  const menuClose  = document.getElementById('menuClose');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuItems  = document.querySelectorAll('.menu-item');
  const header     = document.querySelector('.site-header');
  const root       = document.documentElement;

  // Handle hash on page load
  if (window.location.hash) {
    const targetEl = document.getElementById(window.location.hash.substring(1));
    if (targetEl) {
      setTimeout(() => {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => history.replaceState(null, '', window.location.pathname), 800);
      }, 100);
    }
  }

  // Expose header height to CSS
  const setHeaderHeightVar = () => {
    if (!header) return;
    root.style.setProperty('--header-height', `${header.offsetHeight}px`);
  };
  window.addEventListener('resize', setHeaderHeightVar);
  setHeaderHeightVar();

  // Header hide/show on scroll
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
    if (y <= TOP_THRESHOLD) {
      header?.classList.remove('scrolled', 'header-hidden');
      if (scrollTimeout) { clearTimeout(scrollTimeout); scrollTimeout = null; }
      return;
    }
    header?.classList.add('scrolled');
    header?.classList.remove('header-hidden');
    if (!document.body.classList.contains('menu-open')) scheduleHideHeader();
  };

  document.addEventListener('mousemove', (e) => {
    const wasInZone = mouseInHeaderZone;
    mouseInHeaderZone = e.clientY < getHeaderZoneHeight();
    if (window.scrollY <= TOP_THRESHOLD || document.body.classList.contains('menu-open')) return;
    if (mouseInHeaderZone) {
      header?.classList.remove('header-hidden');
      if (scrollTimeout) { clearTimeout(scrollTimeout); scrollTimeout = null; }
    } else if (wasInZone && !header?.classList.contains('header-hidden')) {
      scheduleHideHeader();
    }
  }, { passive: true });

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // Menu open / close
  function openMenu() {
    document.body.classList.add('menu-open');
    menuOverlay?.classList.add('active');
  }
  function closeMenu() {
    document.body.classList.remove('menu-open');
    menuOverlay?.classList.remove('active');
  }

  menuToggle?.addEventListener('click', openMenu);
  menuClose?.addEventListener('click', closeMenu);
  menuOverlay?.addEventListener('click', e => { if (e.target === menuOverlay) closeMenu(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOverlay?.classList.contains('active')) closeMenu();
  });

  menuItems.forEach(item => {
    item.addEventListener('click', e => {
      const href = item.getAttribute('href');
      if (href?.startsWith('#')) {
        e.preventDefault();
        closeMenu();
        const targetEl = document.getElementById(href.substring(1));
        if (targetEl) setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => history.replaceState(null, '', window.location.pathname), 800);
        }, 300);
      }
    });
  });

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.length > 1) {
        e.preventDefault();
        document.getElementById(href.substring(1))
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Load GSAP then run animations
  await loadGSAP();
  initAnimations();
});

function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // ── Above-fold entrance (no scroll trigger) ──────────────────────────────
  gsap.from('.intro-tile', {
    opacity: 0, y: 30, duration: 0.9, ease: 'power2.out', stagger: 0.1, delay: 0.15
  });
  gsap.from('.about-hero-heading', {
    opacity: 0, y: 30, duration: 0.9, ease: 'power2.out', delay: 0.2
  });
  gsap.from('.about-hero-text', {
    opacity: 0, y: 20, duration: 0.8, ease: 'power2.out', delay: 0.35
  });
  gsap.from('.cs-hero-stat-logo-name', {
    opacity: 0, y: 20, duration: 0.8, ease: 'power2.out', delay: 0.2
  });
  gsap.from('.cs-services-tag', {
    opacity: 0, y: 15, duration: 0.7, ease: 'power2.out', delay: 0.38
  });
  gsap.from('.portfolio-cases-tagline h2', {
    opacity: 0, y: 30, duration: 0.9, ease: 'power2.out', delay: 0.2
  });

  // ── Scroll-triggered individual elements ────────────────────────────────
  [
    '.intro-hero-title',
    '.intro-strategy-title',
    '.intro-strategy-subtext',
    '.intro-cta',
    '.portfolio-link',
    '.services-heading',
    '.services-intro-text',
    '.portfolio-title',
    '.contact-title',
    '.contact-intro',
    '.cs-section-title',
    '.cs-section-text',
    '.cs-help-heading',
    '.cs-stats-title',
    '.aavrani-videos-section',
  ].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%' },
        opacity: 0, y: 28, duration: 0.75, ease: 'power2.out'
      });
    });
  });

  // ── Staggered groups ──────────────────────────────────────────────────────
  [
    { sel: '.service-item',   parent: '.services-list',           stagger: 0.08 },
    { sel: '.portfolio-item', parent: '.portfolio-grid',          stagger: 0.12 },
    { sel: '.cs-stat-item',   parent: '.cs-stats-grid',           stagger: 0.10 },
    { sel: '.cs-help-block',  parent: '.services-accordion-wrap', stagger: 0.10 },
    { sel: '.team-member',    parent: '.team-grid',               stagger: 0.12 },
    { sel: '.project-card',   parent: '.portfolio-cases-stack',   stagger: 0.12 },
  ].forEach(({ sel, parent, stagger }) => {
    const els = document.querySelectorAll(sel);
    if (!els.length) return;
    const trigger = document.querySelector(parent) || els[0];
    gsap.from(els, {
      scrollTrigger: { trigger, start: 'top 88%' },
      opacity: 0, y: 22, duration: 0.7, ease: 'power2.out', stagger
    });
  });
}
