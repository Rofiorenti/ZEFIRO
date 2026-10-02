// =============================================
// analytics.js — ZEFIRO — consent + Google Analytics 4
// =============================================
// Loaded on every page. Kept out of animations.js because it has to run
// independently of the DOM-ready animation blocks.
//
// ── SETUP ────────────────────────────────────────────────────────────
// Paste the Measurement ID of the GA4 property here (looks like G-XXXXXXXXXX).
// While this is empty NOTHING is loaded: no Google script, no cookies, no banner.
const GA_MEASUREMENT_ID = 'G-GLS2MFQ65Q';
// ─────────────────────────────────────────────────────────────────────

(function () {

    if (!GA_MEASUREMENT_ID) return;   // not configured yet — stay inert

    const STORE_KEY = 'zefiro-consent';

    // localStorage throws in private mode / with site data blocked
    function readConsent() {
        try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
    }
    function writeConsent(v) {
        try { localStorage.setItem(STORE_KEY, v); } catch (e) { /* ignore */ }
    }

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }

    // Consent Mode v2 — everything denied until the visitor agrees
    gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500
    });

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });

    let scriptLoaded = false;
    function loadGA() {
        if (scriptLoaded) return;
        scriptLoaded = true;
        const s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
        document.head.appendChild(s);
    }

    function grant() {
        gtag('consent', 'update', { analytics_storage: 'granted' });
        loadGA();
    }

    // Declining after having accepted must also clear what was already written,
    // otherwise the old _ga cookies keep identifying the visitor.
    function deny() {
        gtag('consent', 'update', { analytics_storage: 'denied' });

        const host = location.hostname;
        const domains = ['', host, '.' + host];
        const parts = host.split('.');
        if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));

        document.cookie.split(';').forEach(function (raw) {
            const name = raw.split('=')[0].trim();
            if (!/^_ga|^_gid$|^_gat/.test(name)) return;
            domains.forEach(function (d) {
                document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
            });
        });
    }

    function buildBanner() {
        const bar = document.createElement('div');
        bar.className = 'z-consent';
        bar.setAttribute('role', 'dialog');
        bar.setAttribute('aria-label', 'Cookie preferences');
        bar.innerHTML =
            '<p class="z-consent-text">We use analytics cookies to understand how this site is used. ' +
            'They are only set if you accept, and we never use them for advertising.</p>' +
            '<div class="z-consent-actions">' +
            '<button type="button" class="z-consent-btn z-consent-btn--ghost" data-consent="denied">Decline</button>' +
            '<button type="button" class="z-consent-btn" data-consent="granted">Accept</button>' +
            '</div>';

        bar.addEventListener('click', function (e) {
            const btn = e.target.closest('[data-consent]');
            if (!btn) return;
            const choice = btn.getAttribute('data-consent');
            writeConsent(choice);
            if (choice === 'granted') { grant(); } else { deny(); }
            bar.classList.remove('visible');
            setTimeout(() => bar.remove(), 300);
        });

        document.body.appendChild(bar);
        // setTimeout rather than requestAnimationFrame: rAF does not fire in a
        // background tab, which would leave the bar stuck off-screen.
        setTimeout(() => bar.classList.add('visible'), 60);
    }

    const saved = readConsent();
    if (saved === 'granted') {
        grant();
    } else if (saved === 'denied') {
        deny();
    } else {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', buildBanner);
        } else {
            buildBanner();
        }
    }

})();
