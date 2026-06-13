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


    // ── 5. Mobile team slideshow ──────────────────────────
    const slideshow = document.getElementById('team-slideshow');
    if (slideshow) {
        const dots = slideshow.querySelectorAll('.slide-dot');
        const slides = slideshow.querySelectorAll('.team-slide');

        // Update dots on scroll (snap fires scroll events)
        slideshow.addEventListener('scroll', () => {
            const idx = Math.round(slideshow.scrollLeft / slideshow.clientWidth);
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }, { passive: true });

        // Dot tap → scroll to slide
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.dataset.idx);
                slideshow.scrollTo({ left: idx * slideshow.clientWidth, behavior: 'smooth' });
            });
        });

        // Swipe hint — hide after first swipe
        const swipeHint = document.getElementById('swipe-hint');
        if (swipeHint) {
            slideshow.addEventListener('scroll', () => {
                if (slideshow.scrollLeft > 20) {
                    swipeHint.classList.add('hidden');
                }
            }, { passive: true, once: false });
        }
    }


    // ── 6. Project status carousel (mobile) ──────────────
    const statusCarousel = document.getElementById('status-carousel');
    if (statusCarousel) {
        const track = statusCarousel.querySelector('.status-carousel-track');
        const dots  = statusCarousel.querySelectorAll('.status-dot');

        track.addEventListener('scroll', () => {
            const idx = Math.round(track.scrollLeft / track.clientWidth * (1 / 0.78));
            const clamped = Math.min(idx, dots.length - 1);
            dots.forEach((d, i) => d.classList.toggle('active', i === clamped));
        }, { passive: true });

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.dataset.idx);
                const itemW = track.querySelector('.status-carousel-item').offsetWidth + 12; // gap
                track.scrollTo({ left: idx * itemW, behavior: 'smooth' });
            });
        });
    }


    // ── 7. Stats strip swipe hint ─────────────────────────
    const statsStrip     = document.getElementById('stats-strip');
    const statsSwipeHint = document.getElementById('stats-swipe-hint');
    if (statsStrip && statsSwipeHint) {
        let touchStartX = 0;

        // touchstart: record finger position
        statsStrip.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        // touchend: if finger moved left by >15px → hide hint
        statsStrip.addEventListener('touchend', (e) => {
            const dx = touchStartX - e.changedTouches[0].clientX;
            if (dx > 15) {
                statsSwipeHint.classList.add('hidden');
            }
        }, { passive: true });

        // also try scroll for non-touch devices
        const scrollingEl = statsStrip.querySelector('.stats-inner');
        if (scrollingEl) {
            scrollingEl.addEventListener('scroll', () => {
                if (scrollingEl.scrollLeft > 20) statsSwipeHint.classList.add('hidden');
            }, { passive: true });
        }
        statsStrip.addEventListener('scroll', () => {
            if (statsStrip.scrollLeft > 20) statsSwipeHint.classList.add('hidden');
        }, { passive: true });
    }

});
