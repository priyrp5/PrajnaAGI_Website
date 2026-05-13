/**
 * PrajnaAGI CMS Loader
 * Handles dynamic content fetching for category pages.
 */

async function loadCMSCategoryArticles(containerId, categoryName) {
    try {
        const response = await fetch('content/articles.json');
        const data = await response.json();
        const grid = document.getElementById(containerId);
        if (!grid) return;
        
        // Handle both direct array or wrapped object
        const articlesList = Array.isArray(data) ? data : (data.articles || []);
        
        // Filter for category
        const articles = articlesList.filter(a => a.category === categoryName);
        
        if (articles.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--muted);">फिलहाल कोई लेख उपलब्ध नहीं है।</div>';
            return;
        }

        grid.innerHTML = articles.map(article => `
            <div class="article-card">
                <div class="card-img-wrap">
                    <img src="${article.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600'}" class="card-img" alt="${article.title}">
                </div>
                <div class="card-body">
                    <span class="card-badge">${article.badge || article.category}</span>
                    <h3>${article.title}</h3>
                    <p>${article.summary}</p>
                    <button class="read-more-btn" onclick="toggleArticle(this, event)">पूरा पढ़ें ↓</button>
                    <div class="full-article-content">
                        ${(article.body || article.content || '').split('\n').map(p => `<p>${p}</p>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading articles:', error);
        const grid = document.getElementById(containerId);
        if (grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--muted);">डेटा लोड करने में त्रुटि हुई।</div>';
    }
}

async function loadCMSScience(containerId) {
    try {
        const response = await fetch('content/articles.json');
        const data = await response.json();
        const row = document.getElementById(containerId);
        if (!row) return;
        
        const articlesList = Array.isArray(data) ? data : (data.articles || []);
        const articles = articlesList.filter(a => a.category === 'विज्ञान');
        
        if (articles.length === 0) {
            row.innerHTML = '<div style="padding: 2rem; color: #999;">कोई लेख उपलब्ध नहीं है।</div>';
            return;
        }

        row.innerHTML = articles.map(article => `
            <a href="#" class="sci-card" style="background-image:url('${article.image || 'https://images.unsplash.com/photo-1530213786676-417244ee9f74?auto=format&fit=crop&q=80&w=400'}'); text-decoration:none; color:inherit; display:block;" onclick="showArticlePopup('${article.title}', \`${(article.body || article.content || '').replace(/`/g, '\\`')}\`, event)">
                <div class="card-title">${article.title}</div>
            </a>
        `).join('');
    } catch (error) {
        console.error('Error loading science:', error);
    }
}

async function loadCMSSpace(containerId) {
    try {
        const response = await fetch('content/articles.json');
        const data = await response.json();
        const snap = document.getElementById(containerId);
        if (!snap) return;
        
        const articlesList = Array.isArray(data) ? data : (data.articles || []);
        const articles = articlesList.filter(a => a.category === 'अंतरिक्ष');
        
        if (articles.length === 0) {
            snap.innerHTML = '<section class="space-section"><div class="space-content"><h2 class="space-title">जल्द आ रहा है</h2></div></section>';
            return;
        }

        snap.innerHTML = articles.map((article, index) => `
            <section class="space-section" style="background-image:url('${article.image || 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=1920'}');">
                <div class="space-content" style="animation-delay:${0.2 * (index + 1)}s; opacity: 1; transform: translateY(0);">
                    <h2 class="space-title">${article.title.replace(/\s+/g, '<br>')}</h2>
                    <p class="space-desc">${article.summary}</p>
                    <button class="btn-outline" onclick="showArticlePopup('${article.title}', \`${(article.body || article.content || '').replace(/`/g, '\\`')}\`, event)">पूरी खबर पढ़ें</button>
                </div>
            </section>
        `).join('');
    } catch (error) {
        console.error('Error loading space:', error);
    }
}

function showArticlePopup(title, content, event) {
    if (event) event.preventDefault();
    alert(title + "\n\n" + content);
}

// Global toggle for expandable articles
window.toggleArticle = function(btn, event) {
    if (event) event.preventDefault();
    const content = btn.nextElementSibling;
    if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent;
    if (content.style.display === 'block') {
        content.style.display = 'none';
        btn.textContent = btn.dataset.originalText;
    } else {
        content.style.display = 'block';
        btn.textContent = 'कम करें ↑';
    }
};
