// Add a subtle scroll effect to the navbar, more than 50px down it makes it smaller with a shadow
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
        nav.style.padding = '1rem 8%';
    } else {
        nav.style.boxShadow = 'none';
        nav.style.padding = '1.5rem 8%';
    }
});
