/* ============================================================
   QChain — the 3D phone
   A real extruded body built from DOM planes (front glass, back
   plate, and a rim of small faces that follow the rounded
   corners), lit per-face every frame. The screen is live HTML,
   so anything on it can lift off the glass in Z.

   Usage:  <div class="stage" data-phone="hero"></div>
           QPhone.get(el).scene('disclose')
   ============================================================ */
(function () {
    'use strict';

    const W = 300, H = 624, T = 24, R = 54, CORNER_STEPS = 9;
    const QR_LIFE = 60;   // seconds, as in the app
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* screen = which UI is on the glass, fx = what leaves the glass, rx/ry = resting pose */
    const SCENES = {
        hero:     { screen: 'wallet',  fx: 'lift',   rx: 12, ry: -30 },
        issue:    { screen: 'lock',    fx: '',       rx: 8,  ry: 26 },
        receive:  { screen: 'wallet',  fx: 'drop',   rx: 16, ry: -16 },
        disclose: { screen: 'share',   fx: '',       rx: 18, ry: -36 },
        verify:   { screen: 'present', fx: 'verify', rx: 8,  ry: 30 },
        stack:    { screen: 'wallet',  fx: 'lift',   rx: 12, ry: -28 },
        present:  { screen: 'present', fx: '',       rx: 8,  ry: 24 },
        log:      { screen: 'log',     fx: '',       rx: 14, ry: -24 }
    };

    const FIELDS = [
        ['Full name', 'Tariq Al Nuaimi', '4be1…a09c', true],
        ['Degree', 'BSc Computer Science', '71d0…f3e2', true],
        ['Graduated', 'June 2026', 'c5a8…1d47', true],
        ['GPA', '3.74 / 4.00', '9f2c…41e7', false],
        ['Emirates ID', '784-1990-•••••••-1', '03ab…c9d2', false],
        ['Date of birth', '14 Mar 1990', 'e77a…5b10', false]
    ];

    const LOG = [
        ['ok', '✓', 'Presented to a verifier', '3 of 6 fields · BSc degree', '14:22'],
        ['in', '↓', 'Credential received', 'BSc Computer Science', '09:14'],
        ['ok', '✓', 'Presented to a verifier', '1 of 5 fields · Health certificate', '2 Mar'],
        ['up', '↻', 'Issuer renewed a credential', 'Health certificate', '10 Jan']
    ];

    const ICON = {
        timer: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="8" cy="9" r="5.5"/><path d="M8 6.5V9l1.6 1M6.5 1.8h3"/></svg>',
        refresh: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 2.5V5h-2.5"/></svg>',
        info: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 7.5v3.5M8 5h.01"/></svg>',
        back: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 5 8l5 5"/></svg>',
        filter: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 4h12M4.5 8h7M7 12h2"/></svg>',
        rows: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="2.5" width="12" height="4.5" rx="1.5"/><rect x="2" y="9" width="12" height="4.5" rx="1.5"/></svg>',
        wallet: '<svg viewBox="0 0 18 18" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"><rect x="2" y="4" width="14" height="11" rx="2.5"/><path d="M2 8h14M12 11.5h1.5"/></svg>',
        cap: '<svg viewBox="0 0 16 16" fill="#fff"><path d="M8 2 1 5.5 8 9l5.5-2.75V10h1V5.5L8 2Z"/><path d="M4 8.4v2.4c0 .9 1.8 1.9 4 1.9s4-1 4-1.9V8.4L8 10.4 4 8.4Z"/></svg>',
        cross: '<svg viewBox="0 0 16 16" fill="#fff"><path d="M6.2 2.5h3.6v3.7h3.7v3.6H9.8v3.7H6.2V9.8H2.5V6.2h3.7V2.5Z"/></svg>',
        car: '<svg viewBox="0 0 16 16" fill="#fff"><path d="M3.6 4.2A1.6 1.6 0 0 1 5.1 3h5.8a1.6 1.6 0 0 1 1.5 1.2L13 6.5c.6.2 1 .8 1 1.5v3h-1.5v1.5h-2V11h-5v1.5h-2V11H2V8c0-.7.4-1.300 1-1.500l.6-2.300Zm1.200 2.100h6.400l-.4-1.700H5.200l-.4 1.700Z"/></svg>',
        tick: '<svg viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m2.5 6.3 2.3 2.300 4.700-5"/></svg>',
        sys: '<svg viewBox="0 0 58 12" fill="#fff"><rect x="0" y="7" width="3" height="5" rx=".8"/><rect x="4.500" y="5" width="3" height="7" rx=".8"/><rect x="9" y="2.500" width="3" height="9.500" rx=".8"/><rect x="13.500" y="0" width="3" height="12" rx=".8"/><path d="M21.5 4.5a7.8 7.8 0 0 1 11 0" fill="none" stroke="#fff" stroke-width="1.35" stroke-linecap="round"/><path d="M24 7a4.3 4.3 0 0 1 6 0" fill="none" stroke="#fff" stroke-width="1.35" stroke-linecap="round"/><circle cx="27" cy="10" r="1.25"/><rect x="37.500" y=".5" width="17.500" height="11" rx="3.200" fill="none" stroke="#fff" stroke-opacity=".45"/><rect x="39" y="2" width="14.500" height="8" rx="1.900"/><rect x="56" y="4" width="1.600" height="4" rx=".8" fill-opacity=".5"/></svg>'
    };

    const cred = (cls, icon, name, by, a, b, c) => `
        <div class="fl for-wallet cred ${cls}">
            <div class="cred__top"><span class="cred__ic">${icon}</span><span class="cred__star">★</span></div>
            <div class="cred__name">${name}</div>
            <div class="cred__by">${by}</div>
            <div class="cred__row">
                <span><small>NUMBER</small>${a}</span><span><small>STATUS</small>${b}</span><span><small>ISSUED</small>${c}</span>
            </div>
        </div>`;

    const TEMPLATE = `
    <div class="stage__floor"></div>
    <div class="phone" data-screen="wallet" data-fx="" aria-hidden="true">
        <div class="ph-rim"></div>

        <div class="ph-back"><img src="assets/qchain-mark.webp" alt="" width="74" height="74"></div>
        <div class="ph-cam"></div>
        <div class="ph-lens"><i></i><i></i><i></i><i></i><i></i></div>

        <div class="ph-front">
            <div class="ph-screen">
                <div class="ph-status"><span>9:41</span>${ICON.sys}</div>
                <div class="ph-island"></div>

                <div class="sc sc-wallet">
                    <div class="sc-top">
                        <div class="sc-top__bar">
                            <span class="sc-circ">${ICON.back}</span><span class="sp"></span>
                            <span class="sc-pill">${ICON.filter} Valid only</span><span class="sc-circ">${ICON.rows}</span>
                        </div>
                        <div class="sc-title"><span class="sc-title__ic">${ICON.wallet}</span><div><b>Wallet</b><span>3 credentials</span></div></div>
                    </div>
                    <div class="sc-count">1 of 3</div>
                    <div class="sc-hint">Swipe down to browse</div>
                </div>

                <div class="sc sc-lock">
                    <div class="sc-lock__date">Sunday 15 November</div>
                    <div class="sc-lock__time">9:41</div>
                </div>

                <div class="sc sc-share">
                    <div class="sc-top">
                        <div class="sc-top__bar"><span class="sc-circ">${ICON.back}</span><span class="sp"></span></div>
                        <div class="sc-title"><span class="sc-title__ic">${ICON.cap}</span><div><b>Choose what to share</b><span>BSc Computer Science</span></div></div>
                    </div>
                    <div class="sc-share__note" style="top:456px">Hidden fields stay on this phone as salted hashes.</div>
                    <div class="sc-cta" data-cta>Present 3 of 6 fields</div>
                </div>

                <div class="sc sc-present">
                    <div class="pr-top">
                        <span class="sc-circ pr-back">${ICON.back}</span>
                        <div class="pr-head"><small>Present Document</small><b>Bachelor of Science in Computer Science</b></div>
                        <div class="pr-org"><b>University of Sharjah</b><small>ID: CRED-0003</small></div>
                    </div>
                    <div class="pr-timer">
                        <div class="pr-timer__row">${ICON.timer}<span>QR Code expires in</span><b data-clock>01:00</b></div>
                        <div class="pr-timer__bar"><i data-bar></i></div>
                    </div>
                    <div class="pr-btn pr-btn--off">${ICON.refresh} Refresh QR Code</div>
                    <div class="pr-btn"><span class="pr-stars">***</span> Share via OTP Instead</div>
                    <div class="pr-note">${ICON.info}<span>Show this QR code to a verifier. It carries <span data-sub>3 of 6 fields</span>, is single-use and expires shortly.</span></div>
                </div>

                <div class="sc sc-log">
                    <div class="sc-top">
                        <div class="sc-top__bar"><span class="sc-circ">${ICON.back}</span><span class="sp"></span></div>
                        <div class="sc-title"><span class="sc-title__ic">${ICON.rows}</span><div><b>Activity</b><span>Who checked what, and when</span></div></div>
                    </div>
                    <div class="sc-log__foot">Kept on this device only</div>
                </div>

                <div class="ph-home"></div>
                <div class="ph-glare"></div>
            </div>
        </div>

        <div class="ph-float">
            ${cred('cred--c', ICON.car, 'Driving Licence', 'Roads and Transport Authority', 'CRED-0005', 'Valid', '02 Feb 2025')}
            ${cred('cred--b', ICON.cross, 'Health Certificate', 'Ministry of Health and Prevention', 'CRED-0002', 'Valid', '10 Jan 2026')}
            ${cred('cred--a', ICON.cap, 'BSc Computer Science', 'University of Sharjah', 'CRED-0003', 'Valid', '16 Nov 2026')}

            <div class="fl toast"><i>${ICON.tick}</i><div>Decrypted on this phone<small>ML-KEM-768 → AES-256-GCM</small></div></div>

            <div class="fl for-lock notif">
                <div class="notif__h"><img src="assets/qchain-mark.webp" alt="" width="18" height="18"><span>QWALLET</span><span>now</span></div>
                <b>New credential</b>
                <p>University of Sharjah issued your BSc Computer Science.</p>
                <div class="notif__f"><span>ML-DSA-44 signed</span><span>anchored on Fabric</span></div>
            </div>

            ${FIELDS.map((f, i) => `
            <div class="fl for-share field${f[3] ? ' is-on' : ''}" style="top:${172 + i * 47}px" role="switch" aria-checked="${f[3]}">
                <div class="field__t"><small>${f[0]}</small><b>${f[1]}</b><b class="hash">sha3 · ${f[2]}</b></div>
                <span class="sw"></span>
            </div>`).join('')}

            <div class="fl for-present qr">
                <div data-qr></div>
                <div class="qr__scan"></div>
            </div>

            <div class="fl verdict">
                <div class="verdict__h">QPortal · verifier</div>
                <div class="verdict__v"><i>${ICON.tick}</i>Verified</div>
                <ul>
                    <li>Issuer signature <span>ML-DSA-44 ✓</span></li>
                    <li>Holder signature <span>ML-DSA-44 ✓</span></li>
                    <li>On-chain commitment <span>match ✓</span></li>
                    <li>Revocation <span>active ✓</span></li>
                </ul>
                <div class="verdict__f" data-seen>Saw 3 of 6 fields. Nothing else left the phone.</div>
            </div>

            ${LOG.map((l, i) => `
            <div class="fl for-log logrow" style="top:${172 + i * 60}px">
                <i class="${l[0]}">${l[1]}</i><div><b>${l[2]}</b><small>${l[3]}</small></div><time>${l[4]}</time>
            </div>`).join('')}
        </div>
    </div>`;

    /* ---------- helpers ---------- */
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const rad = d => d * Math.PI / 180;

    function mulberry(seed) {
        return function () {
            seed |= 0; seed = seed + 0x6D2B79F5 | 0;
            let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    /* A QR-shaped pattern. Deliberately not a decodable code. */
    function qrSvg(seed) {
        const n = 25, rnd = mulberry(seed);
        const finder = (x, y) => [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx - 1 && x < fx + 8 && y >= fy - 1 && y < fy + 8);
        let d = '';
        for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
            if (!finder(x, y) && rnd() > 0.52) d += `M${x} ${y}h1v1h-1z`;
        }
        const eye = (x, y) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
        d += eye(0, 0) + eye(n - 7, 0) + eye(0, n - 7);
        return `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><path fill="#111" fill-rule="evenodd" d="${d}"/></svg>`;
    }

    /* The rim: one flat face per straight edge, CORNER_STEPS faces per corner. */
    function buildRim(rim) {
        const segs = [];
        const add = (x, y, deg, len, extra) => {
            const el = document.createElement('i');
            el.className = 'ph-seg' + (extra ? ' ph-btn' : '');
            const depth = extra ? extra.depth : T;
            el.style.cssText = `width:${depth}px;height:${len + 0.8}px;margin:${-(len + 0.8) / 2}px 0 0 ${-depth / 2}px;` +
                `transform:translate3d(${x}px,${y}px,0) rotateZ(${deg}deg) rotateY(90deg)`;
            rim.appendChild(el);
            segs.push({ el, nx: Math.cos(rad(deg)), ny: Math.sin(rad(deg)), l: -1 });
        };

        const hw = W / 2, hh = H / 2;
        add(hw, 0, 0, H - 2 * R);
        add(0, hh, 90, W - 2 * R);
        add(-hw, 0, 180, H - 2 * R);
        add(0, -hh, 270, W - 2 * R);

        const step = 90 / CORNER_STEPS, len = 2 * R * Math.tan(rad(step / 2));
        [[hw - R, hh - R, 0], [-(hw - R), hh - R, 90], [-(hw - R), -(hh - R), 180], [hw - R, -(hh - R), 270]].forEach(([cx, cy, base]) => {
            for (let i = 0; i < CORNER_STEPS; i++) {
                const a = base + (i + 0.5) * step;
                add(cx + R * Math.cos(rad(a)), cy + R * Math.sin(rad(a)), a, len);
            }
        });

        /* hardware buttons, sitting just proud of the band */
        add(hw + 1.6, -70, 0, 76, { depth: 8 });
        add(-hw - 1.6, -150, 180, 24, { depth: 8 });
        add(-hw - 1.6, -98, 180, 44, { depth: 8 });
        add(-hw - 1.6, -44, 180, 44, { depth: 8 });
        return segs;
    }

    /* ---------- the phone ---------- */
    const LIGHT = (() => { const v = [-0.5, -0.72, 0.48], m = Math.hypot(...v); return v.map(c => c / m); })();
    const HALF = (() => { const v = [LIGHT[0], LIGHT[1], LIGHT[2] + 1], m = Math.hypot(...v); return v.map(c => c / m); })();

    class Phone {
        constructor(stage) {
            this.stage = stage;
            stage.insertAdjacentHTML('afterbegin', TEMPLATE);
            this.el = stage.querySelector('.phone');
            this.segs = buildRim(this.el.querySelector('.ph-rim'));
            this.name = stage.dataset.phone || 'hero';
            this.pose = SCENES[this.name] || SCENES.hero;

            this.rx = this.pose.rx; this.ry = this.pose.ry - (REDUCED ? 0 : 205);
            this.vx = 0; this.vy = 0;
            this.px = 0; this.py = 0;
            this.dragging = false; this.coast = false; this.moved = false;
            this.s = 1; this.litAt = [999, 999]; this.visible = false; this.raf = 0; this.last = 0;

            this.clock = QR_LIFE; this.seed = 7;
            this.qr = this.el.querySelector('[data-qr]');
            this.qr.innerHTML = qrSvg(this.seed);

            this.scene(this.name);
            this.fit();
            this.bind();
            this.render(0);
        }

        scene(name) {
            const sc = SCENES[name];
            if (!sc) return;
            this.name = name; this.pose = sc;
            if (this.el.dataset.screen !== sc.screen || this.el.dataset.fx !== sc.fx) {
                this.el.dataset.fx = '';
                void this.el.offsetWidth;            // restart fx animations
                this.el.dataset.screen = sc.screen;
                this.el.dataset.fx = sc.fx;
            }
            this.coast = false;
            this.stage.dataset.scene = name;
        }

        fit() {
            const r = this.stage.getBoundingClientRect();
            if (!r.width) return;
            this.s = clamp(Math.min((r.height * 0.8) / H, (r.width - 40) / (W + 70)), 0.42, 1.18);
            this.stage.style.setProperty('--s', this.s.toFixed(3));
        }

        bind() {
            const st = this.stage;
            let sx = 0, sy = 0, lx = 0, ly = 0, lt = 0;

            st.addEventListener('pointerdown', e => {
                if (e.button) return;
                sx = lx = e.clientX; sy = ly = e.clientY; lt = e.timeStamp;
                this.down = true; this.moved = false;
            });

            st.addEventListener('pointermove', e => {
                if (!this.down) return;
                const dx = e.clientX - lx, dy = e.clientY - ly, dt = Math.max(1, e.timeStamp - lt);
                if (!this.dragging) {
                    if (Math.hypot(e.clientX - sx, e.clientY - sy) < 6) return;
                    this.dragging = true; this.moved = true;
                    st.classList.add('is-dragging');
                    try { st.setPointerCapture(e.pointerId); } catch (_) {}
                }
                this.ry += dx * 0.45;
                this.rx = clamp(this.rx - dy * 0.3, -50, 50);
                this.vy = (dx * 0.45) / dt * 1000;
                this.vx = 0;
                lx = e.clientX; ly = e.clientY; lt = e.timeStamp;
            });

            const end = () => {
                if (!this.down) return;
                this.down = false;
                if (this.dragging) {
                    this.dragging = false; this.coast = true; this.releasedAt = performance.now();
                    this.vy = clamp(this.vy, -900, 900);
                    st.classList.remove('is-dragging');
                }
            };
            st.addEventListener('pointerup', end);
            st.addEventListener('pointercancel', end);
            st.addEventListener('lostpointercapture', end);

            /* selective disclosure is clickable */
            this.el.querySelectorAll('.field').forEach(f => f.addEventListener('click', () => {
                if (this.moved) return;
                f.classList.toggle('is-on');
                f.setAttribute('aria-checked', f.classList.contains('is-on'));
                this.count();
            }));

            if (!REDUCED && window.matchMedia('(hover: hover)').matches) {
                window.addEventListener('pointermove', e => {
                    this.px = (e.clientX / window.innerWidth - 0.5) * 2;
                    this.py = (e.clientY / window.innerHeight - 0.5) * 2;
                }, { passive: true });
            }

            new ResizeObserver(() => this.fit()).observe(st);

            new IntersectionObserver(([en]) => {
                this.visible = en.isIntersecting;
                if (this.visible && !this.raf) { this.last = 0; this.raf = requestAnimationFrame(t => this.tick(t)); }
            }, { rootMargin: '80px' }).observe(st);

            setInterval(() => {
                if (!this.visible || this.el.dataset.screen !== 'present') return;
                this.clock -= 1;
                if (this.clock < 0) { this.clock = QR_LIFE; this.qr.innerHTML = qrSvg(++this.seed); }
                const pad = n => String(n).padStart(2, '0');
                this.el.querySelector('[data-clock]').textContent = `${pad(Math.floor(this.clock / 60))}:${pad(this.clock % 60)}`;
                this.el.querySelector('[data-bar]').style.setProperty('--t', (this.clock / QR_LIFE).toFixed(3));
            }, 1000);
        }

        count() {
            const on = this.el.querySelectorAll('.field.is-on').length, all = FIELDS.length;
            this.el.querySelector('[data-cta]').textContent = on ? `Present ${on} of ${all} fields` : 'Pick at least one field';
            this.el.querySelector('[data-sub]').textContent = `${on} of ${all} fields`;
            this.el.querySelector('[data-seen]').textContent = `Saw ${on} of ${all} fields. Nothing else left the phone.`;
        }

        tick(t) {
            if (!this.visible) { this.raf = 0; return; }
            /* fixed 60 Hz substeps, so the motion is the same on a slow or throttled frame rate */
            let left = this.last ? Math.min(0.5, (t - this.last) / 1000) : 1 / 60;
            this.last = t;
            while (left > 0.0005) {
                const dt = Math.min(left, 1 / 60);
                left -= dt;
                this.step(t, dt);
            }
            this.render(t);
            this.raf = requestAnimationFrame(n => this.tick(n));
        }

        step(t, dt) {
            if (this.dragging) return;
            if (this.coast) {
                this.ry += this.vy * dt;
                this.vy *= Math.exp(-dt * 2.4);
                if (Math.abs(this.vy) < 30 && t - this.releasedAt > 700) this.coast = false;
                return;
            }
            const sway = REDUCED ? 0 : 1;
            const tx = this.pose.rx - this.py * 5 * sway + Math.sin(t * 0.0008) * 1.4 * sway;
            let ty = this.pose.ry + this.px * 9 * sway + Math.sin(t * 0.00055) * 3 * sway;
            ty += 360 * Math.round((this.ry - ty) / 360);          // never unwind more than half a turn
            const k = 34, c = 9.5;
            this.vx += ((tx - this.rx) * k - this.vx * c) * dt;
            this.vy += ((ty - this.ry) * k - this.vy * c) * dt;
            this.rx += this.vx * dt;
            this.ry += this.vy * dt;
        }

        render(t) {
            const bob = REDUCED ? 0 : Math.sin(t * 0.0011) * 5;
            const s = this.s;
            this.el.style.transform =
                `translate3d(0,${bob.toFixed(2)}px,0) scale3d(${s},${s},${s}) rotateX(${this.rx.toFixed(2)}deg) rotateY(${this.ry.toFixed(2)}deg)`;

            if (Math.abs(this.rx - this.litAt[0]) + Math.abs(this.ry - this.litAt[1]) < 0.2) return;
            this.litAt = [this.rx, this.ry];

            const cx = Math.cos(rad(this.rx)), sx = Math.sin(rad(this.rx));
            const cy = Math.cos(rad(this.ry)), sy = Math.sin(rad(this.ry));

            /* local normal (nx, ny, 0) → world, CSS axes (y down, z toward viewer) */
            for (const g of this.segs) {
                const x = g.nx * cy, z0 = -g.nx * sy;
                const y = g.ny * cx - z0 * sx, z = g.ny * sx + z0 * cx;
                if (z < -0.05) continue;                                   // facing away, culled anyway
                const diff = Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);
                const spec = Math.pow(Math.max(0, x * HALF[0] + y * HALF[1] + z * HALF[2]), 22);
                const l = Math.round(36 + diff * 34 + spec * 26);
                if (l !== g.l) { g.l = l; g.el.style.setProperty('--l', l + '%'); }
            }

            /* back plate normal is (0,0,-1) */
            const bx = sy, by = cy * sx, bz = -cy * cx;
            const back = Math.max(0, bx * LIGHT[0] + by * LIGHT[1] + bz * LIGHT[2]);
            this.el.style.setProperty('--bl', (0.78 + back * 0.42).toFixed(3));
            this.el.style.setProperty('--gx', clamp(50 - this.ry * 1.5 + this.rx, 0, 100).toFixed(1) + '%');
            this.stage.style.setProperty('--floor', (0.3 + 0.7 * Math.abs(cy)).toFixed(3));
        }
    }

    const instances = new WeakMap();
    const QPhone = {
        get(el) { return instances.get(el); },
        mount(el) { if (!instances.has(el)) instances.set(el, new Phone(el)); return instances.get(el); },
        scenes: SCENES
    };
    window.QPhone = QPhone;

    const boot = () => document.querySelectorAll('[data-phone]').forEach(QPhone.mount);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
