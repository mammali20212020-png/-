// كود جافاسكريبت المنفصل للموقع
const rssFeeds = [
    'https://www.aljazeera.net/aljazeera/rss',
    'https://www.almasryalyoum.com/rss/rssfeeds'
];
function fetchRss(feedUrl) {
    return fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`)
        .then(response => response.json())
        .then(data => data.items || [])
        .catch(() => []);
}
async function loadAllNews() {
    let allNews = [];
    for (const feed of rssFeeds) {
        const news = await fetchRss(feed);
        allNews = allNews.concat(news);
    }
    allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    let newsTicker = '';
    let newsHtml = '';
    let anchorNews = document.getElementById('anchor-news');
    window.allNewsData = allNews;
    window.displayedCount = 12;
    if (allNews.length > 0) {
        newsTicker = allNews.slice(0, 10).map(a => a.title).join(' | ');
        newsHtml = allNews.slice(0, window.displayedCount).map((a, i) => `
            <div class="news-item" style="cursor:pointer;" onclick="showAnchorNews(${i})">
                ${a.enclosure && a.enclosure.link ? `<img src='${a.enclosure.link}' alt='صورة الخبر' style='width:100%;max-height:180px;object-fit:cover;border-radius:8px 8px 0 0;'>` : ''}
                <h2>${a.title}</h2>
                <p>${a.description ? a.description : ''}</p>
                <a href='${a.link}' target='_blank' style='color:#283593;font-weight:bold;'>اقرأ المزيد</a>
            </div>
        `).join('');
        anchorNews.textContent = allNews[0].title;
    } else {
        newsTicker = 'لا توجد أخبار متاحة حالياً.';
        newsHtml = '<div class="news-item"><h2>لا توجد أخبار متاحة حالياً.</h2></div>';
        anchorNews.textContent = 'لا توجد أخبار متاحة حالياً.';
    }
    document.getElementById('ticker-content').textContent = newsTicker;
    document.getElementById('news-list').innerHTML = newsHtml;
    // زر تحميل المزيد
    if (document.getElementById('load-more')) {
        document.getElementById('load-more').style.display = (allNews.length > window.displayedCount) ? 'block' : 'none';
    }
}
function showAnchorNews(idx) {
    if (window.allNewsData && window.allNewsData[idx]) {
        document.getElementById('anchor-news').textContent = window.allNewsData[idx].title + '\n' + (window.allNewsData[idx].description || '');
    }
}
function filterNews(section) {
    if (!window.allNewsData) window.allNewsData = [];
    let filtered = window.allNewsData;
    let newsHtml = '';
    window.displayedCount = 12;
    if (section === 'كورسات') {
        newsHtml = `<div class="news-item"><h2>كورسات مجانية</h2><ul style="font-size:1.08em;line-height:2;">
            <li><a href="https://www.edraak.org/" target="_blank" style="color:#d32f2f;font-weight:bold;">منصة إدراك</a> - كورسات مجانية باللغة العربية</li>
            <li><a href="https://www.rwaq.org/" target="_blank" style="color:#283593;font-weight:bold;">منصة رواق</a> - كورسات أكاديمية مجانية</li>
            <li><a href="https://www.coursera.org/courses?query=free" target="_blank" style="color:#d4af37;font-weight:bold;">Coursera Free Courses</a> - كورسات مجانية بالإنجليزية</li>
            <li><a href="https://alison.com/courses" target="_blank" style="color:#283593;font-weight:bold;">Alison</a> - كورسات مجانية متنوعة</li>
            <li><a href="https://www.futurelearn.com/courses/collections/free-online-courses" target="_blank" style="color:#d32f2f;font-weight:bold;">FutureLearn</a> - كورسات مجانية في جميع المجالات</li>
            <li><a href="https://www.udemy.com/courses/free/" target="_blank" style="color:#283593;font-weight:bold;">Udemy Free Courses</a> - كورسات مجانية في البرمجة والتصميم وغيرها</li>
            <li><a href="https://www.khanacademy.org/" target="_blank" style="color:#d4af37;font-weight:bold;">Khan Academy</a> - تعليم مجاني في الرياضيات والعلوم</li>
            <li><a href="https://www.open.edu/openlearn/free-courses/full-catalogue" target="_blank" style="color:#d32f2f;font-weight:bold;">OpenLearn</a> - كورسات مجانية من الجامعة المفتوحة البريطانية</li>
            <li><a href="https://www.skillshare.com/browse/free-classes" target="_blank" style="color:#283593;font-weight:bold;">Skillshare Free Classes</a> - كورسات مجانية في الإبداع والتصميم</li>
            <li><a href="https://www.saylor.org/courses/" target="_blank" style="color:#d4af37;font-weight:bold;">Saylor Academy</a> - كورسات مجانية في الإدارة والبرمجة</li>
        </ul></div>`;
    } else if (section === 'مقالة') {
        newsHtml = `<div class="news-item"><h2>مقالات وأبحاث مجانية</h2><ul style="font-size:1.08em;line-height:2;">
            <li><a href="https://scholar.google.com/" target="_blank" style="color:#d32f2f;font-weight:bold;">Google Scholar</a> - أبحاث ومقالات أكاديمية مجانية</li>
            <li><a href="https://www.researchgate.net/" target="_blank" style="color:#283593;font-weight:bold;">ResearchGate</a> - أبحاث علمية مجانية</li>
            <li><a href="https://www.ajsrp.com/" target="_blank" style="color:#d4af37;font-weight:bold;">المجلة العربية للعلوم ونشر الأبحاث</a> - أبحاث ومقالات عربية</li>
            <li><a href="https://www.sciencedirect.com/" target="_blank" style="color:#d32f2f;font-weight:bold;">ScienceDirect</a> - أبحاث ومقالات علمية مجانية</li>
            <li><a href="https://arxiv.org/" target="_blank" style="color:#283593;font-weight:bold;">arXiv</a> - أبحاث في الفيزياء والرياضيات وعلوم الحاسب</li>
            <li><a href="https://www.springeropen.com/journals" target="_blank" style="color:#d4af37;font-weight:bold;">SpringerOpen</a> - مجلات وأبحاث مجانية في جميع التخصصات</li>
            <li><a href="https://journals.plos.org/" target="_blank" style="color:#d32f2f;font-weight:bold;">PLOS Journals</a> - أبحاث مجانية في العلوم والصحة</li>
            <li><a href="https://www.tandfonline.com/openaccess" target="_blank" style="color:#283593;font-weight:bold;">Taylor & Francis Open Access</a> - أبحاث مجانية في العلوم الإنسانية والاجتماعية</li>
        </ul></div>`;
    } else {
        if (section !== 'all') {
            filtered = filtered.filter(a =>
                a.title.includes(section) ||
                (a.description && a.description.includes(section)) ||
                (section === 'كورسات' && (a.title.includes('دورة') || a.title.includes('كورسات') || (a.description && a.description.includes('دورة')))) ||
                (section === 'مقالة' && (a.title.includes('مقالة') || a.title.includes('بحث') || (a.description && (a.description.includes('مقالة') || a.description.includes('بحث')))))
            );
        }
        if (filtered.length > 0) {
            newsHtml = filtered.slice(0, window.displayedCount).map((a, i) => `
                <div class="news-item" style="cursor:pointer;" onclick="showAnchorNews(${i})">
                    ${a.enclosure && a.enclosure.link ? `<img src='${a.enclosure.link}' alt='صورة الخبر' style='width:100%;max-height:180px;object-fit:cover;border-radius:8px 8px 0 0;'>` : ''}
                    <h2>${a.title}</h2>
                    <p>${a.description ? a.description : ''}</p>
                    <a href='${a.link}' target='_blank' style='color:#283593;font-weight:bold;'>اقرأ المزيد</a>
                </div>
            `).join('');
        } else {
            newsHtml = '<div class="news-item"><h2>لا توجد أخبار متاحة لهذا القسم.</h2></div>';
        }
    }
    document.getElementById('news-list').innerHTML = newsHtml;
    // زر تحميل المزيد
    if (document.getElementById('load-more')) {
        document.getElementById('load-more').style.display = (filtered.length > window.displayedCount) ? 'block' : 'none';
        document.getElementById('load-more').onclick = function () {
            window.displayedCount += 8;
            filterNews(section);
        };
    }
}
document.addEventListener('DOMContentLoaded', function () {
    loadAllNews();
    // زر تحميل المزيد
    if (!document.getElementById('load-more')) {
        let btn = document.createElement('button');
        btn.id = 'load-more';
        btn.textContent = 'تحميل المزيد';
        btn.style.margin = '20px auto';
        btn.style.display = 'block';
        btn.style.padding = '10px 24px';
        btn.style.fontSize = '1.08em';
        btn.style.background = '#d4af37';
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.borderRadius = '8px';
        btn.style.cursor = 'pointer';
        document.getElementById('news-list').after(btn);
    }
});
