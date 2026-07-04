// Shared site chrome + behavior for all pages.
// The header and footer are injected from the templates below so they only
// have to be maintained in one place. Pages provide empty placeholders:
//   <header id="site-header" class="..."></header>
//   <footer id="site-footer" class="..."></footer>
(function () {
    'use strict';

    // Pages live either at the site root (index.html, 404.html) or in /pages/.
    const inPagesDir = window.location.pathname.includes('/pages/');
    const P = inPagesDir ? '' : 'pages/';            // prefix for links to subpages
    const R = inPagesDir ? '../' : '';               // prefix for links to root files
    const H = inPagesDir ? '../index.html' : '';     // prefix for home-page section anchors

    const dropdownLink = 'block px-4 py-2 text-sm text-white hover:bg-accent-orange';
    const submenuBox = 'absolute hidden dropdown-menu border border-gray-700 rounded-md shadow-lg py-2 w-48 top-0 left-full z-50';
    const profileLink = 'flex items-center p-2 text-sm text-light-slate hover:bg-slate/20 hover:text-accent-orange rounded-md';

    const headerHTML = `
        <div class="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="${R}index.html" class="text-2xl font-bold text-white font-serif">Prathamesh Deshmukh</a>
            <nav class="hidden md:flex items-center space-x-6">
                <a href="${H}#about" class="nav-link">About</a>
                <a href="${H}#research" class="nav-link">Research</a>
                <div class="relative">
                    <button id="portfolio-button" class="nav-link flex items-center" aria-haspopup="true" aria-expanded="false" aria-controls="portfolio-menu">
                        Portfolio <i class="fas fa-chevron-down text-xs ml-2" aria-hidden="true"></i>
                    </button>
                    <div id="portfolio-menu" class="absolute hidden dropdown-menu border border-gray-700 rounded-md shadow-lg py-2 w-56 top-full right-0 mt-2 z-50">
                        <div class="relative">
                            <a href="#" class="w-full text-left px-4 py-2 text-sm text-white hover:bg-accent-orange flex justify-between items-center">
                                Core Portfolio <i class="fas fa-chevron-right text-xs" aria-hidden="true"></i>
                            </a>
                            <div class="${submenuBox} -mt-2">
                                <a href="${P}research.html" class="${dropdownLink}">Research &amp; Pubs</a>
                                <a href="${P}hardware-development.html" class="${dropdownLink}">Hardware &amp; Inst.</a>
                                <div class="relative">
                                    <a href="${P}computational-works.html" class="w-full text-left px-4 py-2 text-sm text-white hover:bg-accent-orange flex justify-between items-center">
                                        Computational Works <i class="fas fa-chevron-right text-xs" aria-hidden="true"></i>
                                    </a>
                                    <div class="${submenuBox} -mt-9">
                                        <a href="${P}computational-works.html" class="${dropdownLink}">Overview</a>
                                        <a href="${P}project-pica.html" class="${dropdownLink}">Project PICA</a>
                                        <a href="${P}Project_Kusanagi-AI.html" class="${dropdownLink}">Kusanagi-AI</a>
                                        <a href="${P}Project_TupperTransformer.html" class="${dropdownLink}">TupperTransformer</a>
                                    </div>
                                </div>
                                <a href="${P}presentations.html" class="${dropdownLink}">Presentations</a>
                                <a href="${P}cv.html" class="${dropdownLink}">CV</a>
                            </div>
                        </div>
                        <div class="border-t border-gray-600 my-1"></div>
                        <div class="relative">
                            <a href="#" class="w-full text-left px-4 py-2 text-sm text-white hover:bg-accent-orange flex justify-between items-center">
                                Additional Content <i class="fas fa-chevron-right text-xs" aria-hidden="true"></i>
                            </a>
                            <div class="${submenuBox} -mt-2">
                                <a href="${P}blog.html" class="${dropdownLink}">Blog</a>
                                <a href="${P}gallery.html" class="${dropdownLink}">Gallery</a>
                                <a href="${P}resources.html" class="${dropdownLink}">Resources</a>
                                <a href="${P}Sudip_Mukherjee_Materials_Physics_Lab.html" class="${dropdownLink}">Materials Physics Lab</a>
                                <a href="${P}sitemap.html" class="${dropdownLink}">Sitemap</a>
                            </div>
                        </div>
                    </div>
                </div>
                <a href="${H}#skills" class="nav-link">Skills</a>
                <a href="${P}cv.html" class="nav-link">CV</a>
                <a href="${H}#contact" class="nav-link">Contact</a>
                <form action="${P}search.html" method="GET" class="relative ml-4 group">
                    <input type="search" name="q" placeholder="Search..." class="bg-card-bg border border-gray-700 rounded-lg w-32 py-1 px-3 text-sm text-light-slate focus:outline-none focus:border-accent-orange focus:w-64 transition-all duration-300">
                    <button type="submit" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate group-focus-within:text-accent-orange transition-colors" aria-label="Submit search">
                        <i class="fas fa-search" aria-hidden="true"></i>
                    </button>
                </form>
            </nav>
            <button id="mobile-menu-button" class="md:hidden text-white text-2xl" aria-label="Open menu" aria-controls="mobile-menu" aria-expanded="false">
                <i class="fas fa-bars" aria-hidden="true"></i>
            </button>
        </div>
        <div id="mobile-menu" class="hidden md:hidden px-6 pb-4">
            <a href="${R}index.html" class="block py-2 nav-link">Home</a>
            <a href="${H}#about" class="block py-2 nav-link">About</a>
            <div class="my-2">
                <button id="mobile-portfolio-button" class="w-full text-left py-2 px-4 rounded-lg bg-accent-orange/10 border border-accent-orange text-accent-orange font-semibold flex justify-between items-center" aria-haspopup="true" aria-expanded="false" aria-controls="mobile-portfolio-menu">
                    <span>Portfolio</span>
                    <i class="fas fa-chevron-down text-xs" aria-hidden="true"></i>
                </button>
                <div id="mobile-portfolio-menu" class="hidden pl-4 mt-2">
                    <a href="${P}research.html" class="block py-2 nav-link">Research &amp; Pubs</a>
                    <a href="${P}hardware-development.html" class="block py-2 nav-link">Hardware &amp; Inst.</a>
                    <a href="${P}computational-works.html" class="block py-2 nav-link">Computational Works</a>
                    <a href="${P}project-pica.html" class="block py-2 nav-link">Project PICA</a>
                    <a href="${P}Project_Kusanagi-AI.html" class="block py-2 nav-link">Project Kusanagi-AI</a>
                    <a href="${P}Project_TupperTransformer.html" class="block py-2 nav-link">TupperTransformer</a>
                    <a href="${P}presentations.html" class="block py-2 nav-link">Presentations</a>
                    <a href="${P}cv.html" class="block py-2 nav-link">CV</a>
                    <a href="${P}blog.html" class="block py-2 nav-link">Blog</a>
                    <a href="${P}gallery.html" class="block py-2 nav-link">Gallery</a>
                    <a href="${P}resources.html" class="block py-2 nav-link">Resources</a>
                    <a href="${P}Sudip_Mukherjee_Materials_Physics_Lab.html" class="block py-2 nav-link">Materials Physics Lab</a>
                    <a href="${P}sitemap.html" class="block py-2 nav-link">Sitemap</a>
                </div>
            </div>
            <a href="${H}#skills" class="block py-2 nav-link">Skills</a>
            <a href="${H}#contact" class="block py-2 nav-link">Contact</a>
            <a href="${P}search.html" class="block py-2 nav-link"><i class="fas fa-search mr-2" aria-hidden="true"></i>Search</a>
        </div>`;

    const footerHTML = `
        <div class="container mx-auto px-6 text-center text-slate">
            <div class="flex justify-center items-center flex-wrap gap-6 mb-6">
                <a href="${H}#contact" class="social-icon text-2xl" aria-label="Email"><i class="fas fa-envelope" aria-hidden="true"></i></a>
                <a href="https://scholar.google.com/citations?user=DJgzI30AAAAJ&hl=en&oi=ao" target="_blank" rel="noopener noreferrer" class="social-icon text-2xl" aria-label="Google Scholar"><i class="fas fa-graduation-cap" aria-hidden="true"></i></a>
                <a href="https://www.linkedin.com/in/prathamesh-k-deshmukh" target="_blank" rel="noopener noreferrer" class="social-icon text-2xl" aria-label="LinkedIn"><i class="fab fa-linkedin" aria-hidden="true"></i></a>
                <a href="https://github.com/prathameshnium" target="_blank" rel="noopener noreferrer" class="social-icon text-2xl" aria-label="GitHub"><i class="fab fa-github" aria-hidden="true"></i></a>
                <a href="https://x.com/prathameshnium" target="_blank" rel="noopener noreferrer" class="social-icon text-2xl" aria-label="X (formerly Twitter)"><i class="fab fa-x-twitter" aria-hidden="true"></i></a>
                <a href="https://bsky.app/profile/prathameshnium.bsky.social" target="_blank" rel="noopener noreferrer" class="social-icon text-2xl" aria-label="BlueSky"><i class="fab fa-bluesky" aria-hidden="true"></i></a>
                <a href="https://fediscience.org/@prathamesh" target="_blank" rel="noopener noreferrer" class="social-icon text-2xl" aria-label="Mastodon"><i class="fab fa-mastodon" aria-hidden="true"></i></a>
                <div class="relative" id="footer-more-links-container">
                    <button id="footer-more-links-button" class="social-icon text-2xl" aria-label="More social and academic links" aria-haspopup="true" aria-expanded="false" aria-controls="footer-more-links-menu">
                        <i class="fas fa-ellipsis-h" aria-hidden="true"></i>
                    </button>
                    <div id="footer-more-links-menu" class="absolute hidden dropdown-menu border border-gray-700 rounded-md shadow-lg p-2 w-max bottom-full mb-2 left-1/2 -translate-x-1/2 z-50">
                        <a href="https://www.researchgate.net/profile/Prathamesh-Deshmukh-6" target="_blank" rel="noopener noreferrer" class="${profileLink}"><i class="fab fa-researchgate w-6 mr-2" aria-hidden="true"></i> ResearchGate</a>
                        <a href="https://gitlab.com/prathameshnium" target="_blank" rel="noopener noreferrer" class="${profileLink}"><i class="fab fa-gitlab w-6 mr-2" aria-hidden="true"></i> GitLab</a>
                        <a href="https://orcid.org/0009-0008-3278-0837" target="_blank" rel="noopener noreferrer" class="${profileLink}"><i class="fab fa-orcid w-6 mr-2" aria-hidden="true"></i> ORCID</a>
                        <a href="https://www.scopus.com/authid/detail.uri?authorId=59544780300" target="_blank" rel="noopener noreferrer" class="${profileLink}"><i class="fas fa-file-alt w-6 mr-2" aria-hidden="true"></i> Scopus</a>
                        <a href="https://csr.academia.edu/PrathameshDeshmukh" target="_blank" rel="noopener noreferrer" class="${profileLink}"><i class="fas fa-book-open w-6 mr-2" aria-hidden="true"></i> Academia</a>
                        <a href="https://www.webofscience.com/wos/author/record/OFN-9289-2025" target="_blank" rel="noopener noreferrer" class="${profileLink}"><i class="fas fa-flask w-6 mr-2" aria-hidden="true"></i> Web of Science</a>
                        <a href="https://sciprofiles.com/profile/prathamesh-Deshmukh" target="_blank" rel="noopener noreferrer" class="${profileLink}"><i class="fas fa-atom w-6 mr-2" aria-hidden="true"></i> SciProfiles</a>
                    </div>
                </div>
            </div>
            <div class="mb-6">
                <a href="${P}sitemap.html" class="hover:text-accent-orange transition-colors">Sitemap &amp; Link Directory</a>
            </div>
            <p><a href="https://github.com/prathameshnium/prathameshnium.github.io/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" class="hover:text-accent-orange transition-colors">&copy; 2026 Prathamesh Keshao Deshmukh. All Rights Reserved.</a></p>
        </div>`;

    // Hide preloader once everything has loaded
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.display = 'none';
        }
    });

    // Generic dropdown handler (hover + click + Escape) used for the
    // "more links" menus on the home page and in the footer
    function setupDropdown(containerId, buttonId, menuId) {
        const container = document.getElementById(containerId);
        const button = document.getElementById(buttonId);
        const menu = document.getElementById(menuId);
        if (!container || !button || !menu) {
            return;
        }

        let menuTimeout;

        const showMenu = () => {
            clearTimeout(menuTimeout);
            menu.classList.remove('hidden');
            button.setAttribute('aria-expanded', 'true');
        };

        const hideMenu = (immediate = false) => {
            if (immediate) {
                menu.classList.add('hidden');
                button.setAttribute('aria-expanded', 'false');
            } else {
                menuTimeout = setTimeout(() => {
                    menu.classList.add('hidden');
                    button.setAttribute('aria-expanded', 'false');
                }, 200); // delay allows moving the mouse into the menu
            }
        };

        container.addEventListener('mouseenter', showMenu);
        container.addEventListener('mouseleave', () => hideMenu());

        button.addEventListener('click', (event) => {
            event.stopPropagation();
            if (menu.classList.contains('hidden')) {
                showMenu();
            } else {
                hideMenu(true);
            }
        });

        document.addEventListener('click', (event) => {
            if (!container.contains(event.target)) {
                hideMenu(true);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !menu.classList.contains('hidden')) {
                hideMenu(true);
                button.focus();
            }
        });
    }

    // Hover behavior for nested submenus inside the desktop portfolio dropdown
    function setupDesktopSubmenus() {
        document.querySelectorAll('header nav .relative').forEach(item => {
            const menu = item.querySelector('.dropdown-menu');
            if (!menu) return;

            let timeout;

            item.addEventListener('mouseenter', () => {
                clearTimeout(timeout);
                // Hide any other open submenus at the same level
                item.parentElement.querySelectorAll(':scope > .relative > .dropdown-menu').forEach(m => {
                    if (m !== menu) m.classList.add('hidden');
                });
                menu.classList.remove('hidden');
            });

            item.addEventListener('mouseleave', () => {
                timeout = setTimeout(() => {
                    menu.classList.add('hidden');
                }, 200); // delay allows moving the mouse into the submenu
            });
        });
    }

    // Click/keyboard behavior for the desktop portfolio dropdown
    function setupPortfolioDropdown() {
        const button = document.getElementById('portfolio-button');
        const menu = document.getElementById('portfolio-menu');
        if (!button || !menu) return;

        const toggle = (visible) => {
            menu.classList.toggle('hidden', !visible);
            button.setAttribute('aria-expanded', String(visible));
            if (visible) {
                menu.querySelector('a, button')?.focus();
            }
        };

        button.addEventListener('click', (event) => {
            event.stopPropagation();
            toggle(menu.classList.contains('hidden'));
        });

        menu.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        button.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                toggle(false);
            }
        });

        window.addEventListener('click', () => {
            if (!menu.classList.contains('hidden')) {
                toggle(false);
            }
        });
    }

    // Hamburger toggle for the mobile menu
    function setupMobileMenu() {
        const button = document.getElementById('mobile-menu-button');
        const menu = document.getElementById('mobile-menu');
        if (!button || !menu) return;

        button.addEventListener('click', () => {
            const isHidden = menu.classList.toggle('hidden');
            button.setAttribute('aria-expanded', String(!isHidden));
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars', isHidden);
                icon.classList.toggle('fa-xmark', !isHidden);
            }
        });
    }

    // Highlight the nav link of the section currently in view (home page)
    function setupActiveNavHighlight() {
        const sections = document.querySelectorAll('main section[id]');
        const navLinks = document.querySelectorAll('header nav a[href^="#"], header nav a[href*="index.html#"]');
        if (sections.length === 0 || navLinks.length === 0) return;

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                if (window.pageYOffset >= section.offsetTop - 70) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (current && link.getAttribute('href').endsWith('#' + current)) {
                    link.classList.add('active');
                }
            });
        });
    }

    // Add a copy-to-clipboard button to every code block
    function setupCopyButtons() {
        document.querySelectorAll('pre').forEach(block => {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative group';

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = '<i class="fas fa-copy mr-2"></i> Copy';
            copyButton.setAttribute('aria-label', 'Copy code to clipboard');

            block.parentNode.insertBefore(wrapper, block);
            wrapper.appendChild(block);
            wrapper.appendChild(copyButton);

            copyButton.addEventListener('click', () => {
                const code = block.querySelector('code')?.innerText || block.innerText;
                navigator.clipboard.writeText(code).then(() => {
                    copyButton.innerHTML = '<i class="fas fa-check mr-2"></i> Copied!';
                    copyButton.classList.add('copied');

                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="fas fa-copy mr-2"></i> Copy';
                        copyButton.classList.remove('copied');
                    }, 2000);
                });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Inject the shared header and footer
        const header = document.getElementById('site-header');
        if (header) {
            header.innerHTML = headerHTML;
        }
        const footer = document.getElementById('site-footer');
        if (footer) {
            footer.innerHTML = footerHTML;
        }

        // Mobile accordions (event delegation so injected buttons work too)
        document.body.addEventListener('click', (event) => {
            const button = event.target.closest('#mobile-portfolio-button');
            if (!button) return;

            const menu = document.getElementById(button.getAttribute('aria-controls'));
            if (!menu) return;

            const isExpanded = menu.classList.toggle('hidden');
            button.setAttribute('aria-expanded', String(!isExpanded));
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
        });

        setupPortfolioDropdown();
        setupDesktopSubmenus();
        setupMobileMenu();
        setupActiveNavHighlight();
        setupCopyButtons();
        setupDropdown('more-links-container', 'more-links-button', 'more-links-menu');
        setupDropdown('footer-more-links-container', 'footer-more-links-button', 'footer-more-links-menu');

        // Solid header background once the page is scrolled
        const pageHeader = document.querySelector('header');
        if (pageHeader) {
            window.addEventListener('scroll', () => {
                pageHeader.classList.toggle('scrolled', window.scrollY > 50);
            });
        }
    });
})();
