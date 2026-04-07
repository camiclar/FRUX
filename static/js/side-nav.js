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

        const headings = main.querySelectorAll('h2.part-heading, h3.item-heading, h4.section-heading, h5');
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
                const firstTopHeading = fragment.querySelector(':scope > h2.part-heading, :scope > h3.item-heading, :scope > h4.section-heading, :scope > h5');

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
                        !fragment.firstElementChild.matches('h2.part-heading, h3.item-heading, h4.section-heading')) {
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
