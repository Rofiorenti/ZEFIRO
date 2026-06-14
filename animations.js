// =============================================
// animations.js — ZEFIRO — all pages
// =============================================

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. Navbar scroll class ────────────────────────────
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // run once on load
    }


    // ── 2. Slide animations (IntersectionObserver) ────────
    const slideEls = document.querySelectorAll('.slide-from-left, .slide-from-right, .slide-from-bottom');

    if (slideEls.length > 0) {
        const slideObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    slideObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        slideEls.forEach(el => slideObs.observe(el));
    }


    // ── 3. Generic fade-up ───────────────────────────────
    const fadeEls = document.querySelectorAll('.fade-up');
    if (fadeEls.length > 0) {
        const fadeObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    fadeObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        fadeEls.forEach(el => fadeObs.observe(el));
    }


    // ── 4. Team scroll sticky (aboutus.htm — desktop) ────
    const triggers = document.querySelectorAll('.z-team-trigger');
    if (triggers.length > 0) {

        function getEls(member) {
            return {
                text:  document.getElementById('text-'  + member),
                photo: document.getElementById('photo-' + member),
                dot:   document.querySelector('.z-team-dot[data-member="' + member + '"]'),
            };
        }

        let currentMember = null;

        function activate(member) {
            if (member === currentMember) return;
            currentMember = member;
            document.querySelectorAll('.z-team-text, .z-team-photo, .z-team-dot')
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

        document.querySelectorAll('.z-team-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const member = dot.dataset.member;
                const idx = Array.from(triggers).findIndex(t => t.dataset.member === member);
                if (idx < 0) return;
                const track = document.querySelector('.z-team-track');
                const trackTop = track.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({ top: trackTop + idx * window.innerHeight + window.innerHeight * 0.5, behavior: 'smooth' });
            });
        });
    }


    // ── 5. Mobile team slideshow (aboutus.htm) ───────────
    const slideshow = document.getElementById('team-slideshow');
    if (slideshow) {
        const dots   = slideshow.querySelectorAll('.z-slide-dot');
        const slides = slideshow.querySelectorAll('.z-team-slide');

        slideshow.addEventListener('scroll', () => {
            const idx = Math.round(slideshow.scrollLeft / slideshow.clientWidth);
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }, { passive: true });

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.dataset.idx);
                slideshow.scrollTo({ left: idx * slideshow.clientWidth, behavior: 'smooth' });
            });
        });

        const swipeHint = document.getElementById('swipe-hint');
        if (swipeHint) {
            slideshow.addEventListener('scroll', () => {
                if (slideshow.scrollLeft > 20) swipeHint.classList.add('hidden');
            }, { passive: true });
        }
    }


    // ── 6. Status carousel (theproject.htm — mobile) ─────
    const statusCarousel = document.getElementById('status-carousel');
    if (statusCarousel) {
        const track = statusCarousel.querySelector('.z-status-carousel-track');
        const dots  = statusCarousel.querySelectorAll('.z-status-dot');

        if (track && dots.length) {
            track.addEventListener('scroll', () => {
                const itemW = track.querySelector('.z-status-carousel-item')?.offsetWidth || track.clientWidth;
                const idx = Math.min(Math.round(track.scrollLeft / itemW), dots.length - 1);
                dots.forEach((d, i) => d.classList.toggle('active', i === idx));
            }, { passive: true });

            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const idx = parseInt(dot.dataset.idx);
                    const itemW = (track.querySelector('.z-status-carousel-item')?.offsetWidth || 0) + 12;
                    track.scrollTo({ left: idx * itemW, behavior: 'smooth' });
                });
            });
        }
    }


    // ── 7. "Where Zefiro flies" — scroll crossfade (desktop) ─
    const flyTriggers = document.querySelectorAll('.z-fly-trigger');
    if (flyTriggers.length > 0) {

        let currentFly = null;

        function activateFly(idx) {
            if (idx === currentFly) return;
            currentFly = idx;
            const id = idx.toString();
            document.querySelectorAll('.z-fly-bg').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.z-fly-panel').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.z-fly-dot').forEach(el => el.classList.remove('active'));
            const bg   = document.getElementById('fly-bg-'   + id);
            const text = document.getElementById('fly-text-' + id);
            const dot  = document.querySelector('.z-fly-dot[data-fly="' + id + '"]');
            if (bg)   bg.classList.add('active');
            if (text) text.classList.add('active');
            if (dot)  dot.classList.add('active');
        }

        activateFly(0);

        const flyObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) activateFly(parseInt(e.target.dataset.fly));
            });
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

        flyTriggers.forEach(t => flyObs.observe(t));

        document.querySelectorAll('.z-fly-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const idx   = parseInt(dot.dataset.fly);
                const track = document.querySelector('.z-fly-track');
                if (!track) return;
                const trackTop = track.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({ top: trackTop + idx * window.innerHeight + 10, behavior: 'smooth' });
            });
        });
    }


    // ── 8. "Where Zefiro flies" — mobile snap slideshow ──
    const flyMobile = document.getElementById('fly-mobile-slides');
    if (flyMobile) {
        const flyMobileDots = document.querySelectorAll('.z-fly-mobile-dot');
        flyMobile.addEventListener('scroll', () => {
            const idx = Math.round(flyMobile.scrollLeft / flyMobile.clientWidth);
            flyMobileDots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }, { passive: true });
        flyMobileDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.dataset.idx);
                flyMobile.scrollTo({ left: idx * flyMobile.clientWidth, behavior: 'smooth' });
            });
        });
    }

});
