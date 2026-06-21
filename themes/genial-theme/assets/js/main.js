document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;

    const prevBtn = carousel.querySelector('.arrow.prev');
    const nextBtn = carousel.querySelector('.arrow.next');
    const slides = Array.from(carousel.querySelectorAll('.project-box'));

    if (slides.length === 0) return;

    let currentIndex = 0;

    function showSlide(index) {
        slides[index].scrollIntoView({ behavior: "smooth" });
        currentIndex = index;
    }

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
});
