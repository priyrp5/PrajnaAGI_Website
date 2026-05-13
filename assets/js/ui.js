// ── SHARED UI LOGIC ─────────────────────────────────────────────────────────

// Theme Toggle Logic
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
    themeBtn.addEventListener('click', function () {
        const currentTheme = document.body.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', nextTheme);
        this.textContent = nextTheme === 'light' ? '🌙 रात' : '☀️ दिन';
        localStorage.setItem('theme', nextTheme);
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        themeBtn.textContent = savedTheme === 'light' ? '🌙 रात' : '☀️ दिन';
    }
}

// Hamburger Mobile Menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        this.setAttribute('aria-label', isOpen ? 'मेनू बंद करें' : 'मेनू खोलें');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            hamburger.classList.remove('open');
        });
    });
}

// Search Bar Expansion
const searchBtn = document.querySelector('.search-btn');
const searchInput = document.querySelector('.search-input');
if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
        searchInput.classList.toggle('expanded');
        if (searchInput.classList.contains('expanded')) searchInput.focus();
    });
}

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Article Expansion (Expandable Articles)
function toggleArticle(btn, e) {
    if (e) e.preventDefault();
    const card = btn.closest('.clickable-card');
    const content = card.querySelector('.full-article-content');
    if (!content) return;
    
    const isVisible = content.style.display === 'block';
    content.style.display = isVisible ? 'none' : 'block';
    btn.textContent = isVisible ? 'पूरा पढ़ें ↓' : 'कम दिखाएं ↑';
}

// Global reveal on scroll (Intersection Observer)
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const fill = e.target.querySelector('.progress-fill');
            if (fill) fill.style.width = fill.getAttribute('data-percent');
            e.target.classList.add('revealed');
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.clickable-card, .section-title').forEach(el => {
    revealObserver.observe(el);
});

// Newsletter Validation
const subBtn = document.querySelector('.subscribe-btn');
if (subBtn) {
    subBtn.addEventListener('click', function () {
        const inp = document.querySelector('.newsletter-input');
        if (inp && inp.value && inp.value.includes('@')) {
            inp.value = '';
            const originalText = this.textContent;
            this.textContent = '✅ धन्यवाद!';
            setTimeout(() => this.textContent = originalText, 3000);
        } else if (inp) {
            inp.style.borderColor = '#ff5252';
            setTimeout(() => inp.style.borderColor = '', 2000);
        }
    });
}
