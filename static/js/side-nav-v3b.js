/**
 * Side Navigation for 10-K Document - Version 3B
 * Same as Version 3A, plus a Quick Access block above the main nav links.
 */

(function() {
    'use strict';

    // Generate a URL-friendly ID from text - always use for headings to avoid ID collisions
    function generateId(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Ensure heading has unique ID. Use containing fragment/page as prefix so duplicate
    // heading text (e.g. "THE ITW BUSINESS MODEL" in Item 1 and Item 7) get different IDs.
    function ensureHeadingId(heading) {
        if (heading.id) return heading.id;
        const slug = generateId(heading.textContent.trim());
        const container = heading.closest('.fragment') || heading.closest('.pagination-page');
        const prefix = container ? (container.id || container.getAttribute('data-page-id') || container.getAttribute('data-fragment-id') || '') : '';
        heading.id = prefix ? (prefix + '-' + slug) : slug;
        return heading.id;
    }

    // Map Part headings to custom labels for Version 3A side nav
    function getPartNavLabel(rawText) {
        const norm = rawText.replace(/\s+/g, ' ').trim().toUpperCase();
        // Check longer roman numerals first: "PART II/III/IV" all start with the substring "PART I"
        if (norm.startsWith('PART IV')) {
            return 'PART IV: Legal Exhibits';
        }
        if (norm.startsWith('PART III')) {
            return 'PART III: Governance & Compensation';
        }
        if (norm.startsWith('PART II')) {
            return 'PART II: Financial Performance';
        }
        if (norm.startsWith('PART I')) {
            return 'PART I: Business & Risks';
        }
        return rawText.trim();
    }

    /** Item keys (digits + optional A/B/C) → Roman part for SEC 10-K layout */
    function partRomanForItemKey(key) {
        const k = String(key).toUpperCase().replace(/\.$/, '');
        if (['1', '1A', '1B', '1C', '2', '3', '4'].indexOf(k) !== -1) return 'PART I';
        if (['5', '6', '7', '7A', '8', '9'].indexOf(k) !== -1) return 'PART II';
        if (['10', '11', '12', '13', '14'].indexOf(k) !== -1) return 'PART III';
        if (['15', '16'].indexOf(k) !== -1) return 'PART IV';
        return null;
    }

    function findPartHeadingElement(partRoman) {
        const want = partRoman.replace(/\s+/g, ' ').trim().toUpperCase();
        const all = document.querySelectorAll('h2.part-heading');
        for (let i = 0; i < all.length; i++) {
            const t = all[i].textContent.replace(/\s+/g, ' ').trim().toUpperCase();
            if (want === 'PART IV' && t.startsWith('PART IV')) return all[i];
            if (want === 'PART III' && t.startsWith('PART III')) return all[i];
            if (want === 'PART II' && t.startsWith('PART II')) return all[i];
            if (want === 'PART I' && t.startsWith('PART I') && !t.startsWith('PART II')) return all[i];
        }
        return null;
    }

    function parseItemKeyFromHeading(itemHeading) {
        if (!itemHeading) return null;
        const numSpan = itemHeading.querySelector('.item-number');
        const raw = (numSpan ? numSpan.textContent : itemHeading.textContent) || '';
        const m = raw.match(/ITEM\s*([\d]+[ABCD]?)\.?/i);
        return m ? m[1].toUpperCase() : null;
    }

    function renderCrumbs(crumbsContainer, crumbs, links) {
        crumbsContainer.innerHTML = '';
        crumbs.forEach(function(label, idx) {
            const linkHref = links[idx] || null;
            const el = document.createElement(linkHref ? 'a' : 'span');
            el.className = 'breadcrumb-segment';
            if (linkHref) el.href = linkHref;
            el.textContent = label;
            crumbsContainer.appendChild(el);
            if (idx < crumbs.length - 1) {
                const sep = document.createElement('span');
                sep.className = 'breadcrumb-separator';
                sep.textContent = ' / ';
                crumbsContainer.appendChild(sep);
            }
        });
    }

    function findFirstItemHeadingId(wantKey) {
        const want = String(wantKey).toUpperCase();
        const heads = document.querySelectorAll('main h3.item-heading');
        for (let i = 0; i < heads.length; i++) {
            const num = heads[i].querySelector('.item-number');
            if (!num) continue;
            const raw = num.textContent.replace(/\s+/g, ' ').trim().toUpperCase();
            const m = raw.match(/^ITEM\s*([\d]+[ABCD]?)\.?/);
            if (!m) continue;
            if (m[1] === want) {
                ensureHeadingId(heads[i]);
                return heads[i].id;
            }
        }
        return null;
    }

    function buildQuickAccess() {
        const list = document.getElementById('quick-access-list');
        if (!list) return;
        list.innerHTML = '';
        const entries = [
            { key: '1', label: 'ITEM 1. Business' },
            { key: '1A', label: 'ITEM 1A. Risk Factors' },
            { key: '7', label: 'ITEM 7. MD&A' },
            { key: '8', label: 'ITEM 8. Financial Statements' }
        ];
        entries.forEach(function(entry) {
            const id = findFirstItemHeadingId(entry.key);
            if (!id) return;
            const li = document.createElement('li');
            li.className = 'quick-access-item';
            const a = document.createElement('a');
            a.className = 'quick-access-link';
            a.href = '#' + id;
            a.textContent = entry.label;
            li.appendChild(a);
            list.appendChild(li);
        });
    }

    // Build the navigation structure
    function buildNavigation() {
        const navList = document.getElementById('side-nav-list');
        if (!navList) return;

        navList.innerHTML = '';

        const main = document.querySelector('main');
        if (!main) return;

        const headings = main.querySelectorAll('h2.part-heading, h3.item-heading, h4.section-heading, h5');
        const navStructure = [];
        let currentH2 = null;
        let currentH3 = null;
        let currentH4 = null;

        headings.forEach((heading) => {
            if (heading.tagName === 'H2' && heading.classList.contains('sr-only')) return;

            const id = ensureHeadingId(heading);
            let text = heading.textContent.trim();

            if (heading.tagName === 'H2' && heading.classList.contains('part-heading')) {
                text = getPartNavLabel(text);
                currentH2 = {
                    element: heading,
                    id,
                    text,
                    children: []
                };
                currentH3 = null;
                currentH4 = null;
                navStructure.push(currentH2);
            } else if (heading.tagName === 'H3' && heading.classList.contains('item-heading') && currentH2) {
                currentH3 = {
                    element: heading,
                    id,
                    text,
                    children: []
                };
                currentH4 = null;
                currentH2.children.push(currentH3);
            } else if (heading.tagName === 'H4' && heading.classList.contains('section-heading') && currentH3) {
                currentH4 = {
                    element: heading,
                    id,
                    text,
                    children: []
                };
                currentH3.children.push(currentH4);
            } else if (heading.tagName === 'H5' && currentH4) {
                currentH4.children.push({
                    element: heading,
                    id,
                    text
                });
            }
        });

        // Recursively build nav HTML
        function buildNavItem(item, level) {
            const li = document.createElement('li');
            li.className = `side-nav-item ${level}-item`;

            const link = document.createElement('a');
            link.href = `#${item.id}`;
            link.className = 'side-nav-link';
            const textSpan = document.createElement('span');
            textSpan.textContent = item.text;
            link.appendChild(textSpan);

            const hasChildren = item.children && item.children.length > 0;
            if (hasChildren) {
                const chevron = document.createElement('span');
                chevron.className = 'side-nav-chevron';
                chevron.textContent = '▼';
                chevron.setAttribute('aria-hidden', 'true');
                link.appendChild(chevron);

                const submenu = document.createElement('ul');
                submenu.className = 'side-nav-submenu';
                item.children.forEach(child => {
                    const childLevel = level === 'h2' ? 'h3' : (level === 'h3' ? 'h4' : 'h5');
                    submenu.appendChild(buildNavItem(child, childLevel));
                });
                li.appendChild(link);
                li.appendChild(submenu);
            } else {
                li.appendChild(link);
            }
            return li;
        }

        // Special top-level entries for Title Page and Table of Contents (Version 3A)
        const specials = [];
        if (document.querySelector('.pagination-page[data-page-id="title_page"]')) {
            specials.push({ id: 'title_page', text: 'Title Page', children: [] });
        }
        if (document.querySelector('.pagination-page[data-page-id="table_of_contents"]')) {
            specials.push({ id: 'table_of_contents', text: 'Table of Contents', children: [] });
        }

        specials.forEach(item => {
            navList.appendChild(buildNavItem(item, 'h2'));
        });

        navStructure.forEach(h2Item => {
            navList.appendChild(buildNavItem(h2Item, 'h2'));
        });
    }

    function getCurrentSection() {
        // Prefer headings within the active pagination page
        let container = document.querySelector('.pagination-page.active-page');
        if (!container) {
            // Fallback: use main if no active page marker is present
            container = document.querySelector('main');
        }
        if (!container) return null;

        const headings = container.querySelectorAll('h2.part-heading[id], h3.item-heading[id], h4.section-heading[id], h5[id]');
        let currentSection = null;
        const scrollPosition = window.scrollY + 100;

        for (let i = headings.length - 1; i >= 0; i--) {
            const heading = headings[i];
            const top = heading.getBoundingClientRect().top + window.scrollY;
            if (top <= scrollPosition) {
                currentSection = heading.id;
                break;
            }
        }
        return currentSection;
    }

    function expandParents(link) {
        const h5Item = link.closest('.h5-item');
        const h4Item = link.closest('.h4-item');
        const h3Item = link.closest('.h3-item');
        const h2Item = link.closest('.h2-item');
        if (h5Item && h4Item) {
            h4Item.classList.add('expanded');
        }
        if ((h4Item || h5Item) && h3Item) {
            h3Item.classList.add('expanded');
        }
        if ((h3Item || h4Item || h5Item) && h2Item) {
            h2Item.classList.add('expanded');
        }
    }

    function updateBreadcrumbs() {
        const crumbsContainer = document.getElementById('breadcrumbs');
        if (!crumbsContainer) return;

        const activePage = document.querySelector('.pagination-page.active-page');
        if (!activePage) return;

        const pageId = activePage.getAttribute('data-page-id') || '';

        if (pageId === 'title_page') {
            renderCrumbs(crumbsContainer,
                ['10-K', 'Title Page'],
                ['#title_page', '#title_page']);
            return;
        }
        if (pageId === 'table_of_contents') {
            renderCrumbs(crumbsContainer,
                ['10-K', 'Table of Contents'],
                ['#title_page', '#table_of_contents']);
            return;
        }

        const activeLink = document.querySelector('.side-nav-link.active');
        let currentSectionId = null;
        if (activeLink) {
            const href = activeLink.getAttribute('href') || '';
            if (href.startsWith('#')) {
                currentSectionId = href.slice(1);
            }
        }

        const crumbs = [];
        const links = [];

        crumbs.push('10-K');
        links.push('#title_page');

        const itemHeading = activePage.querySelector('h3.item-heading');
        let partHeading = activePage.querySelector('h2.part-heading');
        if (!partHeading && itemHeading) {
            const itemKey = parseItemKeyFromHeading(itemHeading);
            const partRoman = itemKey ? partRomanForItemKey(itemKey) : null;
            if (partRoman) partHeading = findPartHeadingElement(partRoman);
        }
        if (partHeading && partHeading.id) {
            crumbs.push(partHeading.textContent.trim());
            links.push('#' + partHeading.id);
        }

        if (itemHeading) {
            const numSpan = itemHeading.querySelector('.item-number');
            let itemLabel = numSpan ? numSpan.textContent.trim() : itemHeading.textContent.trim();
            itemLabel = itemLabel.replace(/^ITEM\s+/i, 'Item ').replace(/\.$/, '');
            crumbs.push(itemLabel);
            links.push('#' + itemHeading.id);
        }

        if (currentSectionId) {
            const sectionEl = document.getElementById(currentSectionId);
            if (sectionEl && activePage.contains(sectionEl) &&
                sectionEl.matches('h4.section-heading, h5, h6.section-heading')) {
                crumbs.push(sectionEl.textContent.trim());
                links.push('#' + sectionEl.id);
            }
        }

        renderCrumbs(crumbsContainer, crumbs, links);
    }

    function updateActiveState() {
        const currentSection = getCurrentSection();

        document.querySelectorAll('.side-nav-link').forEach(function(link) {
            link.classList.remove('active');
        });

        if (currentSection) {
            const activeLink = document.querySelector('.side-nav-link[href="#' + currentSection + '"]');
            if (activeLink) {
                activeLink.classList.add('active');
                expandParents(activeLink);
            }
            collapseInactiveSections(currentSection);
        } else {
            const page = document.querySelector('.pagination-page.active-page');
            const pid = page && page.getAttribute('data-page-id');
            if (pid === 'title_page') {
                const l = document.querySelector('.side-nav-link[href="#title_page"]');
                if (l) l.classList.add('active');
            } else if (pid === 'table_of_contents') {
                const l = document.querySelector('.side-nav-link[href="#table_of_contents"]');
                if (l) l.classList.add('active');
            }
        }

        updateBreadcrumbs();
    }

    function expandSection(item) {
        item.classList.add('expanded');
    }

    function collapseInactiveSections(currentSection) {
        const expandedItems = document.querySelectorAll('.side-nav-item.h2-item.expanded, .side-nav-item.h3-item.expanded, .side-nav-item.h4-item.expanded');

        expandedItems.forEach(item => {
            if (item.getAttribute('data-manual-toggle') === 'true') return;
            const submenu = item.querySelector(':scope > .side-nav-submenu');
            if (!submenu) return;
            const hasActive = submenu.querySelector('.side-nav-link.active');
            const selfActive = item.querySelector(':scope > .side-nav-link.active');
            if (!hasActive && !selfActive) {
                item.classList.remove('expanded');
            }
        });
    }

    function scrollToSection(e) {
        e.preventDefault();
        const targetId = e.target.closest('.side-nav-link').getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            const top = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
            setTimeout(updateActiveState, 100);
        }
    }

    function toggleMobileNav() {
        const sideNav = document.getElementById('side-nav');
        if (sideNav) sideNav.classList.toggle('open');
    }

    function handleChevronClick(e) {
        const chevron = e.target.closest('.side-nav-chevron');
        if (!chevron) return;
        e.preventDefault();
        e.stopPropagation();
        const item = chevron.closest('.h2-item, .h3-item, .h4-item');
        if (item) {
            item.classList.toggle('expanded');
            item.setAttribute('data-manual-toggle', 'true');
            setTimeout(() => item.removeAttribute('data-manual-toggle'), 1000);
        }
        return false;
    }

    function init() {
        const navList = document.getElementById('side-nav-list');
        if (!navList) return;

        buildNavigation();
        buildQuickAccess();

        const qaToggle = document.getElementById('quick-access-toggle');
        const qaBlock = document.getElementById('quick-access');
        if (qaToggle && qaBlock) {
            qaToggle.addEventListener('click', function() {
                const collapsed = qaBlock.classList.toggle('quick-access-collapsed');
                qaToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            });
        }

        // Same-page smooth scroll for Quick Access links (pagination script handles cross-page)
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a.quick-access-link');
            if (!link) return;
            const href = link.getAttribute('href');
            if (!href || href.charAt(0) !== '#') return;
            const id = href.slice(1);
            const el = document.getElementById(id);
            if (!el) return;
            const ap = document.querySelector('.pagination-page.active-page');
            if (ap && ap.contains(el)) {
                e.preventDefault();
                e.stopPropagation();
                const top = el.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: top, behavior: 'smooth' });
                setTimeout(updateActiveState, 100);
            }
        }, true);

        // Start with all H2 and H3 collapsed; updateActiveState will expand only the current section's branch
        document.querySelectorAll('.side-nav-item.h2-item, .side-nav-item.h3-item, .side-nav-item.h4-item').forEach(function(item) {
            item.classList.remove('expanded');
        });
        updateActiveState();

        navList.addEventListener('click', function(e) {
            if (e.target.closest('.side-nav-chevron')) {
                handleChevronClick(e);
                return;
            }
            const link = e.target.closest('.side-nav-link');
            if (link && !e.target.closest('.side-nav-chevron')) {
                scrollToSection(e);
                if (window.innerWidth < 1024) {
                    const sideNav = document.getElementById('side-nav');
                    if (sideNav) sideNav.classList.remove('open');
                }
            }
        }, true);

        const toggle = document.getElementById('side-nav-toggle');
        if (toggle) toggle.addEventListener('click', toggleMobileNav);

        document.addEventListener('click', function(e) {
            const sideNav = document.getElementById('side-nav');
            if (!sideNav || window.innerWidth >= 1024) return;
            if (sideNav.classList.contains('open')) {
                const inside = sideNav.contains(e.target);
                const onToggle = toggle && (toggle.contains(e.target) || e.target === toggle);
                if (!inside && !onToggle) sideNav.classList.remove('open');
            }
        });

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateActiveState, 50);
        });

        updateActiveState();

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                const sideNav = document.getElementById('side-nav');
                if (sideNav) sideNav.classList.remove('open');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

