document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.querySelector('.video-container');
  const section1 = document.querySelector('.section1');
  const svg = document.querySelector('svg');
  const leftContainer = document.querySelector('.left-container');
  const adjText = document.querySelector('.adj');
  const descriptionText = document.querySelector('.description');
  const highlights = document.querySelectorAll('.highlight');
  const parallaxElement = document.querySelector('.parallax');
  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');
  const menuOverlay = document.getElementById('menuOverlay');
  const scrollPrompt = document.getElementById('scrollPrompt');
  const menuItems = document.querySelectorAll('.menu-item');

  // Handle hash on page load - scroll to section and clear hash from URL
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Clear hash from URL after scrolling completes
        setTimeout(() => {
          history.replaceState(null, '', window.location.pathname);
        }, 800);
      }, 100);
    }
  }

  // Check if we're on the landing page (has SVG animation)
  const isLandingPage = svg && section1;

  // Check if animation has been played recently (within last 30 seconds)
  // This allows animation to play in new tabs while skipping on quick navigation
  const animationTimestamp = sessionStorage.getItem('bindaasAnimationTimestamp');
  const currentTime = Date.now();
  const thirtySeconds = 30000; // 30 seconds in milliseconds
  const animationPlayedRecently = animationTimestamp && (currentTime - parseInt(animationTimestamp)) < thirtySeconds;
  
  // Track if menu and scroll prompt have been shown
  let menuShown = false;
  let scrollPromptShown = false;

  // Function to show menu and scroll prompt
  function showMenuAndScrollPrompt() {
    if (!menuShown && menuToggle) {
      menuToggle.classList.add('active');
      menuShown = true;
    }
    if (!scrollPromptShown && scrollPrompt) {
      scrollPrompt.classList.add('active');
      scrollPromptShown = true;
    }
  }

  // Scroll prompt click handler - scrolls to about section
  if (scrollPrompt) {
    scrollPrompt.style.cursor = 'pointer';
    scrollPrompt.addEventListener('click', () => {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // On non-landing pages, show menu immediately
  if (!isLandingPage && menuToggle) {
    showMenuAndScrollPrompt();
  }

  if (isLandingPage && animationPlayedRecently) {
    // Animation already played - skip it and show everything immediately
    svg.classList.add('active');
    // Force all SVG elements to their final state immediately
    setTimeout(() => {
      const svgElements = svg.querySelectorAll('[class*="svg-elem"]');
      svgElements.forEach(elem => {
        elem.style.transition = 'none';
        elem.style.strokeDashoffset = '0';
        if (elem.classList.contains('cls-1') || elem.classList.contains('cls-3')) {
          elem.style.fill = 'rgba(255, 255, 255, 0.725)';
        }
      });
      // Re-enable transitions after a brief moment to avoid flicker
      setTimeout(() => {
        svgElements.forEach(elem => {
          elem.style.transition = '';
        });
      }, 50);
    }, 10);
    
    // Show menu and scroll prompt immediately
    showMenuAndScrollPrompt();
  } else {
    // First time visit - play the animation
    svg.classList.add('active');
    
    // Calculate when SVG animation completes (all elements animated)
    // The last SVG element finishes at ~1.7s + 5s fill = ~6.7s total
    // Show menu and scroll prompt slightly before animation completes for smoother transition
    const animationTimeout = setTimeout(() => {
      showMenuAndScrollPrompt();
      // Mark animation as played with current timestamp
      sessionStorage.setItem('bindaasAnimationTimestamp', currentTime.toString());
    }, 5800);

    // Show menu and scroll prompt immediately if user starts scrolling (only for first visit)
    let hasScrolled = false;
    
    const handleScroll = () => {
      if (!hasScrolled && !menuShown) {
        hasScrolled = true;
        clearTimeout(animationTimeout); // Cancel the delayed animation
        showMenuAndScrollPrompt();
        sessionStorage.setItem('bindaasAnimationTimestamp', Date.now().toString());
        // Remove scroll listener after first scroll
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('wheel', handleWheel);
        window.removeEventListener('touchstart', handleTouch);
      }
    };

    // Also listen for wheel events (mouse wheel) and touch events
    const handleWheel = (e) => {
      if (e.deltaY !== 0 || e.deltaX !== 0) {
        handleScroll();
      }
    };

    const handleTouch = () => {
      handleScroll();
    };

    // Add multiple event listeners to catch scrolling early
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouch, { passive: true });
  }

  // Menu toggle functionality
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      openMenu();
    });
  }

  if (menuClose) {
    menuClose.addEventListener('click', () => {
      closeMenu();
    });
  }

  // Close menu when clicking outside (on menu overlay background)
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
        // Smooth scroll to section
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          setTimeout(() => {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Clear hash from URL after scrolling completes
            setTimeout(() => {
              history.replaceState(null, '', window.location.pathname);
            }, 800);
          }, 300);
        }
      }
      // External links (like case studies) will navigate normally
    });
  });

  function openMenu() {
    document.body.classList.add('menu-open');
    if (menuOverlay) {
      menuOverlay.classList.add('active');
    }
    if (scrollPrompt) {
      scrollPrompt.classList.remove('active');
    }
  }

  function closeMenu() {
    document.body.classList.remove('menu-open');
    if (menuOverlay) {
      menuOverlay.classList.remove('active');
    }
    if (scrollPrompt && !document.body.classList.contains('menu-open')) {
      scrollPrompt.classList.add('active');
    }
  }

  // Parallax effect - relative to element's viewport position
  const applyParallax = () => {
    if (!parallaxElement) return;
    
    const wrapper = document.querySelector('.parallax-wrapper');
    if (!wrapper) return;
    
    // Get the wrapper's position relative to viewport
    const rect = wrapper.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Only apply when element is in or near viewport
    if (rect.bottom < 0 || rect.top > windowHeight) return;
    
    // Calculate progress: 0 = element at bottom of viewport, 1 = element at top
    const progress = 1 - (rect.top + rect.height) / (windowHeight + rect.height);
    
    // Max movement in pixels - faster/more dramatic effect
    const maxMovement = 160;
    
    // Movement ranges from -maxMovement/2 to +maxMovement/2
    const movement = (progress - 0.5) * maxMovement;
    
    parallaxElement.style.transform = `translateY(${movement}px)`;
  };

  // Call on scroll
  window.addEventListener('scroll', applyParallax);
  
  // Initial call
  applyParallax();

  // Intersection Observer to trigger animation every time BINDAAS appears in viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        adjText.classList.add('slide-in');
        descriptionText.classList.add('slide-in');
      } else {
        adjText.classList.remove('slide-in');
        descriptionText.classList.remove('slide-in');
      }
    });
  }, { threshold: 0.3 });

  observer.observe(leftContainer);

  // Intersection Observer to trigger highlight animation
  const highlightObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('highlight-animate');
      } else {
        entry.target.classList.remove('highlight-animate');
      }
    });
  }, { threshold: window.innerWidth <= 400 ? 0.5 : 1 });

  highlights.forEach((highlight) => {
    highlightObserver.observe(highlight);
  });

  // Services Section GSAP Animations
  const servicesSection = document.querySelector('.services-section');
  
  if (servicesSection) {
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate title and intro
    const title = servicesSection.querySelector('.services-main-title');
    const intro = servicesSection.querySelector('.services-intro');
    const tags = gsap.utils.toArray(servicesSection.querySelectorAll('.service-tag'));
    
    // Create timeline for services section
    const servicesTL = gsap.timeline({
      scrollTrigger: {
        trigger: servicesSection,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none none'
      }
    });
    
    // Animate title
    servicesTL.to(title, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, 0);
    
    // Animate intro
    servicesTL.to(intro, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, 0.2);
    
    // Animate tags with stagger
    servicesTL.to(tags, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'back.out(1.2)',
      stagger: {
        amount: 0.6,
        from: 'start'
      }
    }, 0.4);
    
  }

  // Dynamic hamburger menu color based on background
  if (menuToggle) {
    // Sections with dark backgrounds (white hamburger)
    const darkSections = ['hero', 'founder', 'services'];
    // Sections with light backgrounds (dark hamburger)
    const lightSections = ['about', 'contact', 'work'];
    
    const updateMenuColor = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const menuTop = 30; // Menu is 30px from top
      const checkPoint = scrollY + menuTop + 20; // Check point slightly below menu
      
      // Find which section contains the check point
      const sections = document.querySelectorAll('.section, .services-section');
      let currentSection = null;
      
      sections.forEach(section => {
        if (section.id) {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + scrollY;
          const sectionBottom = sectionTop + rect.height;
          
          if (checkPoint >= sectionTop && checkPoint <= sectionBottom) {
            if (!currentSection || sectionTop > currentSection.top) {
              currentSection = { id: section.id, top: sectionTop };
            }
          }
        }
      });
      
      // Update menu color based on current section
      if (currentSection) {
        if (darkSections.includes(currentSection.id)) {
          menuToggle.classList.remove('dark');
        } else if (lightSections.includes(currentSection.id)) {
          menuToggle.classList.add('dark');
        }
      } else {
        // Default to white if no section found (shouldn't happen)
        menuToggle.classList.remove('dark');
      }
    };
    
    // Use Intersection Observer for better performance
    const sectionObserver = new IntersectionObserver((entries) => {
      // Find the section that's most visible at the top
      let topSection = null;
      let minTop = Infinity;
      
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const rect = entry.boundingClientRect;
          if (rect.top >= 0 && rect.top < minTop) {
            minTop = rect.top;
            topSection = entry.target.id;
          }
        }
      });
      
      if (topSection) {
        if (darkSections.includes(topSection)) {
          menuToggle.classList.remove('dark');
        } else if (lightSections.includes(topSection)) {
          menuToggle.classList.add('dark');
        }
      }
    }, {
      root: null,
      rootMargin: '-50px 0px -50% 0px',
      threshold: [0, 0.1]
    });
    
    // Observe all sections
    const sections = document.querySelectorAll('.section, .services-section');
    sections.forEach(section => {
      if (section.id) {
        sectionObserver.observe(section);
      }
    });
    
    // Also check on scroll for smooth updates
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateMenuColor();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Set initial state
    updateMenuColor();
  }

  // Signature animation - trigger when in view
  const signatureSvg = document.querySelector('.signature-svg');
  if (signatureSvg) {
    const signatureObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          // Only animate once
          signatureObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5 // Trigger when 50% of signature is visible
    });
    
    signatureObserver.observe(signatureSvg);
  }
});