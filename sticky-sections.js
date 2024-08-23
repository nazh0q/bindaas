import { preloadImages } from '/utils.js';

// Selecting DOM elements

const contentElements = [...document.querySelectorAll('.content--sticky')];
const totalContentElements = contentElements.length;

// Function to handle scroll-triggered animations
const scroll = () => {

    contentElements.forEach((el, position) => {
        
        const isLast = position === totalContentElements-1;
        const isPreLast = position === totalContentElements-2;

        gsap.timeline({
            scrollTrigger: {
                trigger: el,
                start: () => {
                    if ( isLast ) {
                        return 'top+=100% top';
                    }
                    else if ( isPreLast ) {
                        return 'bottom top';
                    }
                    else {
                        return 'bottom+=100% top';
                    }
                },
                end: '+=100%',
                scrub: true
            }
        })
        .to(el, {
            ease: 'none',
            yPercent: -100
        }, 0)
        // Animate the content inner image
        .fromTo(el.querySelector('.content__img'), {
            yPercent: 20,
            rotation: 40,
            scale: 0.8
        }, {
            ease: 'none',
            yPercent: -10, // Update yPercent to move up slightly
            rotation: 0,
            scale: 1,
            scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'max',
                scrub: true
            }
        }, 0);

    });

};

// Initialization function
const init = () => {
    scroll(); // Apply scroll-triggered animations
};

preloadImages('.content__img').then(() => {
    // Once images are preloaded, remove the 'loading' indicator/class from the body
    document.body.classList.remove('loading');
    init();
});