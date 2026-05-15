// ── HELPERS ──────────────────────────────────────────────────────────
async function fetchJSON(path) {
    try {
        console.log(`[CMS] Fetching: ${path}`);
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(`[CMS] Error fetching ${path}:`, e);
        return null;
    }
}

// ── NAVIGATION LOADER ─────────────────────────────────────────────
async function loadCMSNav() {
    const desktopMenu = document.querySelector('.menu-tabs');
    const mobileMenu = document.querySelector('.mobile-menu ul');
    if (!desktopMenu && !mobileMenu) return;

    const data = await fetchJSON('content/nav.json');
    if (!data || !data.items) return;

    const navHTML = data.items.map(item => `
        <li><a href="${item.link}">${item.label}</a></li>
    `).join('');

    if (desktopMenu) desktopMenu.innerHTML = navHTML;
    if (mobileMenu) mobileMenu.innerHTML = navHTML;
}

// ── CATEGORY PAGE LOADER ──────────────────────────────────────────
async function loadCMSCategoryArticles(containerId, categoryName) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = await fetchJSON('content/articles.json');
    if (!data || !data.articles) return;

    const filtered = data.articles.filter(a => a.category === categoryName && a.status !== 'Draft');
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:5rem; opacity:0.6;">इस श्रेणी में अभी कोई लेख नहीं हैं।</p>';
        return;
    }

    const featured = filtered[0];
    const others = filtered.slice(1);

    let html = `
        <div class="featured-grid" style="margin-bottom:2.5rem;">
            <a href="article.html?id=${encodeURIComponent(featured.slug || featured.title)}" class="clickable-card featured-main">
                <div class="featured-img" style="background-image: url('${featured.image}')"></div>
                <div class="featured-content">
                    <span class="tag" style="color:var(--accent); font-weight:800; font-size:0.75rem;">${featured.tag || '⭐ Featured'}</span>
                    <h3 style="margin:10px 0 8px; font-size:1.5rem;">${featured.title}</h3>
                    <p style="color:var(--text-muted); font-size:0.95rem;">${featured.summary}</p>
                </div>
            </a>
        </div>
        <div class="card-grid">
            ${others.map(article => `
                <a href="article.html?id=${encodeURIComponent(article.slug || article.title)}" class="clickable-card">
                    <div style="height:180px; background:url('${article.image}') center/cover;"></div>
                    <div style="padding:1.4rem;">
                        <span class="tag" style="color:var(--accent); font-weight:800; font-size:0.7rem;">${article.category}</span>
                        <h3 style="margin:8px 0; font-size:1.1rem;">${article.title}</h3>
                        <p style="color:var(--text-muted); font-size:0.85rem; line-height:1.4;">${article.summary}</p>
                    </div>
                </a>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;
}

// ── HOMEPAGE LOADER ───────────────────────────────────────────────
async function loadCMSHome(latestContainerId) {
    const data = await fetchJSON('content/articles.json');
    if (!data || !data.articles) return;

    const articles = data.articles.filter(a => a.status !== 'Draft');
    if (articles.length === 0) return;

    // Featured Section
    const featuredGrid = document.querySelector('.featured-grid');
    if (featuredGrid) {
        const feat = articles[0];
        const side = articles.slice(1, 4);
        
        featuredGrid.innerHTML = `
            <a href="article.html?id=${encodeURIComponent(feat.slug || feat.title)}" class="clickable-card featured-main">
                <div class="featured-img" style="background-image: url('${feat.image}')"></div>
                <div class="featured-content">
                    <span class="tag featured-tag">${feat.tag || '⭐ Featured'}</span>
                    <h3 class="featured-title">${feat.title}</h3>
                    <p class="featured-summary">${feat.summary}</p>
                </div>
            </a>
            <div class="side-news">
                ${side.map(s => `
                    <a href="article.html?id=${encodeURIComponent(s.slug || s.title)}" class="clickable-card side-news-card">
                        <h4 style="margin:0 0 5px; font-size:1rem;">${s.title}</h4>
                        <p class="side-news-meta" style="font-size:0.75rem; opacity:0.7;">${s.category} • ${new Date(s.date).toLocaleDateString('hi-IN')}</p>
                    </a>
                `).join('')}
            </div>
        `;
    }

    // Latest Grid
    const latestGrid = document.getElementById(latestContainerId);
    if (latestGrid) {
        const others = articles.slice(4);
        latestGrid.innerHTML = others.map(article => `
            <a href="article.html?id=${encodeURIComponent(article.slug || article.title)}" class="clickable-card">
                <div style="height:180px; background:url('${article.image}') center/cover;"></div>
                <div style="padding:1.4rem;">
                    <span class="tag" style="color:var(--accent); font-weight:800; font-size:0.7rem;">${article.category}</span>
                    <h3 style="margin:8px 0; font-size:1.1rem;">${article.title}</h3>
                    <p style="color:var(--text-muted); font-size:0.85rem; line-height:1.4;">${article.summary}</p>
                </div>
            </a>
        `).join('');
    }
}

// ── TICKER LOADER ────────────────────────────────────────────────
async function loadCMSTicker(containerClass) {
    const tracks = document.querySelectorAll(`.${containerClass}`);
    if (tracks.length === 0) return;

    const tickerData = await fetchJSON('content/ticker.json');
    if (!tickerData || !tickerData.items) return;

    const tickerHTML = tickerData.items.map(item => `
        <span>${item.text}</span><span>•</span>
    `).join('');

    tracks.forEach(track => {
        track.innerHTML = tickerHTML + tickerHTML;
    });
}

// ── FULL ARTICLE LOADER ───────────────────────────────
async function loadFullArticle() {
    console.log("[CMS] Article Page Loader Triggered.");
    const contentArea = document.getElementById('markdown-content');
    if (!contentArea) return;

    // More robust ID extraction
    const url = new URL(window.location.href);
    let articleId = url.searchParams.get('id');
    
    if (!articleId) {
        // Fallback for manual parsing
        const match = window.location.href.match(/[?&]id=([^&#]*)/);
        articleId = match ? match[1] : null;
    }

    if (articleId) articleId = decodeURIComponent(articleId);
    console.log(`[CMS] Resolved Article ID: ${articleId}`);
    
    if (!articleId) {
        console.warn("[CMS] No ID found. Showing error state.");
        contentArea.innerHTML = '<div class="loading-state">लेख का पता नहीं चला (Missing ID)।</div>';
        return;
    }

    try {
        const [articleData, authorData] = await Promise.all([
            fetchJSON('content/articles.json'),
            fetchJSON('content/authors.json')
        ]);

        if (!articleData || !articleData.articles) {
            contentArea.innerHTML = '<div class="loading-state">डेटा लोड करने में असमर्थ।</div>';
            return;
        }

        const article = articleData.articles.find(a => (a.slug === articleId || a.title === articleId));
        if (!article) {
            console.error(`[CMS] Article NOT FOUND in JSON: ${articleId}`);
            contentArea.innerHTML = '<div class="loading-state">क्षमा करें, यह लेख हमारी लाइब्रेरी में नहीं मिला।</div>';
            return;
        }

        console.log(`[CMS] Article Found: ${article.title}. Rendering...`);

        // Set Hero & Title
        const hero = document.getElementById('article-hero');
        if (hero) hero.style.backgroundImage = `url('${article.image}')`;
        
        const titleEl = document.getElementById('article-title');
        if (titleEl) titleEl.textContent = article.title;
        
        const metaEl = document.getElementById('article-meta');
        if (metaEl) {
            const dateStr = article.date ? new Date(article.date).toLocaleDateString('hi-IN') : '';
            metaEl.innerHTML = `${article.tag || '🚀 News'} • ${article.category} ${dateStr ? '• ' + dateStr : ''}`;
        }

        // Body Content
        const bodyHtml = article.body.split('\n').filter(p => p.trim()).map(p => `<p>${p.trim()}</p>`).join('');
        let finalHtml = `<div class="article-text-content">${bodyHtml}</div>`;

        if (article.video_id) {
            finalHtml += `
                <div class="video-container" style="margin:3rem 0; position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:20px; box-shadow:0 15px-40px rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1);">
                    <iframe src="https://www.youtube.com/embed/${article.video_id}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
                </div>
            `;
        }

        // Author Card
        if (article.author_id && authorData && authorData.authors) {
            const author = authorData.authors.find(a => a.id === article.author_id);
            if (author) {
                finalHtml += `
                    <div class="author-card" style="margin-top:5rem; padding:2.5rem; background:rgba(255,255,255,0.02); border-radius:20px; display:flex; gap:2rem; align-items:center; border:1px solid rgba(255,255,255,0.08); backdrop-filter:blur(10px);">
                        <img src="${author.image}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid var(--accent);" alt="${author.name}">
                        <div>
                            <span style="color:var(--accent); font-size:0.85rem; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">लेखक परिचय</span>
                            <h4 style="margin:8px 0; font-size:1.4rem; font-weight:900;">${author.name}</h4>
                            <p style="font-size:1rem; opacity:0.8; line-height:1.6; margin:0;">${author.bio}</p>
                        </div>
                    </div>
                `;
            }
        }

        contentArea.innerHTML = finalHtml;
        document.title = `${article.title} — PrajnaAGI`;
        console.log("[CMS] Article Page Loaded Successfully.");

    } catch (e) {
        console.error("[CMS] Render Exception:", e);
        contentArea.innerHTML = '<div class="loading-state">एक तकनीकी त्रुटि हुई। कृपया पुन: प्रयास करें।</div>';
    }
}

// ── INITIALIZE ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    console.log("[CMS] App Init...");
    loadCMSNav();

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search')?.toLowerCase();

    if (searchQuery) {
        handleSearch(searchQuery);
    } else {
        initCMS();
    }
});

async function initCMS() {
    if (document.getElementById('cms-latest-grid')) {
        loadCMSHome('cms-latest-grid');
    }
    
    if (document.querySelector('.ticker-track')) {
        loadCMSTicker('ticker-track');
    }
    
    if (document.getElementById('article-detail-container')) {
        loadFullArticle();
    }

    const grids = [
        { id: 'cms-tech-grid', cat: 'तकनीक' },
        { id: 'cms-science-grid', cat: 'विज्ञान' },
        { id: 'cms-space-grid', cat: 'अंतरिक्ष' },
        { id: 'cms-environment-grid', cat: 'पर्यावरण' },
        { id: 'cms-health-grid', cat: 'स्वास्थ्य' }
    ];

    grids.forEach(g => {
        if (document.getElementById(g.id)) loadCMSCategoryArticles(g.id, g.cat);
    });
}

async function handleSearch(query) {
    const mainSection = document.querySelector('section.section');
    if (!mainSection) return;

    mainSection.innerHTML = `
        <h2 class="section-title">🔍 खोज परिणाम: "${query}"</h2>
        <div class="card-grid" id="search-results-grid">
            <div class="loading-box">खोज रहे हैं...</div>
        </div>
    `;

    const data = await fetchJSON('content/articles.json');
    if (!data || !data.articles) return;

    const filtered = data.articles.filter(a => 
        (a.title.toLowerCase().includes(query) || 
        a.category.toLowerCase().includes(query) ||
        (a.summary && a.summary.toLowerCase().includes(query))) && a.status !== 'Draft'
    );

    const grid = document.getElementById('search-results-grid');
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:5rem; opacity:0.6;">कोई परिणाम नहीं मिला।</p>';
        return;
    }

    grid.innerHTML = filtered.map(article => `
        <a href="article.html?id=${encodeURIComponent(article.slug || article.title)}" class="clickable-card">
            <div style="height:180px; background:url('${article.image}') center/cover;"></div>
            <div style="padding:1.4rem;">
                <span class="tag" style="color:var(--accent); font-weight:800; font-size:0.7rem;">${article.category}</span>
                <h3 style="margin:8px 0; font-size:1.1rem;">${article.title}</h3>
                <p style="color:var(--text-muted); font-size:0.85rem; line-height:1.4;">${article.summary}</p>
            </div>
        </a>
    `).join('');
}
