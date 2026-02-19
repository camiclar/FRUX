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

    // Ensure heading has unique ID (never reuse fragment ID to avoid duplicates with section)
    function ensureHeadingId(heading) {
        if (!heading.id) {
            heading.id = generateId(heading.textContent.trim());
        }
        return heading.id;
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
            const text = heading.textContent.trim();

            if (heading.tagName === 'H2' && heading.classList.contains('part-heading')) {
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

        navStructure.forEach(h2Item => {
            navList.appendChild(buildNavItem(h2Item, 'h2'));
        });
    }

    function getCurrentSection() {
        const headings = document.querySelectorAll('main h2.part-heading[id], main h3.item-heading[id], main h4.section-heading[id]');
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
