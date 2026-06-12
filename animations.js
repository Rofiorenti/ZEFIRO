// =============================================
// animations.js — shared across all pages
// =============================================

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. Navbar scroll opacity ──────────────────────────
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }


    // ── 2. Generic fade-up (cards, columns) ──────────────
    document.querySelectorAll(
        '.card, section.row > [class*="col-"], .footer .bg-primary'
    ).forEach(el => {
        if (el.closest('.py-5.text-center')) return;
        if (el.closest('.hero-content'))     return;
        if (el.closest('.team-track'))       return;
        if (el.closest('.prospects'))        return; // has own animation
        el.classList.add('fade-up');
    });

    const fadeObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                fadeObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-up').forEach(el => fadeObs.observe(el));


    // ── 3. Prospect rows: slide-in from sides ─────────────
    const slideEls = document.querySelectorAll('.slide-from-left, .slide-from-right, .slide-from-bottom');

    if (slideEls.length > 0) {
        const slideObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    slideObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.15 });

        slideEls.forEach(el => slideObs.observe(el));
    }


    // ── 4. Sticky team scroll (aboutus.htm only) ──────────
    const triggers = document.querySelectorAll('.team-trigger');
    if (triggers.length === 0) return;

    function getEls(member) {
        return {
            text:  document.getElementById('text-'  + member),
            photo: document.getElementById('photo-' + member),
            dot:   document.querySelector('.team-dot[data-member="' + member + '"]'),
        };
    }

    let currentMember = null;

    function activate(member) {
        if (member === currentMember) return;
        currentMember = member;
        document.querySelectorAll('.team-text, .team-photo, .team-dot')
            .forEach(el => el.classList.remove('active'));
        const els = getEls(member);
        if (els.text)  els.text.classList.add('active');
        if (els.photo) els.photo.classList.add('active');
        if (els.dot)   els.dot.classList.add('active');
    }

    activate(triggers[0].dataset.member);

    const triggerObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) activate(e.target.dataset.member);
        });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

    triggers.forEach(t => triggerObs.observe(t));

    document.querySelectorAll('.team-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const member = dot.dataset.member;
            const idx = Array.from(triggers).findIndex(t => t.dataset.member === member);
            if (idx < 0) return;
            const track = document.querySelector('.team-track');
            const trackTop = track.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: trackTop + idx * window.innerHeight + window.innerHeight * 0.5, behavior: 'smooth' });
        });
    });

});
