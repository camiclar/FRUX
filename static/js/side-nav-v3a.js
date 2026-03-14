/**
 * Side Navigation for 10-K Document - Version 3A
 * Based on Version 2 side nav, but with:
 * - Custom Part labels in the nav
 * - Breadcrumbs at the top of the page that update with scroll
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
        if (norm.startsWith('PART I')) {
            return 'PART I: Business & Risks';
        }
        if (norm.startsWith('PART II')) {
            return 'PART II: Financial Performance';
        }
        if (norm.startsWith('PART III')) {
            return 'PART III: Governance & Compensation';
        }
        if (norm.startsWith('PART IV')) {
            return 'PART IV: Legal Exhibits';
        }
        return rawText.trim();
    }

    // Build the navigation structure
    function buildNavigation() {
        const navList = document.getElementById('side-nav-list');
        if (!navList) return;

        navList.innerHTML = '';

        const main = document.querySelector('main');
        if (!main) return;

        const headings = main.querySelectorAll('h2.part-heading, h3.item-heading, h4.section-heading');
        const navStructure = [];
        let currentH2 = null;
        let currentH3 = null;

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
                navStructure.push(currentH2);
            } else if (heading.tagName === 'H3' && heading.classList.contains('item-heading') && currentH2) {
                currentH3 = {
                    element: heading,
                    id,
                    text,
                    children: []
                };
                currentH2.children.push(currentH3);
            } else if (heading.tagName === 'H4' && heading.classList.contains('section-heading') && currentH3) {
                currentH3.children.push({
                    element: heading,
                    id: ensureHeadingId(heading),
                    text: heading.textContent.trim()
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
                    const childLevel = level === 'h2' ? 'h3' : 'h4';
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

        const headings = container.querySelectorAll('h2.part-heading[id], h3.item-heading[id], h4.section-heading[id]');
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
        const h4Item = link.closest('.h4-item');
        const h3Item = link.closest('.h3-item');
        const h2Item = link.closest('.h2-item');
        if (h4Item && h3Item) {
            h3Item.classList.add('expanded');
        }
        if ((h3Item || h4Item) && h2Item) {
            h2Item.classList.add('expanded');
        }
    }

    function updateBreadcrumbs() {
        const crumbsContainer = document.getElementById('breadcrumbs');
        if (!crumbsContainer) return;

        const activePage = document.querySelector('.pagination-page.active-page') || document.querySelector('main');
        if (!activePage) return;

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

        // Root crumb: 10-K (link to Title Page)
        crumbs.push('10-K');
        links.push('#title_page');

        // Part
        const partHeading = activePage.querySelector('h2.part-heading');
        if (partHeading) {
            crumbs.push(partHeading.textContent.trim());
            links.push('#' + partHeading.id);
        }

        // Item (use item number if available)
        const itemHeading = activePage.querySelector('h3.item-heading');
        if (itemHeading) {
            const numSpan = itemHeading.querySelector('.item-number');
            let itemLabel = numSpan ? numSpan.textContent.trim() : itemHeading.textContent.trim();
            // Normalize like "ITEM 8." -> "Item 8"
            itemLabel = itemLabel.replace(/^ITEM\s+/i, 'Item ').replace(/\.$/, '');
            crumbs.push(itemLabel);
            links.push('#' + itemHeading.id);
        }

        // Section (only if current section is an h4/h5/etc. within this page)
        if (currentSectionId) {
            const sectionEl = document.getElementById(currentSectionId);
            if (sectionEl && activePage.contains(sectionEl) &&
                sectionEl.matches('h4.section-heading, h5.section-heading, h6.section-heading')) {
                crumbs.push(sectionEl.textContent.trim());
                links.push('#' + sectionEl.id);
            }
        }

        crumbsContainer.innerHTML = '';
        crumbs.forEach((label, idx) => {
            const linkHref = links[idx] || null;
            const el = document.createElement(linkHref ? 'a' : 'span');
            el.className = 'breadcrumb-segment';
            if (linkHref) {
                el.href = linkHref;
            }
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
        updateBreadcrumbs();
    }

    function expandSection(item) {
        item.classList.add('expanded');
    }

    function collapseInactiveSections(currentSection) {
        const expandedItems = document.querySelectorAll('.side-nav-item.h2-item.expanded, .side-nav-item.h3-item.expanded');

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
        const item = chevron.closest('.h2-item, .h3-item');
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

        // Start with all H2 and H3 collapsed; updateActiveState will expand only the current section's branch
        document.querySelectorAll('.side-nav-item.h2-item, .side-nav-item.h3-item').forEach(function(item) {
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

