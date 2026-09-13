// Client-side site search for pages/search.html.
// There is no build step, so each page is fetched and scanned in the browser.
(function () {
    'use strict';

    // Every indexable page, relative to /pages/. Keep in sync with sitemap.xml.
    // search.html itself and 404.html are deliberately excluded.
    const PAGES = [
        '../index.html',
        'blog.html',
        'computational-works.html',
        'cv.html',
        'gallery.html',
        'hardware-development.html',
        'presentations.html',
        'project-pica.html',
        'Project_Kusanagi-AI.html',
        'Project_TupperTransformer.html',
        'research.html',
        'resources.html',
        'sitemap.html',
        'Sudip_Mukherjee_Materials_Physics_Lab.html'
    ];

    const SOCIAL_INDEX_URL = '../_assets/social-search-index.json';
    const SNIPPET_PADDING = 50;

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResults = document.getElementById('search-results');
    if (!searchInput || !searchButton || !searchResults) return;

    // The query goes into both a RegExp and the DOM, so it needs escaping twice over.
    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    function escapeHTML(s) {
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    // Text as a reader sees it: no <script>/<style> bodies, so the JSON-LD blocks
    // embedded in every page don't match (and drown) real queries.
    function visibleText(doc) {
        doc.querySelectorAll('script, style, noscript').forEach(el => el.remove());
        return (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function pageUrl(path) {
        // Resolve against the current page, then keep only the site-root path.
        return new URL(path, window.location.href).pathname;
    }

    async function fetchPage(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) return null;
            const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
            return {
                url: pageUrl(path),
                title: doc.querySelector('title')?.textContent?.trim() || path,
                content: visibleText(doc)
            };
        } catch (error) {
            console.error('Search: could not load', path, error);
            return null;
        }
    }

    async function fetchSocialProfiles() {
        try {
            const response = await fetch(SOCIAL_INDEX_URL);
            if (!response.ok) return [];
            const profiles = await response.json();
            return profiles.map(profile => ({
                url: profile.url,
                title: profile.title,
                content: profile.content
            }));
        } catch (error) {
            console.error('Search: could not load the social index:', error);
            return [];
        }
    }

    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            searchResults.textContent = 'Please enter a search term.';
            return;
        }

        searchResults.textContent = 'Searching…';

        const [profiles, ...pages] = await Promise.all([
            fetchSocialProfiles(),
            ...PAGES.map(fetchPage)
        ]);

        const needle = query.toLowerCase();
        const results = [...profiles, ...pages]
            .filter(Boolean)
            .filter(entry => `${entry.title} ${entry.content}`.toLowerCase().includes(needle));

        displayResults(results, query);
    }

    function displayResults(results, query) {
        if (results.length === 0) {
            searchResults.textContent = 'No results found.';
            return;
        }

        const items = results.map(result => {
            const isExternal = /^https?:/i.test(result.url);
            const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
            const icon = isExternal ? ' <i class="fas fa-external-link-alt text-sm ml-1" aria-hidden="true"></i>' : '';
            const shown = isExternal ? result.url : window.location.origin + result.url;
            return `<li class="mb-4">
                <a href="${escapeHTML(result.url)}" class="text-xl text-accent-orange hover:underline"${target}>${escapeHTML(result.title)}${icon}</a>
                <p class="text-light-slate">${snippetHTML(result.content, query)}</p>
                <p class="text-sm text-slate mt-1">${escapeHTML(shown)}</p>
            </li>`;
        });

        searchResults.innerHTML = `<ul>${items.join('')}</ul>`;
    }

    // Returns escaped HTML with every occurrence of the query highlighted.
    function snippetHTML(content, query) {
        const index = content.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return '';

        const start = Math.max(0, index - SNIPPET_PADDING);
        const end = Math.min(content.length, index + query.length + SNIPPET_PADDING);
        const highlighted = escapeHTML(content.slice(start, end))
            .replace(
                new RegExp(escapeRegExp(escapeHTML(query)), 'gi'),
                match => `<strong class="text-accent-orange">${match}</strong>`
            );

        return `…${highlighted}…`;
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') performSearch();
    });

    // Run immediately when arriving from the header search form (search.html?q=...).
    const initialQuery = new URLSearchParams(window.location.search).get('q');
    if (initialQuery) {
        searchInput.value = initialQuery;
        performSearch();
    }
})();
