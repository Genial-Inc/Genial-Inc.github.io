document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked (especially for same-page anchor links)
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // --- Carousel Navigation ---
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        const prevBtn = carousel.querySelector('.arrow.prev');
        const nextBtn = carousel.querySelector('.arrow.next');
        const slides = Array.from(carousel.querySelectorAll('.project-box'));

        if (slides.length > 0) {
            let currentIndex = 0;

            const showSlide = (index) => {
                slides[index].scrollIntoView({ behavior: "smooth" });
                currentIndex = index;
            };

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    let index = currentIndex - 1;
                    if (index < 0) {
                        index = slides.length - 1;
                    }
                    showSlide(index);
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    let index = (currentIndex + 1) % slides.length;
                    showSlide(index);
                });
            }
        }
    }
});
