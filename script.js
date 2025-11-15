document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const newsListEl = document.getElementById('news-list');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const tickerContentEl = document.getElementById('ticker-content');
    const anchorNewsEl = document.getElementById('anchor-news');
    const mainNav = document.getElementById('main-nav');

    // --- State ---
    let newsDisplayCount = 12;
    let currentFilter = 'all';
    let currentDisplayedNews = [];
    window.allNewsData = [];

    // --- RSS Feeds by Category ---
    // تم إرجاع قائمة روابط RSS هنا
    const rssFeeds = {
        'all': [
            'https://www.aljazeera.net/aljazeera/rss',
            'https://www.almasryalyoum.com/rss/rssfeeds',
            'https://feeds.bbci.co.uk/arabic/rss.xml',
            'https://www.skynewsarabia.com/rss/main.xml',
            'https://arabic.cnn.com/rss',
        ],
        'سياسة': [
            'https://www.aljazeera.net/aljazeera/rss',
            'https://arabic.cnn.com/middle-east/rss',
        ],
        'رياضة': ['https://www.youm7.com/rss/SectionRss?SectionID=320'],
        'تكنولوجيا': ['https://aitnews.com/feed'],
        'منوعات': ['https://www.youm7.com/rss/SectionRss?SectionID=297']
    };

    // --- Static Content Data ---
    const staticContent = {
        'كورسات': `
            <div class="news-item visible">
                <h2>كورسات مجانية</h2>
                <ul style="font-size:1.08em;line-height:2;">
                    <li><a href="https://www.edraak.org/" target="_blank" style="color:#d32f2f;font-weight:bold;">منصة إدراك</a></li>
                    <li><a href="https://www.rwaq.org/" target="_blank" style="color:#283593;font-weight:bold;">منصة رواق</a></li>
                    <li><a href="https://www.coursera.org/courses?query=free" target="_blank" style="color:#d4af37;font-weight:bold;">Coursera Free Courses</a></li>
                </ul>
            </div>`,
        'مقالة': `
            <div class="news-item visible">
                <h2>مقالات وأبحاث مجانية</h2>
                <ul style="font-size:1.08em;line-height:2;">
                    <li><a href="https://scholar.google.com/" target="_blank" style="color:#d32f2f;font-weight:bold;">Google Scholar</a></li>
                    <li><a href="https://www.researchgate.net/" target="_blank" style="color:#283593;font-weight:bold;">ResearchGate</a></li>
                    <li><a href="https://www.ajsrp.com/" target="_blank" style="color:#d4af37;font-weight:bold;">المجلة العربية للعلوم ونشر الأبحاث</a></li>
                </ul>
            </div>`,
        'أسعار': `
            <div class="news-item visible">
                <h2>أسعار الذهب والعملات (كمثال)</h2>
                <ul style="font-size:1.08em;line-height:2; list-style-type: none; padding-right: 0;">
                    <li><strong>ذهب عيار 24:</strong> 3500 جنيه مصري</li>
                    <li><strong>ذهب عيار 21:</strong> 3100 جنيه مصري</li>
                    <li><strong>دولار أمريكي:</strong> 47.50 جنيه مصري</li>
                    <li><strong>ريال سعودي:</strong> 12.60 جنيه مصري</li>
                </ul>
                <p style="font-size: 0.9em; color: #777;">الأسعار استرشادية وقد تتغير.</p>
            </div>`
    };

    // --- Functions ---

    // دالة لجلب وتحليل بيانات RSS
    function fetchRss(feedUrl) {
        // استخدام خدمة rss2json لتحويل RSS إلى JSON وتجنب مشاكل CORS
        return fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`)
            .then(response => {
                if (response.ok) return response.json();
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                // التأكد من أن `data.items` موجود قبل إرجاعه
                if (data && data.items) {
                    // إضافة اسم الفئة لكل خبر (إذا احتجت للفلترة لاحقًا)
                    return data.items.map(item => ({ ...item, description: item.description?.replace(/<[^>]*>/g, '') || '' }));
                }
                return []; // إرجاع مصفوفة فارغة في حالة عدم وجود أخبار
            })
            .catch(error => {
                console.error(`Error fetching RSS feed: ${feedUrl}`, error);
                return []; // إرجاع مصفوفة فارغة في حالة حدوث خطأ
            });
    }

    function showNewsAnimation() {
        const items = document.querySelectorAll('.news-item');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        items.forEach(item => observer.observe(item));
    }

    function renderNews(newsArray) {
        let newsHtml = '';

        // Handle static content first
        if (staticContent[currentFilter]) {
            newsHtml = staticContent[currentFilter];
            loadMoreBtn.style.display = 'none';
        } else if (newsArray && newsArray.length > 0) {
            newsHtml = newsArray.slice(0, newsDisplayCount).map((a, i) => `
                <article class="news-item" data-index="${i}" style="cursor:pointer;">
                    ${a.enclosure && a.enclosure.link ? `<img src='${a.enclosure.link}' alt='صورة الخبر'>` : ''}
                    <div class="news-item-content">
                        <h2>${a.title}</h2>
                        <p>${a.description ? a.description.substring(0, 150) + '...' : ''}</p>
                        <a href='${a.link}' target='_blank' class='read-more'>اقرأ المزيد</a>
                    </div>
                </article>
            `).join('');
            loadMoreBtn.style.display = (newsArray.length > newsDisplayCount) ? 'inline-block' : 'none';
        } else {
            newsHtml = `
                <div class="no-news-container">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="no-news-icon"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
                    <h2>لا توجد نتائج</h2>
                    <p>لم نتمكن من العثور على أخبار تطابق بحثك أو هذا القسم. حاول استخدام كلمات مختلفة.</p>
                </div>
            `;
            loadMoreBtn.style.display = 'none';
        }
        newsListEl.innerHTML = newsHtml;
        setTimeout(showNewsAnimation, 50);
    }

    function loadMoreNews() {
        newsDisplayCount += 8;
        renderNews(currentDisplayedNews);
    }

    async function filterNews(category) {
        currentFilter = category;
        searchInput.value = '';
        newsDisplayCount = 12;
        newsListEl.innerHTML = `<article class="news-item visible"><h2>جاري تحميل أخبار ${category}...</h2></article>`;
        loadMoreBtn.style.display = 'none';

        // If it's a static category, render it directly
        if (staticContent[category]) {
            renderNews([]); // The function will handle static content
            return;
        }

        try {
            // جلب الأخبار من روابط RSS مباشرة
            const feedsToFetch = rssFeeds[category] || rssFeeds['all'];
            const promises = feedsToFetch.map(feed => fetchRss(feed));
            const results = await Promise.all(promises);
            let news = results.flat(); // دمج نتائج جميع الروابط في مصفوفة واحدة

            // ترتيب الأخبار حسب تاريخ النشر من الأحدث للأقدم
            news.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
            // تخزين البيانات للبحث لاحقًا إذا لزم الأمر
            if (category === 'all') {
                window.allNewsData = news;
            }
            currentDisplayedNews = news;
        } catch (error) {
            console.error("Error fetching news:", error);
            currentDisplayedNews = []; // عرض رسالة خطأ
        }
        renderNews(currentDisplayedNews);
    }

    function searchNews() {
        const query = searchInput.value.toLowerCase();
        newsDisplayCount = 12;
        if (!query) {
            filterNews(currentFilter); // Re-load current category if search is cleared
            return;
        }

        newsListEl.innerHTML = `<article class="news-item visible"><h2>جاري البحث عن "${query}"...</h2></article>`;
        loadMoreBtn.style.display = 'none';

        try {
            // استدعاء الدالة السحابية مع تمرير مصطلح البحث
            const response = await fetch(`/.netlify/functions/get-news?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Network response was not ok.');
            currentDisplayedNews = await response.json();
        } catch (error) {
            console.error("Error searching news:", error);
            currentDisplayedNews = [];
        }
        renderNews(currentDisplayedNews);
    }

    function showAnchorNews(idx) {
        if (currentDisplayedNews && currentDisplayedNews[idx]) {
            anchorNewsEl.textContent = currentDisplayedNews[idx].title;
        }
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }

    async function loadAllNews() {
        // عند تحميل الصفحة، نقوم بفلترة الأخبار حسب فئة "all"
        // والتي ستستدعي الدالة السحابية لجلب كل الأخبار
        await filterNews('all');

        // الكود أدناه سيتم تنفيذه بعد جلب البيانات في filterNews
        const allNews = currentDisplayedNews;
        window.allNewsData = allNews; // Store all news for searching

        if (allNews.length > 0) {
            tickerContentEl.textContent = allNews.slice(0, 15).map(a => a.title).join(' | ');
            anchorNewsEl.textContent = allNews[0].title;
            renderNews(currentDisplayedNews);
        } else {
            tickerContentEl.textContent = 'فشل في جلب الأخبار. يرجى المحاولة مرة أخرى لاحقًا.';
            newsListEl.innerHTML = `
                <div class="no-news-container">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="no-news-icon"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
                    <h2>خطأ في التحميل</h2>
                    <p>عذرًا، لم نتمكن من جلب الأخبار حاليًا. يرجى المحاولة مرة أخرى لاحقًا.</p>
                </div>
            `;
            anchorNewsEl.textContent = 'لا توجد أخبار متاحة حالياً.';
        }
    }

    // --- Event Listeners ---
    loadMoreBtn.addEventListener('click', loadMoreNews);
    searchBtn.addEventListener('click', searchNews);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchNews();
        }
    });

    mainNav.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-category]');
        if (link) {
            e.preventDefault();
            filterNews(link.dataset.category);
        }
    });

    newsListEl.addEventListener('click', (e) => {
        const item = e.target.closest('.news-item, .news-item-content');
        const newsArticle = item ? item.closest('article.news-item') : null;
        if (newsArticle && newsArticle.dataset.index) {
            showAnchorNews(parseInt(newsArticle.dataset.index, 10));
        }
    });

    // --- Initial Load ---
    loadAllNews();
});