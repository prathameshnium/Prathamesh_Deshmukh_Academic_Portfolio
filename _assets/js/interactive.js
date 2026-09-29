// Interactive layer, loaded by main.js after the shared header/footer exist.
//   - scroll reveal, progress bar, back-to-top button
//   - search / tag filter / sort toolbar for any element marked [data-filter]
//   - image lightbox for any <a data-lightbox="group">
//
// Filter markup (all optional except data-filter):
//   data-filter                    marks the scope element
//   data-filter-items="<sel>"      items to filter, default ":scope > *"
//   data-filter-groups="<sel>"     containers hidden when none of their items match
//   data-filter-chips="tags|groups"  chips come from item tags (default) or group headings
//   data-filter-min="2"            only make chips for tags used by at least N items
//   data-filter-sort="year"        adds a sort menu that reads data-year on each item
//   data-filter-anchor="<sel>"     insert the toolbar before this element (default: the scope)
//   data-filter-noun="projects"    word used in the "Showing x of y" status line
// Items may carry data-tags="a, b, c"; otherwise their .tag children are used.
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function make(tag, className, attrs) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (attrs) Object.keys(attrs).forEach(k => node.setAttribute(k, attrs[k]));
        return node;
    }

    // ---------- Scroll progress bar + back-to-top ----------
    function setupScrollChrome() {
        const bar = make('div', '', { id: 'scroll-progress', 'aria-hidden': 'true' });
        const top = make('button', '', { id: 'back-to-top', type: 'button', 'aria-label': 'Back to top' });
        top.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
        document.body.append(bar, top);

        top.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });

        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
            top.classList.toggle('is-shown', window.scrollY > 600);
        };

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                update();
                ticking = false;
            });
        }, { passive: true });
        window.addEventListener('resize', update, { passive: true });
        update();
    }

    // ---------- Scroll reveal ----------
    function setupReveal() {
        if (reduceMotion || !('IntersectionObserver' in window)) return;

        const selector = [
            'main .card-link',
            'main .card',
            'main .timeline-item',
            'main section > h2',
            'main section > .text-center'
        ].join(',');

        // Animate the outermost match only, so a .card inside a .card-link
        // (or a heading inside a centred wrapper) isn't animated twice.
        const found = new Set(document.querySelectorAll(selector));
        const targets = Array.from(found).filter(node => {
            for (let p = node.parentElement; p; p = p.parentElement) {
                if (found.has(p)) return false;
            }
            return true;
        });
        if (!targets.length) return;

        const siblingCount = new Map();
        targets.forEach(node => {
            const n = siblingCount.get(node.parentElement) || 0;
            siblingCount.set(node.parentElement, n + 1);
            node.dataset.revealIndex = String(n);
            node.classList.add('js-reveal');
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const node = entry.target;
                observer.unobserve(node);
                node.style.transitionDelay = Math.min(Number(node.dataset.revealIndex), 4) * 80 + 'ms';
                node.classList.add('is-visible');
                // Drop the helper classes once the animation is done so they can't
                // fight the hover transform on .card.
                window.setTimeout(() => {
                    node.classList.remove('js-reveal', 'is-visible');
                    node.style.transitionDelay = '';
                }, 1100);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(node => observer.observe(node));
    }

    // ---------- Search / tag / sort filter ----------
    function initFilter(scope) {
        const items = Array.from(scope.querySelectorAll(scope.dataset.filterItems || ':scope > *'));
        if (items.length < 2) return;

        const groupSelector = scope.dataset.filterGroups || '';
        const groups = groupSelector ? Array.from(scope.querySelectorAll(groupSelector)) : [];
        const chipMode = scope.dataset.filterChips || 'tags';
        const minCount = Number(scope.dataset.filterMin) || 1;
        const noun = scope.dataset.filterNoun || 'items';

        const tagsOf = (item) => {
            if (chipMode === 'groups') {
                const group = groupSelector ? item.closest(groupSelector) : null;
                const heading = group && group.querySelector('h2, h3');
                return heading ? [heading.textContent.trim()] : [];
            }
            if (item.dataset.tags) {
                return item.dataset.tags.split(',').map(s => s.trim()).filter(Boolean);
            }
            return Array.from(item.querySelectorAll('.tag')).map(t => t.textContent.trim());
        };

        // Index every item once: searchable text and tag keys.
        const chipLabels = new Map(); // key -> display label
        const chipCounts = new Map();
        items.forEach(item => {
            const tags = tagsOf(item);
            item._tagKeys = tags.map(t => t.toLowerCase());
            item._text = (item.textContent + ' ' + tags.join(' ')).toLowerCase().replace(/\s+/g, ' ');
            new Set(item._tagKeys).forEach(key => chipCounts.set(key, (chipCounts.get(key) || 0) + 1));
            tags.forEach(t => { if (!chipLabels.has(t.toLowerCase())) chipLabels.set(t.toLowerCase(), t); });
        });

        const chipKeys = Array.from(chipCounts.keys())
            .filter(key => chipCounts.get(key) >= minCount)
            .sort((a, b) => chipCounts.get(b) - chipCounts.get(a) || a.localeCompare(b))
            .slice(0, 14);

        // Toolbar
        const bar = make('div', 'filter-bar', { role: 'search' });
        const row = make('div', 'filter-row');

        const searchWrap = make('div', 'filter-search');
        searchWrap.innerHTML = '<i class="fas fa-search" aria-hidden="true"></i>';
        const input = make('input', 'filter-input', {
            type: 'search',
            placeholder: 'Search ' + noun + '…',
            'aria-label': 'Search ' + noun,
            autocomplete: 'off'
        });
        searchWrap.appendChild(input);
        row.appendChild(searchWrap);

        let sortSelect = null;
        if (scope.dataset.filterSort === 'year') {
            const wrap = make('label', 'filter-sort');
            wrap.innerHTML = '<span class="sr-only" style="position:absolute;left:-9999px">Sort order</span>';
            sortSelect = make('select', '', { 'aria-label': 'Sort order' });
            sortSelect.innerHTML = '<option value="default">Default order</option>' +
                '<option value="newest">Newest first</option>' +
                '<option value="oldest">Oldest first</option>';
            wrap.appendChild(sortSelect);
            row.appendChild(wrap);
        }
        bar.appendChild(row);

        let activeKey = '';
        const chipButtons = [];
        if (chipKeys.length > 1) {
            const chips = make('div', 'filter-chips', { role: 'group', 'aria-label': 'Filter by ' + (chipMode === 'groups' ? 'section' : 'tag') });
            const addChip = (label, key) => {
                const chip = make('button', 'filter-chip', { type: 'button', 'aria-pressed': String(key === '') });
                chip.textContent = label;
                chip.dataset.key = key;
                chip.addEventListener('click', () => {
                    // Clicking the active chip again goes back to "All".
                    activeKey = (key === activeKey) ? '' : key;
                    chipButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.key === activeKey)));
                    apply();
                });
                chipButtons.push(chip);
                chips.appendChild(chip);
            };
            addChip('All', '');
            chipKeys.forEach(key => addChip(chipLabels.get(key), key));
            bar.appendChild(chips);
        }

        const status = make('div', 'filter-status', { 'aria-live': 'polite' });
        bar.appendChild(status);

        const anchor = (scope.dataset.filterAnchor && document.querySelector(scope.dataset.filterAnchor)) || scope;
        anchor.parentNode.insertBefore(bar, anchor);

        // Sorting only reorders items inside their shared parent, keeping any
        // non-item siblings (e.g. a trailing info card) where they were.
        const parent = items[0].parentElement;
        const sortable = sortSelect && items.every(i => i.parentElement === parent);
        const tail = sortable ? items[items.length - 1].nextSibling : null;
        const original = items.slice();

        function sort(mode) {
            if (!sortable) return;
            const ordered = mode === 'default'
                ? original
                : original.slice().sort((a, b) => {
                    const diff = (Number(a.dataset.year) || 0) - (Number(b.dataset.year) || 0);
                    return mode === 'newest' ? -diff : diff;
                });
            ordered.forEach(item => parent.insertBefore(item, tail));
        }

        function apply() {
            const terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
            let shown = 0;
            items.forEach(item => {
                const show = terms.every(t => item._text.includes(t)) &&
                    (!activeKey || item._tagKeys.includes(activeKey));
                item.hidden = !show;
                item.classList.toggle('is-filtered-out', !show);
                if (show) shown++;
            });
            groups.forEach(group => {
                const any = items.some(item => group.contains(item) && !item.hidden);
                group.hidden = !any;
                group.classList.toggle('is-filtered-out', !any);
            });
            status.textContent = shown === items.length
                ? items.length + ' ' + noun
                : shown === 0
                    ? 'No ' + noun + ' match. Try a different search or clear the filter.'
                    : 'Showing ' + shown + ' of ' + items.length + ' ' + noun;
        }

        input.addEventListener('input', apply);
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && input.value) {
                input.value = '';
                apply();
            }
        });
        if (sortSelect) sortSelect.addEventListener('change', () => sort(sortSelect.value));
        apply();
    }

    function setupFilters() {
        document.querySelectorAll('[data-filter]').forEach(initFilter);
    }

    // ---------- Lightbox ----------
    function setupLightbox() {
        const links = Array.from(document.querySelectorAll('a[data-lightbox]'));
        if (!links.length) return;

        let overlay = null, img, caption, prevBtn, nextBtn, closeBtn;
        let list = [], index = 0, opener = null;

        function build() {
            overlay = make('div', 'lightbox', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Image viewer' });
            img = make('img');
            caption = make('div', 'lightbox-caption');
            closeBtn = make('button', 'lightbox-close', { type: 'button', 'aria-label': 'Close image' });
            closeBtn.innerHTML = '<i class="fas fa-xmark" aria-hidden="true"></i>';
            prevBtn = make('button', 'lightbox-prev', { type: 'button', 'aria-label': 'Previous image' });
            prevBtn.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i>';
            nextBtn = make('button', 'lightbox-next', { type: 'button', 'aria-label': 'Next image' });
            nextBtn.innerHTML = '<i class="fas fa-chevron-right" aria-hidden="true"></i>';
            overlay.append(closeBtn, prevBtn, img, caption, nextBtn);

            closeBtn.addEventListener('click', close);
            prevBtn.addEventListener('click', () => show(index - 1));
            nextBtn.addEventListener('click', () => show(index + 1));
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) close();
            });
        }

        function show(i) {
            index = (i + list.length) % list.length;
            const link = list[index];
            const thumb = link.querySelector('img');
            img.src = link.href;
            img.alt = (thumb && thumb.alt) || link.dataset.title || '';
            caption.textContent = link.dataset.title || '';
            const many = list.length > 1;
            prevBtn.hidden = nextBtn.hidden = !many;
        }

        function onKey(event) {
            if (event.key === 'Escape') {
                close();
            } else if (event.key === 'ArrowLeft' && list.length > 1) {
                show(index - 1);
            } else if (event.key === 'ArrowRight' && list.length > 1) {
                show(index + 1);
            } else if (event.key === 'Tab') {
                // Keep focus inside the dialog while it is open.
                const focusable = [closeBtn, prevBtn, nextBtn].filter(b => !b.hidden);
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }

        function open(group, i, trigger) {
            if (!overlay) build();
            list = group;
            opener = trigger;
            show(i);
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', onKey);
            window.requestAnimationFrame(() => overlay.classList.add('is-open'));
            closeBtn.focus();
        }

        function close() {
            if (!overlay || !overlay.isConnected) return;
            overlay.classList.remove('is-open');
            overlay.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', onKey);
            if (opener) opener.focus();
        }

        links.forEach(link => {
            link.addEventListener('click', (event) => {
                // Let ctrl/cmd/shift/middle-click open the image normally.
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
                event.preventDefault();
                const group = links.filter(l => l.dataset.lightbox === link.dataset.lightbox);
                open(group, group.indexOf(link), link);
            });
        });
    }

    setupScrollChrome();
    setupFilters();
    setupReveal();
    setupLightbox();
})();
