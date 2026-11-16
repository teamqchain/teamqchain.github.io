/* ============================================================
   QChain — site behaviour
   Theme, nav, scroll reveals, the home-page scroll story, and
   the renderers for research.html / audit.html (data in data.js).
   ============================================================ */
(function () {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    /* run fn at most once per frame while scrolling/resizing */
    function onScroll(fn) {
        let queued = false;
        const run = () => { queued = false; fn(); };
        const ask = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
        window.addEventListener('scroll', ask, { passive: true });
        window.addEventListener('resize', ask, { passive: true });
        fn();
    }

    /* ---------- theme + nav ---------- */
    function toggleDarkMode() {
        const dark = document.documentElement.classList.toggle('dark');
        try { localStorage.theme = dark ? 'dark' : 'light'; } catch (_) {}
        return dark;
    }
    window.toggleDarkMode = toggleDarkMode;

    function initChrome() {
        $$('#themeBtn, .theme-toggle').forEach(btn => {
            btn.addEventListener('click', toggleDarkMode);
        });

        const sheet = $('#navSheet'), burger = $('#navBurger');
        burger?.addEventListener('click', () => {
            const open = sheet.classList.toggle('is-open');
            burger.setAttribute('aria-expanded', open);
        });

        const nav = $('.nav');
        if (nav) onScroll(() => nav.classList.toggle('is-scrolled', window.scrollY > 8));
    }

    /* ---------- reveal on scroll ---------- */
    function initReveal(root = document) {
        const items = $$('[data-reveal]:not(.is-in)', root);
        if (!items.length) return;
        if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('is-in')); return; }
        const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (!en.isIntersecting) return;
                en.target.classList.add('is-in');
                io.unobserve(en.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
        const vh = window.innerHeight;
        items.forEach(el => {
            if (el.dataset.reveal) el.style.setProperty('--d', el.dataset.reveal);
            /* already on screen at load: start now rather than waiting for the observer */
            if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('is-in'); else io.observe(el);
        });
    }

    /* ---------- home: the phone follows the story ---------- */
    function initJourney() {
        const stage = $('.journey .stage');
        if (!stage || !window.QPhone) return;
        let phone = QPhone.get(stage);
        const items = $$('[data-step]');
        const meta = $('.stage__meta', stage);
        const narrow = window.matchMedia('(max-width: 900px)');
        let current = null;

        onScroll(() => {
            const scrollY = window.scrollY || window.pageYOffset || 0;
            const focus = window.innerHeight * (narrow.matches ? 0.84 : 0.62);
            let active = items[0];
            if (scrollY > 60) {
                for (let i = 1; i < items.length; i++) {
                    if (items[i].getBoundingClientRect().top < focus) {
                        active = items[i];
                    }
                }
            }
            if (active === current) return;
            current = active;
            items.forEach(it => it.classList.toggle('is-active', it === active));
            if (!phone) phone = QPhone.get(stage);
            phone?.scene(active.dataset.step);
            const n = items.indexOf(active);
            meta.innerHTML = n === 0
                ? ''
                : `<b>0${n}</b> / 0${items.length - 1} <span>${esc(active.dataset.label || '')}</span>`;
        });
    }

    /* ---------- screenshots tilt up as they scroll in ---------- */
    function initTilt() {
        const els = $$('[data-tilt]');
        if (!els.length || REDUCED) return;
        onScroll(() => {
            const vh = window.innerHeight;
            els.forEach(el => {
                const r = el.parentElement.getBoundingClientRect();
                const p = clamp(1 - (r.top - vh * 0.2) / (vh * 0.75), 0, 1);
                const e = 1 - Math.pow(1 - p, 3);
                el.style.setProperty('--tilt', ((1 - e) * 26).toFixed(2) + 'deg');
                el.style.setProperty('--zoom', (0.9 + e * 0.1).toFixed(4));
            });
        });
    }

    /* ---------- numbers that settle ---------- */
    function initCounts() {
        const els = $$('[data-count-from]');
        if (!els.length) return;
        const fmt = n => Math.round(n).toLocaleString('en-US');
        const io = new IntersectionObserver(entries => entries.forEach(en => {
            if (!en.isIntersecting) return;
            io.unobserve(en.target);
            const el = en.target, from = +el.dataset.countFrom, to = +el.dataset.countTo;
            const pre = el.dataset.prefix || '';
            if (REDUCED) { el.textContent = pre + fmt(to); return; }
            const t0 = performance.now(), dur = 2200;
            const step = t => {
                const p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
                el.textContent = (p === 1 ? pre : '') + fmt(from + (to - from) * e);
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }), { threshold: 0.6 });
        els.forEach(el => io.observe(el));
    }

    /* ---------- platforms: wallet tabs drive the phone ---------- */
    function initWalletTabs() {
        const tabs = $('[data-tabs]');
        if (!tabs || !window.QPhone) return;
        const stage = $(tabs.dataset.tabs);
        const btns = $$('.tab', tabs);
        let i = 0, timer = 0, visible = false;

        const select = n => {
            i = (n + btns.length) % btns.length;
            btns.forEach((b, k) => b.setAttribute('aria-selected', k === i));
            QPhone.get(stage)?.scene(btns[i].dataset.scene);
        };
        const play = () => {
            clearInterval(timer);
            if (visible && !tabs.classList.contains('is-held') && !REDUCED) timer = setInterval(() => select(i + 1), 6000);
        };

        btns.forEach((b, k) => b.addEventListener('click', () => { tabs.classList.add('is-held'); select(k); play(); }));
        stage.addEventListener('pointerdown', () => { tabs.classList.add('is-held'); play(); });
        new IntersectionObserver(([en]) => { visible = en.isIntersecting; play(); }, { threshold: 0.3 }).observe(tabs);
        select(0);
    }

    /* ---------- research: architecture inspector ---------- */
    const ARCH = {
        qportal: ['QPortal', 'Web console for the organisations. <b>Issuers</b> create and revoke credentials, <b>verifiers</b> check presentations, <b>IT admins</b> manage staff, identities and network policy.'],
        qwallet: ['QWallet', 'The holder\'s phone. Keys are generated on the device: <b>ML-KEM-768</b> to decrypt credentials, <b>ML-DSA-44</b> to sign single-use presentations. Private keys never leave it.'],
        gateway: ['HTTPS gateway', '<b>Nginx</b> reverse proxy that terminates TLS in front of the API. Security headers and rate limiting are open items in our audit (F14).'],
        backend: ['Core API (Go)', 'Does the cryptographic work: <b>ML-DSA-44</b> signing, <b>ML-KEM-768 + AES-256-GCM</b> envelope encryption, dual-signature verification, single-use QR and OTP tokens, credential lifecycle.'],
        fabric: ['Hyperledger Fabric', 'Permissioned ledger with <b>2 organisation peers</b>, a Raft orderer, 3 CAs and CouchDB state, running the JavaScript chaincode. Credential signatures are post-quantum; node identities and TLS are still classical ECDSA, with an ML-DSA MSP on the roadmap (F04).'],
        ipfs: ['IPFS', 'Holds the full encrypted credential, addressed by its content ID. Keeping 2.4 KB signatures and payloads off the ledger is what stops the chain from bloating.'],
        mysql: ['MySQL', 'Operational data that does not belong on a ledger: accounts, sessions, audit trail. Never consulted for a cryptographic decision.']
    };

    function initArch() {
        const nodes = $$('[data-arch]');
        if (!nodes.length) return;
        const title = $('#archTitle'), text = $('#archText');
        nodes.forEach(n => n.addEventListener('click', () => {
            const d = ARCH[n.dataset.arch];
            if (!d) return;
            nodes.forEach(o => o.setAttribute('aria-pressed', o === n));
            title.textContent = d[0];
            text.innerHTML = d[1];
        }));
    }

    /* ---------- research: reading list ---------- */
    function initRefs() {
        const box = $('#refs');
        if (!box || typeof references === 'undefined') return;
        const sorted = [...references].sort((a, b) => b.year - a.year);
        box.innerHTML = sorted.map(r => `
            <details class="ref" data-search="${esc((r.title + ' ' + r.publisher + ' ' + r.type + ' ' + r.year + ' ' + r.bullets.join(' ')).toLowerCase())}">
                <summary>
                    <span class="ref__y">${esc(r.year)}</span>
                    <span class="ref__t">${esc(r.title)}</span>
                    <span class="ref__m">${esc(r.publisher)}</span>
                </summary>
                <div class="ref__body">
                    <ul class="ticks">${r.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
                    <div class="row"><span class="tag">${esc(r.type)}</span><a class="link small" href="${esc(r.link)}" target="_blank" rel="noopener">Open paper <span class="arr">↗</span></a></div>
                </div>
            </details>`).join('');

        const input = $('#refSearch'), none = $('#refNone');
        input?.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            let shown = 0;
            $$('.ref', box).forEach(el => {
                const hit = el.dataset.search.includes(q);
                el.hidden = !hit;
                if (hit) shown++;
            });
            none.hidden = shown !== 0;
        });
    }

    /* ---------- audit ---------- */
    const SEV = { Critical: 'bad', High: 'hot', Medium: 'warn', Low: 'info' };
    const STATUS = { Active: 'bad', Resolved: 'ok', 'Partially Resolved': 'warn' };

    function initAudit() {
        if (typeof findings === 'undefined') return;
        const open = f => f.status !== 'Resolved';
        const n = {
            critical: findings.filter(f => f.sev === 'Critical' && open(f)).length,
            high: findings.filter(f => f.sev === 'High' && open(f)).length,
            medium: findings.filter(f => f.sev === 'Medium' && open(f)).length,
            low: findings.filter(f => f.sev === 'Low' && open(f)).length,
            resolved: findings.filter(f => !open(f)).length,
            partial: findings.filter(f => f.status === 'Partially Resolved').length,
            total: findings.length,
            strengths: typeof strengths !== 'undefined' ? strengths.length : 0
        };
        $$('[data-n]').forEach(el => { if (el.dataset.n in n) el.textContent = n[el.dataset.n]; });
        $$('[data-flex]').forEach(el => el.style.setProperty('--n', n[el.dataset.flex]));

        /* findings by area */
        const cats = $('#catBars');
        if (cats) {
            const map = {};
            findings.forEach(f => { map[f.cat] = (map[f.cat] || 0) + 1; });
            const rows = Object.entries(map).sort((a, b) => b[1] - a[1]);
            const max = rows[0][1];
            cats.innerHTML = rows.map(([c, v], k) => `
                <div class="bar" style="--d:${k}">
                    <div class="bar__l"><span>${esc(c)}</span><span>${v}</span></div>
                    <div class="bar__t"><div class="bar__f" style="--v:${(v / max * 100).toFixed(1)}%"></div></div>
                </div>`).join('');
        }

        /* the table */
        const body = $('#findBody');
        if (body) {
            body.innerHTML = findings.map(f => {
                const sev = SEV[f.sev] || 'info', st = STATUS[f.status] || 'bad';
                const done = f.status === 'Resolved';
                return `
                <tr class="find" tabindex="0" aria-expanded="false" data-id="${f.id}" data-sev="${f.sev}" data-status="${f.status}"
                    data-search="${esc((f.id + ' ' + f.title + ' ' + f.cat + ' ' + f.loc + ' ' + f.impact + ' ' + f.status).toLowerCase())}">
                    <td>${f.id}</td>
                    <td><span class="tag tag--${sev}">${f.sev}</span></td>
                    <td><span class="tag tag--${st}">${f.status === 'Partially Resolved' ? 'Partial' : f.status}</span></td>
                    <td class="find__t">${esc(f.title)}</td>
                    <td>${esc(f.cat)}</td>
                    <td class="find__loc">${esc(f.loc)}</td>
                </tr>
                <tr class="find__more" id="more-${f.id}" hidden style="--sev:var(--${done ? 'ok' : sev})">
                    <td colspan="6"><div>
                        <div><h4>Impact</h4><p>${esc(f.impact)}</p></div>
                        <div><h4>${done ? 'How it was fixed' : 'Recommended fix'}</h4><p>${esc(f.rec.replace(/^RESOLVED[^:]*:\s*/, ''))}</p></div>
                    </div></td>
                </tr>`;
            }).join('');

            const toggle = row => {
                const more = $('#more-' + row.dataset.id);
                more.hidden = !more.hidden;
                row.setAttribute('aria-expanded', !more.hidden);
            };
            body.addEventListener('click', e => { const r = e.target.closest('.find'); if (r) toggle(r); });
            body.addEventListener('keydown', e => {
                const r = e.target.closest('.find');
                if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(r); }
            });

            const q = $('#findSearch'), sevSel = $('#findSev'), stSel = $('#findStatus'), none = $('#findNone');
            const filter = () => {
                const text = q.value.trim().toLowerCase();
                let shown = 0;
                $$('.find', body).forEach(row => {
                    const hit = row.dataset.search.includes(text)
                        && (!sevSel.value || row.dataset.sev === sevSel.value)
                        && (!stSel.value || row.dataset.status === stSel.value);
                    row.hidden = !hit;
                    if (!hit) { $('#more-' + row.dataset.id).hidden = true; row.setAttribute('aria-expanded', false); }
                    if (hit) shown++;
                });
                none.hidden = shown !== 0;
            };
            [q, sevSel, stSel].forEach(el => el.addEventListener('input', filter));
        }

        const sg = $('#strengths');
        if (sg && typeof strengths !== 'undefined') {
            sg.innerHTML = strengths.map((s, k) => `
                <div><i>${String(k + 1).padStart(2, '0')}</i><h4>${esc(s.title)}</h4><p>${esc(s.body)}</p></div>`).join('');
        }
    }

    /* ---------- go ---------- */
    initChrome();
    initJourney();
    initTilt();
    initCounts();
    initWalletTabs();
    initArch();
    initRefs();
    initAudit();
    initReveal();
})();
