/* ============================================================
   LEAD MÉXICO — Main Engine v2 (Apex ESM)
   Lazy Loading · Menú Mobile (FIXED) · Flip Cards · Scroll
   ============================================================ */

(function () {
    'use strict';

    /* ─── CONSTANTES ─────────────────────────────────────── */
    const MODULES = [
        { id: 'hero-container', url: 'modules/hero.html' },
        { id: 'nosotros-container', url: 'modules/nosotros.html' },
        { id: 'servicios-container', url: 'modules/servicios.html' },
        { id: 'equipo-container', url: 'modules/equipo.html' },
        { id: 'contacto-container', url: 'modules/contacto.html' },
        { id: 'footer-container', url: 'modules/footer.html' }
    ];

    const OBSERVER_OPTIONS = {
        root: null,
        rootMargin: '200px 0px',
        threshold: 0.01
    };

    const loadedModules = new Set();

    /* ─── LAZY LOADER ────────────────────────────────────── */
    async function loadModule(containerId, moduleUrl) {
        if (loadedModules.has(containerId)) return;
        loadedModules.add(containerId);

        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const response = await fetch(moduleUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const html = await response.text();
            container.innerHTML = html;

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    container.classList.add('loaded');
                });
            });

            observeInternalAnimations(container);

            if (containerId === 'contacto-container') {
                initContactForm(container);
            }

        } catch (error) {
            console.error(`[LEAD] Error cargando módulo "${moduleUrl}":`, error);
            container.innerHTML = `
                <div style="text-align:center; padding:3rem; color:#6B7A8D;">
                    <p>Error al cargar esta sección. Recarga la página.</p>
                </div>`;
            container.classList.add('loaded');
        }
    }

    /* ─── INTERSECTION OBSERVER ──────────────────────────── */
    function initLazyLoading() {
        loadModule('hero-container', 'modules/hero.html');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const config = MODULES.find(m => m.id === entry.target.id);
                    if (config) {
                        loadModule(config.id, config.url);
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, OBSERVER_OPTIONS);

        MODULES.forEach(config => {
            if (config.id === 'hero-container') return;
            const el = document.getElementById(config.id);
            if (el) observer.observe(el);
        });
    }

    /* ─── ANIMACIONES INTERNAS ───────────────────────────── */
    function observeInternalAnimations(parent) {
        const animatables = parent.querySelectorAll('.animate-on-scroll');
        if (!animatables.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        animatables.forEach(el => observer.observe(el));
    }

    /* ─── NAVBAR SCROLL EFFECT ───────────────────────────── */
    function initNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    navbar.classList.toggle('scrolled', window.scrollY > 60);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /* ─── SMOOTH SCROLL ──────────────────────────────────── */
    function initSmoothScroll() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);

            if (target) {
                closeMobileMenu();
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    /* ─── MOBILE MENU (FIXED — toggle, close, animation) ── */
    function initMobileMenu() {
        const toggle = document.querySelector('.nav-toggle');
        const mobileMenu = document.querySelector('.nav-mobile');
        const closeBtn = document.querySelector('.nav-mobile-close');

        if (!toggle || !mobileMenu) return;

        // Toggle: abre o cierra al hacer click en hamburguesa
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mobileMenu.classList.contains('active');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Botón X de cerrar
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMobileMenu();
            });
        }

        // Cerrar al hacer click en un link del menú
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    function openMobileMenu() {
        const mobileMenu = document.querySelector('.nav-mobile');
        const toggle = document.querySelector('.nav-toggle');
        if (mobileMenu) {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        if (toggle) {
            toggle.classList.add('active');
            // Cambiar icono a X
            const icon = toggle.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = 'close';
        }
    }

    function closeMobileMenu() {
        const mobileMenu = document.querySelector('.nav-mobile');
        const toggle = document.querySelector('.nav-toggle');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
        if (toggle) {
            toggle.classList.remove('active');
            // Restaurar icono a hamburguesa
            const icon = toggle.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = 'menu';
        }
    }

    /* ─── FORMULARIO DE CONTACTO ─────────────────────────── */
    function initContactForm(container) {
        const form = container.querySelector('#contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const inputs = form.querySelectorAll('[required]');
            let valid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    valid = false;
                    input.style.borderColor = 'hsl(0, 65%, 50%)';
                } else {
                    input.style.borderColor = '';
                }
            });

            const emailInput = form.querySelector('[type="email"]');
            if (emailInput && emailInput.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInput.value)) {
                    valid = false;
                    emailInput.style.borderColor = 'hsl(0, 65%, 50%)';
                }
            }

            if (valid) {
                const btn = form.querySelector('[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = '✓ Mensaje Enviado';
                btn.style.background = 'hsl(160, 60%, 40%)';
                btn.disabled = true;

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                    form.reset();
                }, 3000);
            }
        });
    }

    /* ─── AÑO DINÁMICO ───────────────────────────────────── */
    function updateYear() {
        const observer = new MutationObserver(() => {
            const yearEl = document.getElementById('current-year');
            if (yearEl) {
                yearEl.textContent = new Date().getFullYear();
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /* ─── INIT ───────────────────────────────────────────── */
    function init() {
        initNavbarScroll();
        initSmoothScroll();
        initMobileMenu();
        initLazyLoading();
        updateYear();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
