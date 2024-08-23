document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.querySelector('.video-container');
  const section1 = document.querySelector('.section1');
  const svg = document.querySelector('svg');
  const video = document.querySelector('.video-container video');
  const leftContainer = document.querySelector('.left-container');
  const adjText = document.querySelector('.adj');
  const descriptionText = document.querySelector('.description');
  const highlights = document.querySelectorAll('.highlight');

  // Add the active class to the SVG on page load to trigger the animation
  svg.classList.add('active');

  // Debugging: Check if small viewport condition is met
  console.log('Window width:', window.innerWidth);

  const adjustStylesOnScroll = () => {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;

    let scalingFactor;
    let startTransitionAt;

    if (window.innerWidth <= 680) { // Adjusted to 400px to capture small devices
      console.log('Applying small viewport adjustments');

      scalingFactor = 20;
      startTransitionAt = windowHeight / 3;

      if (scrollPosition > startTransitionAt) {
        const percentage = Math.min((scrollPosition - startTransitionAt) / (windowHeight / 2 - startTransitionAt), 1);
        const borderRadius = scalingFactor * percentage * 1; // Increase this multiplier to make the borderRadius bigger
        const padding = scalingFactor * percentage * 1; // Increase this multiplier to make the padding bigger

        videoContainer.style.borderRadius = `${borderRadius}px`;
        videoContainer.style.padding = `${padding}px`;
        section1.style.borderRadius = `${borderRadius}px`;
        section1.style.padding = `${padding}px`;
        video.style.borderRadius = `${borderRadius}px`;

        videoContainer.classList.add('scrolled');
      } else {
        videoContainer.style.borderRadius = '0px';
        videoContainer.style.padding = '0px';
        section1.style.borderRadius = '0px';
        section1.style.padding = '0px';
        video.style.borderRadius = '0px';

        videoContainer.classList.remove('scrolled');
      }
    } else {
      // Logic for larger viewports
      scalingFactor = 50;
      startTransitionAt = windowHeight / 4;

      if (scrollPosition > startTransitionAt) {
        const percentage = Math.min((scrollPosition - startTransitionAt) / (windowHeight / 2 - startTransitionAt), 1);
        const borderRadius = scalingFactor * percentage;
        const padding = scalingFactor * percentage;

        videoContainer.style.borderRadius = `${borderRadius}px`;
        videoContainer.style.padding = `${padding}px`;
        section1.style.borderRadius = `${borderRadius}px`;
        section1.style.padding = `${padding}px`;
        video.style.borderRadius = `${borderRadius}px`;
      } else {
        videoContainer.style.borderRadius = '0px';
        videoContainer.style.padding = '0px';
        section1.style.borderRadius = '0px';
        section1.style.padding = '0px';
        video.style.borderRadius = '0px';
      }
    }
  };

  // Call adjustStylesOnScroll on scroll
  document.addEventListener('scroll', adjustStylesOnScroll);

  // Adjust styles on page load as well
  adjustStylesOnScroll();

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
});