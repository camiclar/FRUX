/**
 * Side Navigation for 10-K Document
 * Creates a dynamic side navigation from H2 (Parts), H3 (Items), and H4 (Sections)
 * with scroll-based active state updates and expandable sections
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

    // Build the navigation structure
    function buildNavigation() {
        const navList = document.getElementById('side-nav-list');
        if (!navList) return;

        navList.innerHTML = '';

        const main = document.querySelector('main');
        if (!main) return;

        const headings = main.querySelectorAll('h2.part-heading, h3.item-heading, h3.signatures-heading, h4.section-heading, h5');
        const navStructure = [];
        let currentH2 = null;
        let currentH3 = null;
        let currentH4 = null;

        headings.forEach((heading) => {
            if (heading.tagName === 'H2' && heading.classList.contains('sr-only')) return;

            const id = ensureHeadingId(heading);
            const text = heading.textContent.trim();

            if (heading.tagName === 'H2' && heading.classList.contains('part-heading')) {
                currentH2 = {
                    element: heading,
                    id,
                    text,
                    children: []
                };
                currentH3 = null;
                currentH4 = null;
                navStructure.push(currentH2);
            } else if (heading.tagName === 'H3' && (heading.classList.contains('item-heading') || heading.classList.contains('signatures-heading')) && currentH2) {
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

        // Special top-level entries for Title Page and Table of Contents (Version 2)
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
        // Prefer headings within the active pagination page (Version 2)
        let container = document.querySelector('.pagination-page.active-page');
        if (!container) {
            // Fallback: use main if no active page marker is present
            container = document.querySelector('main');
        }
        if (!container) return null;

        const pageId = container.getAttribute('data-page-id');
        if (pageId === 'title_page' || pageId === 'table_of_contents') {
            return pageId;
        }

        const headings = container.querySelectorAll('h2.part-heading[id], h3.item-heading[id], h3.signatures-heading[id], h4.section-heading[id], h5[id]');
        let currentSection = null;
        const scrollPosition = window.scrollY + 100;

        // Override at page bottom: force the final H4 to be active for clearer navigation context.
        const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 2);
        if (atBottom) {
            const h4s = container.querySelectorAll('h4.section-heading[id]');
            if (h4s.length) {
                return h4s[h4s.length - 1].id;
            }
        }

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

    function updateActiveState() {
        const currentSection = getCurrentSection();
        if (!currentSection) return;

        document.querySelectorAll('.side-nav-link').forEach(link => link.classList.remove('active'));

        const activeLink = document.querySelector(`.side-nav-link[href="#${currentSection}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            expandParents(activeLink);
        }

        collapseInactiveSections(currentSection);
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

    // Wrap each H4 section and its following content into a card for scannability.
    function applyScannableGrouping() {
        const pages = document.querySelectorAll('.pagination-page');
        pages.forEach(page => {
            let carryFromPreviousFragment = false;
            let openCard = null;
            const fragments = page.querySelectorAll(':scope .fragment');

            fragments.forEach(fragment => {
                const firstTopHeading = fragment.querySelector(':scope > h2.part-heading, :scope > h3.item-heading, :scope > h3.signatures-heading, :scope > h4.section-heading, :scope > h5');

                if (fragment.getAttribute('data-h4-grouped') === 'true') {
                    // keep carry signal in sync when rerun
                    if (firstTopHeading && (firstTopHeading.tagName === 'H2' || firstTopHeading.tagName === 'H3' || firstTopHeading.tagName === 'H4')) {
                        carryFromPreviousFragment = false;
                        openCard = null;
                    } else {
                        carryFromPreviousFragment = carryFromPreviousFragment || !!openCard;
                    }
                    return;
                }
                fragment.setAttribute('data-h4-grouped', 'true');

                if (firstTopHeading && (firstTopHeading.tagName === 'H2' || firstTopHeading.tagName === 'H3')) {
                    carryFromPreviousFragment = false;
                    openCard = null;
                }

                // If this fragment continues a prior H4 card, move leading content into the open card
                // until we reach the next section boundary (H2/H3/H4).
                if (carryFromPreviousFragment && openCard && (!firstTopHeading || firstTopHeading.tagName === 'H5')) {
                    while (fragment.firstElementChild &&
                        !fragment.firstElementChild.matches('h2.part-heading, h3.item-heading, h3.signatures-heading, h4.section-heading')) {
                        openCard.appendChild(fragment.firstElementChild);
                    }
                }

                const h4s = fragment.querySelectorAll(':scope > h4.section-heading');
                if (h4s.length > 0) {
                    h4s.forEach(h4 => {
                        if (h4.parentElement && h4.parentElement.classList.contains('h4-content-card')) return;

                        const card = document.createElement('section');
                        card.className = 'h4-content-card';
                        h4.parentNode.insertBefore(card, h4);

                        let node = h4;
                        while (node) {
                            const next = node.nextElementSibling;
                            if (node !== h4 && node.matches('h2.part-heading, h3.item-heading, h4.section-heading')) {
                                break;
                            }
                            card.appendChild(node);
                            node = next;
                        }
                        openCard = card;
                    });
                    carryFromPreviousFragment = true;
                } else if (carryFromPreviousFragment && openCard && fragment.childElementCount === 0) {
                    fragment.remove();
                } else {
                    openCard = null;
                }
            });
        });
    }

    function init() {
        const navList = document.getElementById('side-nav-list');
        if (!navList) return;

        applyScannableGrouping();
        buildNavigation();

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

// Version 3B add-ons: Version 3A extras + Quick Access block
(function() {
    'use strict';

    function labelForPart(text) {
        const norm = (text || '').replace(/\s+/g, ' ').trim().toUpperCase();
        if (norm.startsWith('PART IV')) return 'PART IV: Legal Exhibits';
        if (norm.startsWith('PART III')) return 'PART III: Governance & Compensation';
        if (norm.startsWith('PART II')) return 'PART II: Financial Performance';
        if (norm.startsWith('PART I')) return 'PART I: Business & Risks';
        return text;
    }

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
            const href = links[idx] || null;
            const el = document.createElement(href ? 'a' : 'span');
            el.className = 'breadcrumb-segment';
            if (href) el.href = href;
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

    function updateBreadcrumbs() {
        const crumbsContainer = document.getElementById('breadcrumbs');
        if (!crumbsContainer) return;

        const activePage = document.querySelector('.pagination-page.active-page');
        if (!activePage) return;

        const pageId = activePage.getAttribute('data-page-id') || '';
        if (pageId === 'title_page') {
            renderCrumbs(crumbsContainer, ['10-K', 'Title Page'], ['#title_page', '#title_page']);
            return;
        }
        if (pageId === 'table_of_contents') {
            renderCrumbs(crumbsContainer, ['10-K', 'Table of Contents'], ['#title_page', '#table_of_contents']);
            return;
        }

        const crumbs = ['10-K'];
        const links = ['#title_page'];
        const activeLink = document.querySelector('.side-nav-link.active');
        let currentSectionId = null;
        if (activeLink) {
            const href = activeLink.getAttribute('href') || '';
            if (href.startsWith('#')) currentSectionId = href.slice(1);
        }

        let itemHeading = null;
        const itemCandidates = activePage.querySelectorAll('h3.item-heading, h3.signatures-heading');
        if (currentSectionId) {
            const sectionEl = document.getElementById(currentSectionId);
            if (sectionEl && activePage.contains(sectionEl)) {
                for (let i = 0; i < itemCandidates.length; i++) {
                    const h = itemCandidates[i];
                    if (h === sectionEl || (h.compareDocumentPosition(sectionEl) & Node.DOCUMENT_POSITION_FOLLOWING)) {
                        itemHeading = h;
                    }
                }
            }
        }
        if (!itemHeading) {
            itemHeading = itemCandidates.length ? itemCandidates[0] : null;
        }

        let partHeading = activePage.querySelector('h2.part-heading');

        if (!partHeading && itemHeading) {
            const itemKey = parseItemKeyFromHeading(itemHeading);
            const partRoman = itemKey ? partRomanForItemKey(itemKey) : null;
            if (partRoman) partHeading = findPartHeadingElement(partRoman);
        }
        if (partHeading && partHeading.id) {
            crumbs.push(labelForPart(partHeading.textContent.trim()));
            links.push('#' + partHeading.id);
        }

        if (itemHeading) {
            const numSpan = itemHeading.querySelector('.item-number');
            const titleSpan = itemHeading.querySelector('.item-title');
            let itemLabel;
            if (itemHeading.classList.contains('signatures-heading')) {
                itemLabel = itemHeading.textContent.replace(/\s+/g, ' ').trim();
            } else if (numSpan && titleSpan) {
                const numText = numSpan.textContent.replace(/\s+/g, ' ').trim().replace(/^ITEM\s+/i, 'Item ');
                itemLabel = numText + ' ' + titleSpan.textContent.trim();
            } else {
                itemLabel = itemHeading.textContent.replace(/\s+/g, ' ').trim().replace(/^ITEM\s+/i, 'Item ');
            }
            crumbs.push(itemLabel);
            links.push('#' + itemHeading.id);
        }
        if (currentSectionId) {
            const sectionEl = document.getElementById(currentSectionId);
            if (sectionEl && activePage.contains(sectionEl) && sectionEl.matches('h4.section-heading, h5, h6.section-heading')) {
                crumbs.push(sectionEl.textContent.trim());
                links.push('#' + sectionEl.id);
            }
        }

        renderCrumbs(crumbsContainer, crumbs, links);
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
            if (m[1] === want) return heads[i].id || null;
        }
        return null;
    }

    function ensureQuickAccessBlock() {
        const sideNav = document.getElementById('side-nav');
        const navList = document.getElementById('side-nav-list');
        if (!sideNav || !navList) return;
        if (document.getElementById('quick-access')) return;

        const qa = document.createElement('div');
        qa.className = 'quick-access';
        qa.id = 'quick-access';
        qa.innerHTML =
            '<button type="button" class="quick-access-header" id="quick-access-toggle" aria-expanded="true" aria-controls="quick-access-list">' +
            '<span class="quick-access-title">Quick Access</span>' +
            '<span class="quick-access-chevron" aria-hidden="true">▼</span>' +
            '</button>' +
            '<ul id="quick-access-list" class="quick-access-list"></ul>';
        const divider = document.createElement('hr');
        divider.className = 'quick-access-divider';
        sideNav.insertBefore(qa, navList);
        sideNav.insertBefore(divider, navList);
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

    function updatePartLabelsInNav() {
        document.querySelectorAll('#side-nav-list .side-nav-item.h2-item > .side-nav-link > span').forEach(function(span) {
            const text = span.textContent.trim();
            if (/^PART\s+[IVX]+/i.test(text)) span.textContent = labelForPart(text);
        });
    }

    function initV3BAddons() {
        ensureQuickAccessBlock();
        buildQuickAccess();
        updatePartLabelsInNav();
        updateBreadcrumbs();

        const qaToggle = document.getElementById('quick-access-toggle');
        const qaBlock = document.getElementById('quick-access');
        if (qaToggle && qaBlock && !qaToggle.getAttribute('data-bound')) {
            qaToggle.setAttribute('data-bound', 'true');
            qaToggle.addEventListener('click', function() {
                const collapsed = qaBlock.classList.toggle('quick-access-collapsed');
                qaToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            });
        }

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
            }
        }, true);

        document.addEventListener('click', function() {
            setTimeout(function() {
                updatePartLabelsInNav();
                buildQuickAccess();
                updateBreadcrumbs();
            }, 0);
        }, true);

        let breadcrumbScrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(breadcrumbScrollTimeout);
            // Keep breadcrumbs in sync with the nav's debounced active-state update.
            breadcrumbScrollTimeout = setTimeout(function() {
                updatePartLabelsInNav();
                updateBreadcrumbs();
            }, 70);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initV3BAddons);
    } else {
        initV3BAddons();
    }
})();
