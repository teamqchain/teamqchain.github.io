/* ============================================================
   QChain — faceless team avatars
   Drawn after the real four: head shape, hair, beard, glasses and
   clothes, with no eyes or mouth. Heads turn toward the pointer
   and look around on their own when it rests.
   Mount with <span data-avatar="nihal"></span>
   (add data-crop="head" for the small round version).
   ============================================================ */

(() => {
    'use strict';

    const HAIR = '#1d1612', HAIR_LIT = '#34291f', STRAND = '#46382c';

    /* head: temples at y≈95, jaw corners near y≈128, chin at y=153 */
    const HEAD = 'M100 54 C120 54 134 70 134 94 C134 104 133 113 131 121 C129 131 124 139 117 145 C112 150 106 153 100 153 C94 153 88 150 83 145 C76 139 71 131 69 121 C67 113 66 104 66 94 C66 70 80 54 100 54Z';

    /* ---------- per person ---------- */
    const P = {
        nihal: {
            skin: ['#ad7450', '#8a5636'],
            /* short sides, a messy wavy top */
            hair: `
                <path d="M67 101 C64 92 63 82 64 74 C60 70 58 64 60 58 C62 60 64 60 66 58 C66 50 72 44 80 42 C84 36 92 34 98 37 C104 32 114 33 118 38 C124 36 132 40 133 48 C138 52 140 60 137 66 C138 76 136 90 133 101 L130.5 101 C130 94 129 89 127 85 C123 81 118 80 113 80 C108 80.5 104 79 100 79.5 C95 79 90 80.5 86 80 C80 80.5 75.5 82 72.5 85.5 C70.5 89 69.5 94 69 101Z"/>
                <path d="M72 62 C78 52 88 46 98 46 C104 42 112 42 118 46 M78 70 C86 60 96 56 106 58 C114 54 122 56 128 62 M84 76 C92 70 102 68 112 70 C118 68 124 70 128 74" fill="none" stroke="${STRAND}" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>`,
            /* stubble on the jaw and chin, a thin moustache */
            beard: {
                area: 'M58 110 C66 120 72 129 82 133 C90 136 110 136 118 133 C128 129 134 120 142 110 L142 176 L58 176Z',
                op: 0.42,
                tache: 0.5,
                chin: 0.22
            }
        },
        obeid: {
            skin: ['#d6a27c', '#b47f59'],
            /* thick waves swept back from a side part, falling behind the ears */
            back: 'M61 82 C55 92 54 104 57 114 C58 120 56 124 60 128 C64 126 66 130 70 127 C72 122 76 120 78 116 L122 116 C124 120 128 122 130 127 C134 130 136 126 140 128 C144 124 142 120 143 114 C146 104 145 92 139 82Z',
            hair: `
                <path d="M64 104 C60 98 57 90 59 82 C56 76 56 68 60 62 C60 52 66 44 76 42 C80 34 90 30 100 33 C108 28 120 30 126 36 C134 38 140 46 140 54 C144 60 145 70 141 78 C144 86 142 96 137 104 C135 96 132 90 127 86 C121 81 113 80 106 81 C100 82 95 84 92 89 C90 93 87 94 86 90 C84 85 78 85 74 88 C70 92 67 97 64 104Z"/>
                <path d="M78 78 C80 68 88 62 98 60 M118 77 C122 71 128 69 134 71 M104 44 C110 40 118 40 124 44" fill="none" stroke="#0e0a08" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>
                <path d="M72 84 C70 74 76 64 86 60 C94 57 98 50 108 48 M84 81 C86 71 96 66 106 64 C114 62 120 56 128 56 M100 80 C104 73 112 71 120 71 C128 71 132 65 136 60 M64 96 C62 86 64 78 70 72 M136 96 C139 88 138 80 134 74 M84 42 C90 46 98 46 104 41" fill="none" stroke="${STRAND}" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>
                <path d="M75 76 C76 69 81 64 88 62 M90 74 C93 69 99 67 105 67 M108 53 C114 51 119 48 123 47" fill="none" stroke="#6e5a49" stroke-width="1.4" stroke-linecap="round" opacity=".45"/>`,
            /* a thin moustache and a little on the chin */
            beard: {
                area: 'M58 116 C66 126 74 134 84 137 C92 139 108 139 116 137 C126 134 134 126 142 116 L142 176 L58 176Z',
                op: 0.2,
                tache: 0.38,
                chin: 0.18
            }
        },
        haris: {
            skin: ['#ad7652', '#8a5839'],
            /* wavy, swept up and back */
            hair: `
                <path d="M64 106 C59 82 62 55 80 43 C94 34 118 33 131 45 C141 55 142 80 136 106 C134 95 131 87 126 82 C116 84 102 82 92 77 C84 80 74 89 64 106Z"/>
                <path d="M77 54 C88 41 106 37 121 42 M81 63 C93 51 110 48 126 55 M89 71 C100 62 115 61 128 67 M70 80 C74 70 80 64 88 60" fill="none" stroke="${STRAND}" stroke-width="2" stroke-linecap="round"/>`,
            /* goatee, thin moustache, light stubble on the jaw */
            beard: {
                area: 'M58 112 C68 124 78 136 90 140 C96 142 104 142 110 140 C122 136 132 124 142 112 L142 176 L58 176Z',
                op: 0.32,
                tache: 0.95,
                chin: 0.95
            }
        },
        maqqavi: {
            skin: ['#bb8565', '#976347'],
            /* short and neat */
            hair: `
                <path d="M65 104 C61 80 70 58 92 51 C110 46 128 54 134 70 C138 82 137 94 135 104 C133 94 129 88 122 84 C110 80 90 80 79 85 C72 89 68 95 65 104Z"/>
                <path d="M78 62 C90 53 108 51 124 58 M82 72 C94 65 110 64 126 69" fill="none" stroke="${STRAND}" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>`,
            /* full beard that grows past the chin */
            beard: {
                area: 'M58 98 C64 108 72 118 84 123 C92 126 108 126 116 123 C128 118 136 108 142 98 L142 176 L58 176Z',
                below: 'M72 136 C78 158 90 170 100 171 C110 170 122 158 128 136Z',
                op: 0.96,
                tache: 1,
                gap: true
            }
        }
    };

    const GLASSES = {
        haris: `
            <g fill="rgba(255,255,255,.06)" stroke="#0c0c0d" stroke-width="3.4" stroke-linejoin="round">
                <rect x="71" y="97" width="25" height="16" rx="4.5"/><rect x="104" y="97" width="25" height="16" rx="4.5"/>
            </g>
            <path d="M96 103 Q100 100 104 103 M71 102 L66 100 M129 102 L134 100" fill="none" stroke="#0c0c0d" stroke-width="3"/>`,
        maqqavi: `
            <g fill="rgba(255,255,255,.1)" stroke="#a3a8ae" stroke-width="1.7">
                <rect x="70" y="96" width="26" height="17" rx="7"/><rect x="104" y="96" width="26" height="17" rx="7"/>
            </g>
            <path d="M96 102 Q100 99 104 102 M70 102 L66 101 M130 102 L134 101" fill="none" stroke="#a3a8ae" stroke-width="1.6"/>`
    };

    const LANYARD = `<path d="M84 173 C86 200 92 222 96 240 M116 173 C114 200 108 222 104 240" fill="none" stroke="#111" stroke-width="4.5" stroke-linecap="round"/>`;
    const TORSO = 'M20 240 C22 202 42 182 78 172 Q100 182 122 172 C158 182 178 202 180 240Z';

    const CLOTHES = {
        /* black polo */
        nihal: `
            <path d="${TORSO}" fill="#1c1c1f"/>
            <path d="M78 172 L100 196 L93 204 L71 179Z M122 172 L100 196 L107 204 L129 179Z" fill="#2b2b30"/>
            <path d="M100 197 V227" stroke="#2f2f34" stroke-width="2"/>
            <circle cx="100" cy="208" r="1.6" fill="#3a3a40"/><circle cx="100" cy="218" r="1.6" fill="#3a3a40"/>
            ${LANYARD}`,
        /* cream shirt over a white tee, open collar */
        obeid: `
            <path d="${TORSO}" fill="#efe3c9"/>
            <path d="M88 171 L100 199 L112 171Z" fill="var(--skin-2)"/>
            <path d="M91 178 C95 184 105 184 109 178 L104 194 L96 194Z" fill="#fbf8f1"/>
            <path d="M80 170 L99 197 L89 204 L73 177Z M120 170 L101 197 L111 204 L127 177Z" fill="#f6eedb" stroke="#d6c8aa" stroke-width="1.2"/>
            <path d="M100 201 V240" stroke="#ddd0b4" stroke-width="1.5"/>
            ${LANYARD}`,
        /* grey blazer over a black shirt */
        haris: `
            <path d="${TORSO}" fill="#18181a"/>
            <path d="M20 240 C22 202 42 182 78 172 L94 207 L97 240Z M180 240 C178 202 158 182 122 172 L106 207 L103 240Z" fill="#6c6e73"/>
            <path d="M78 172 L94 207 L83 197 L86 187Z M122 172 L106 207 L117 197 L114 187Z" fill="#595b60"/>
            <path d="M86 170 L100 189 L114 170" fill="none" stroke="#2a2a2e" stroke-width="3"/>
            <rect x="113" y="201" width="7" height="7" rx="1" fill="#8c8e93"/>
            ${LANYARD}`,
        /* light blue shirt */
        maqqavi: `
            <path d="${TORSO}" fill="#a9c3e3"/>
            <path d="M88 171 L100 195 L112 171Z" fill="var(--skin-2)"/>
            <path d="M79 170 L99 196 L90 204 L72 177Z M121 170 L101 196 L110 204 L128 177Z" fill="#bdd2ee" stroke="#8ea9cc" stroke-width="1.1"/>
            <path d="M100 199 V240" stroke="#8ea9cc" stroke-width="1.4"/>
            <circle cx="100" cy="211" r="1.6" fill="#eef3fa"/><circle cx="100" cy="225" r="1.6" fill="#eef3fa"/>
            ${LANYARD}`
    };

    function beardSvg(b, s2, id) {
        if (!b) return '';
        const tache = b.tache ? `<path d="M86 127 C92 123 108 123 114 127 C109 128.4 105 127.8 100 128.3 C95 127.8 91 128.4 86 127Z" opacity="${b.tache}"/>` : '';
        const chin = b.chin ? `<path d="M86 137 C93 142 107 142 114 137 C114 147 108 154 100 155 C92 154 86 147 86 137Z" opacity="${b.chin}"/>` : '';
        const gap = b.gap ? `<path d="M91 132 C96 134 104 134 109 132 C105 135.5 95 135.5 91 132Z" fill="${s2}"/>` : '';
        return `
            <g fill="${HAIR}" filter="url(#${id}-soft)">
                <path d="${b.area}" opacity="${b.op}"/>
                ${b.below ? `<path d="${b.below}" opacity="${b.op}"/>` : ''}
                ${tache}${chin}${gap}
            </g>`;
    }

    let uid = 0;
    function svg(who, crop) {
        const p = P[who], [s1, s2] = p.skin, id = `av${++uid}`;
        const view = crop ? '32 26 136 136' : '0 0 200 240';
        const clipExtra = p.beard && p.beard.below ? `<path d="${p.beard.below}"/>` : '';
        return `<svg viewBox="${view}" aria-hidden="true" focusable="false" style="--skin:${s1};--skin-2:${s2}">
            <defs>
                <linearGradient id="${id}-sk" x1="0" y1="0" x2="1" y2="0.35">
                    <stop offset="0" stop-color="${s1}"/><stop offset=".55" stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/>
                </linearGradient>
                <linearGradient id="${id}-hr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="${HAIR_LIT}"/><stop offset=".5" stop-color="${HAIR}"/>
                </linearGradient>
                <radialGradient id="${id}-lt" cx=".36" cy=".42" r=".5">
                    <stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
                </radialGradient>
                <clipPath id="${id}-cl"><path d="${HEAD}"/>${clipExtra}</clipPath>
                <filter id="${id}-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation=".7"/></filter>
                <filter id="${id}-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
            </defs>
            <g class="av-body">
                <path d="M84 134 L84 168 Q100 179 116 168 L116 134Z" fill="${s2}"/>
                ${CLOTHES[who]}
            </g>
            <g class="av-head">
                <path d="M78 140 C86 152 94 156 100 156 C106 156 114 152 122 140 L122 158 C114 166 86 166 78 158Z" fill="#000" opacity=".22" filter="url(#${id}-blur)" class="av-jaw"/>
                ${p.back ? `<path class="av-hair" d="${p.back}" fill="${HAIR}"/>` : ''}
                <g class="av-ears" fill="${s2}">
                    <ellipse cx="67" cy="108" rx="6.5" ry="11"/><ellipse cx="133" cy="108" rx="6.5" ry="11"/>
                    <path d="M66 102 C63 106 64 112 67 115 M134 102 C137 106 136 112 133 115" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1.6" stroke-linecap="round"/>
                </g>
                <path d="${HEAD}" fill="url(#${id}-sk)"/>
                <g clip-path="url(#${id}-cl)">
                    <path d="${HEAD}" fill="url(#${id}-lt)"/>
                    <g transform="translate(0 3.5)" opacity=".28" filter="url(#${id}-blur)"><g class="av-hair" fill="#000">${P[who].hair}</g></g>
                    <g fill="${s2}" opacity=".55" filter="url(#${id}-blur)">
                        <ellipse cx="70" cy="124" rx="7" ry="16"/><ellipse cx="130" cy="124" rx="9" ry="18"/>
                    </g>
                    <g class="av-face">
                        ${beardSvg(p.beard, s2, id)}
                    </g>
                </g>
                <g class="av-face">
                    ${GLASSES[who] || ''}
                    ${GLASSES[who] ? '<path class="av-glint" d="M76 112 L86 98 M110 112 L120 98" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>' : ''}
                </g>
                <g class="av-hair" fill="url(#${id}-hr)">${P[who].hair}</g>
            </g>
        </svg>`;
    }

    /* ---------- motion ---------- */
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const live = [];
    let px = null, py = null, lastMove = 0;

    function mount(el, i) {
        const who = el.dataset.avatar;
        if (!P[who]) return;
        el.innerHTML = svg(who, el.dataset.crop === 'head');
        el.classList.add('av');
        live.push({ el, x: 0, y: 0, phase: i * 1.7 + (who.length % 3), seen: true });
    }

    function frame(t) {
        const s = t / 1000;
        const idle = px === null || t - lastMove > 2600;
        for (const a of live) {
            if (!a.seen) continue;
            let tx, ty;
            if (idle) {
                tx = Math.sin(s * 0.45 + a.phase) * 0.55 + Math.sin(s * 0.21 + a.phase * 2) * 0.25;
                ty = Math.sin(s * 0.33 + a.phase * 1.3) * 0.3;
            } else {
                const r = a.el.getBoundingClientRect();
                const cx = r.left + r.width / 2, cy = r.top + r.height * 0.4;
                tx = Math.max(-1, Math.min(1, (px - cx) / 420));
                ty = Math.max(-1, Math.min(1, (py - cy) / 320));
            }
            a.x += (tx - a.x) * 0.08;
            a.y += (ty - a.y) * 0.08;
            const st = a.el.style;
            st.setProperty('--x', a.x.toFixed(3));
            st.setProperty('--y', a.y.toFixed(3));
            st.setProperty('--b', Math.sin(s * 1.6 + a.phase).toFixed(3));
        }
        requestAnimationFrame(frame);
    }

    function init() {
        document.querySelectorAll('[data-avatar]').forEach(mount);
        if (!live.length || REDUCED) return;

        window.addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse') return;
            px = e.clientX; py = e.clientY; lastMove = performance.now();
        }, { passive: true });

        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver(es => es.forEach(e => {
                const a = live.find(l => l.el === e.target);
                if (a) a.seen = e.isIntersecting;
            }));
            live.forEach(a => io.observe(a.el));
        }
        requestAnimationFrame(frame);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
