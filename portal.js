/* ============================================================
   QChain — the interactive QPortal
   An HTML recreation of the real console (qportal.vercel.app)
   with a click-through tour: one job per role. Everything here
   is sample data; nothing talks to a server.

   Usage:  <div class="portal" data-portal></div>
   ============================================================ */
(function () {
    'use strict';

    const ic = (d, fill) => `<svg viewBox="0 0 16 16" ${fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'} aria-hidden="true">${d}</svg>`;
    const I = {
        grid: ic('<rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>', true),
        doc: ic('<path d="M4 2h5l3 3v9H4z"/><path d="M9 2v3h3"/>'),
        stack: ic('<rect x="2" y="5" width="9" height="9" rx="1.500"/><path d="M5 2h9v9"/>'),
        list: ic('<path d="M5 4h9M5 8h9M5 12h9M2 4h.01M2 8h.01M2 12h.01"/>'),
        ban: ic('<circle cx="8" cy="8" r="6"/><path d="m4 4 8 8"/>'),
        branch: ic('<circle cx="4" cy="3.500" r="1.500"/><circle cx="4" cy="12.500" r="1.500"/><circle cx="12" cy="8" r="1.500"/><path d="M4 5v6M4 8h6.500"/>'),
        qr: ic('<path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/><rect x="5.500" y="5.500" width="5" height="5" rx=".5"/>'),
        key: ic('<rect x="2" y="4" width="12" height="8" rx="1.500"/><path d="M5 8h.01M8 8h.01M11 8h.01"/>'),
        clock: ic('<circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.500"/>'),
        shield: ic('<path d="M8 2 3 4v4c0 3 2 5 5 6 3-1 5-3 5-6V4z"/>'),
        user: ic('<circle cx="8" cy="5.500" r="2.500"/><path d="M3 14c.5-3 2.500-4 5-4s4.500 1 5 4"/>'),
        users: ic('<circle cx="6" cy="6" r="2.200"/><path d="M2 13c.4-2.400 1.900-3.300 4-3.300s3.600.9 4 3.300M10.500 4a2.200 2.200 0 0 1 0 4.300M11.500 9.800c1.500.3 2.300 1.300 2.500 3.200"/>'),
        log: ic('<rect x="3" y="2" width="10" height="12" rx="1.500"/><path d="M6 6h4M6 9h4M6 12h2"/>'),
        lock: ic('<rect x="3.500" y="7" width="9" height="7" rx="1.500"/><path d="M5.500 7V5a2.500 2.500 0 0 1 5 0v2"/>'),
        bell: ic('<path d="M4 11V7a4 4 0 0 1 8 0v4l1.500 1.500h-11zM6.500 14h3"/>'),
        check: ic('<path d="m3.500 8.500 3 3 6-7"/>'),
        plus: ic('<path d="M8 3v10M3 8h10"/>'),
        arrow: ic('<path d="M3 8h10M9 4l4 4-4 4"/>'),
        warn: ic('<path d="M8 2 1.500 13.500h13zM8 6.500v3.500M8 12h.01"/>'),
        tap: ic('<path d="M6 8V3.500a1.200 1.200 0 0 1 2.400 0V7l3.300.7c.8.2 1.300.9 1.200 1.700l-.5 3.100c-.1.900-.9 1.500-1.800 1.500H8.200c-.6 0-1.200-.3-1.500-.8L4 9.500c-.4-.6.4-1.400 1-1z"/>')
    };

    /* ---------- who sees what ---------- */
    const ROLES = {
        issuer: {
            label: 'Issuer', tag: 'ISSUER', group: 'Issuing', job: 'Issue a degree',
            nav: [['dash', 'Dashboard', 'grid'], ['issue', 'Issue Credential', 'doc'], ['batch', 'Batch Issue', 'stack'], ['creds', 'All Credentials', 'list'], ['revoke', 'Revoke / Suspend', 'ban'], ['schemas', 'Schemas', 'branch']]
        },
        verifier: {
            label: 'Verifier', tag: 'VERIFIER', group: 'Verifying', job: 'Check a credential',
            nav: [['dash', 'Dashboard', 'grid'], ['scan', 'Scan QR Code', 'qr'], ['manual', 'Manual Verify', 'key'], ['', 'Batch Verify', 'users'], ['history', 'Verification History', 'clock'], ['', 'Subscriptions', 'stack'], ['', 'Subscription Alerts', 'bell'], ['policies', 'Policies', 'shield']]
        },
        admin: {
            label: 'IT admin', tag: 'IT ADMIN', group: 'Managing', job: 'Run the organisation',
            nav: [['dash', 'Dashboard', 'grid'], ['', 'Manage Profile', 'user'], ['staff', 'Staff & Permissions', 'users'], ['audit', 'Audit Log', 'log'], ['crypto', 'Crypto Settings', 'lock'], ['', 'Request Capabilities', 'plus']]
        }
    };
    const ORDER = ['issuer', 'verifier', 'admin'];
    const NAV_OF = { issue1: 'issue', issue2: 'issue', issue3: 'issue', issue4: 'issue', issue5: 'issue', record: 'manual' };

    /* ---------- the tours: one click per step ---------- */
    const TOURS = {
        issuer: [
            { view: 'dash', target: 'qa-issue', title: 'A registrar signs in.', text: 'This is the issuer&rsquo;s dashboard. Click <b>Issue Single Credential</b> to start.' },
            { view: 'issue1', target: 'type', title: 'Pick what you are issuing.', text: 'Every credential type is a schema: the fields it must carry. Choose <b>Bachelors Degree</b>.' },
            { view: 'issue1', st: { type: 1 }, target: 'next', title: 'Five fields, all required.', text: 'The schema decides what gets signed. Click <b>Next</b>.' },
            { view: 'issue2', st: { type: 1 }, target: 'holder', title: 'Find the graduate.', text: 'Holders are looked up by name or Emirates ID. <b>Select</b> Tariq Al Nuaimi.' },
            { view: 'issue3', st: { type: 1, holder: 1 }, target: 'next', title: 'Fill in the fields.', text: 'These five values are the credential. Each one will get its own salt and hash. <b>Next</b>.' },
            { view: 'issue4', st: { type: 1, holder: 1 }, target: 'sign', title: 'Look before you sign.', text: 'Only the hashes go on the ledger. The readable copy is encrypted for the holder. Click <b>Sign &amp; Issue</b>.' },
            { view: 'issue5', st: { type: 1, holder: 1 }, target: 'view', title: 'Signed, encrypted, anchored.', text: 'Five things just happened, in order. Open <b>All Credentials</b> to see the result.' },
            { view: 'creds', st: { issued: 1 }, target: '', title: 'It is live.', text: 'CRED-0003 is valid and Tariq&rsquo;s wallet has it. Next, see what a verifier does with it.' }
        ],
        verifier: [
            { view: 'dash', target: 'qa-manual', title: 'An employer signs in.', text: 'Verifiers can scan the wallet&rsquo;s QR or type the one-time code it shows. Click <b>Manual Verify</b>.' },
            { view: 'manual', target: 'otp', title: 'Ask for the code.', text: 'The holder generates a 6-digit code in QWallet. Click the field to enter it.' },
            { view: 'manual', st: { otp: 1 }, target: 'verify', title: 'One code, one use.', text: 'It expires after 120 seconds. Click <b>Verify</b>.' },
            { view: 'record', st: { otp: 1 }, target: 'nav-history', title: 'Five checks, none of them a database lookup.', text: 'Both signatures, the field hashes and revocation are checked against the ledger. Now open <b>Verification History</b>.' },
            { view: 'history', target: '', title: 'Every answer is kept.', text: 'Valid, revoked, expired, suspended, tampered: the record shows which. Last stop, the IT admin.' }
        ],
        admin: [
            { view: 'dash', target: 'nav-staff', title: 'IT admins do not issue or verify.', text: 'They decide who can. Open <b>Staff &amp; Permissions</b>.' },
            { view: 'staff', target: 'nav-audit', title: 'One role per person.', text: 'Issuer and verifier staff are invited separately, each with a role. Open the <b>Audit Log</b>.' },
            { view: 'audit', target: 'nav-crypto', title: 'Who did what, and when.', text: 'Every issuance, revocation and staff change is listed and cannot be edited here. Open <b>Crypto Settings</b>.' },
            { view: 'crypto', target: '', title: 'The algorithm is a setting.', text: 'Signatures use Dilithium (ML-DSA) today. If the standard moves, the organisation can move with it.' }
        ]
    };

    /* shown when the viewer leaves the tour and clicks around */
    const BLURB = {
        issuer: { dash: 'The issuer&rsquo;s home: today&rsquo;s numbers and shortcuts.', issue1: 'The five-step wizard for one credential.', batch: 'The same wizard for a whole CSV of graduates.', creds: 'Everything this organisation has issued.', revoke: 'Revoke, suspend or restore. Each change is written on-chain.', schemas: 'The credential types this organisation can issue.' },
        verifier: { dash: 'The verifier&rsquo;s home: recent checks and shortcuts.', scan: 'Point a camera at the wallet&rsquo;s QR code.', manual: 'Type the one-time code from the wallet instead.', record: 'A single verification, with every check listed.', history: 'Every verification this organisation has run.', policies: 'Rules a credential must pass, beyond a valid signature.' },
        admin: { dash: 'The admin&rsquo;s home: staff, requests and the active algorithm.', staff: 'Who works here and what they may do.', audit: 'Every action taken in the portal.', crypto: 'The signature scheme and the organisation&rsquo;s public key.' }
    };

    /* ---------- little builders ---------- */
    const chip = (t, k) => `<span class="qp-chip qp-chip--${k}">${t}</span>`;
    const tiles = arr => `<div class="qp-tiles">${arr.map(([n, l, k]) => `<div class="qp-tile qp-tile--${k}"><b>${n}</b><span>${l}</span></div>`).join('')}</div>`;
    const panel = (title, body, cls = '') => `<section class="qp-panel ${cls}"><h5>${title}</h5>${body}</section>`;
    const table = (heads, rows, cls = '') => `<div class="qp-tblw"><table class="qp-tbl ${cls}"><thead><tr>${heads.map(h => `<th${h[1] ? ' class="x"' : ''}>${h[0]}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
    const tr = (cells, heads, cls = '') => `<tr class="${cls}">${cells.map((c, i) => `<td${heads[i][1] ? ' class="x"' : ''}>${c}</td>`).join('')}</tr>`;
    const bars = vals => `<div class="qp-bars">${vals.map(([d, v]) => `<div><i style="height:${Math.max(4, v * 22)}%"></i><span>${d}</span></div>`).join('')}</div>`;
    const stepper = (labels, n) => `<ol class="qp-steps">${labels.map((l, i) => `<li class="${i + 1 === n ? 'is-on' : i + 1 < n ? 'is-done' : ''}"><i>${i + 1 < n ? I.check : i + 1}</i><span>${l}</span></li>`).join('')}</ol>`;
    const SINGLE = ['Select Credential Type', 'Find Holder', 'Fill Credential Details', 'Credential Preview', 'Confirm &amp; Issue'];
    const BATCH = ['Select Credential Type', 'Upload File', 'Validate &amp; Preview', 'Issue All', 'Result'];
    const TYPES = ['Bachelors Degree', 'Masters Degree', 'PhD Degree', 'Diploma', 'Higher Training Certificate', 'Research Fellowship'];
    const FIELDS = [['College', 'Computing and Informatics', '4be1…a09c'], ['Degree Title', 'BSc Computer Science', '71d0…f3e2'], ['Student ID', 'STU-2025-0291', 'c5a8…1d47'], ['Grade', 'Excellent', '9f2c…41e7'], ['Graduation Year', '2025', 'e77a…5b10']];

    const typeList = (st, withTarget) => `
        <div class="qp-split">
            <div class="qp-pick">
                <h6>Credential types</h6>
                ${TYPES.map((t, i) => `<button type="button" class="qp-row${st.type && i === 0 ? ' is-sel' : ''}"${i === 0 && withTarget ? ' data-t="type"' : ''}>${I.doc}<span><b>${t}</b><small>Academic</small></span>${st.type && i === 0 ? I.check : ''}</button>`).join('')}
            </div>
            <div class="qp-detail">${st.type ? `
                <div class="qp-dhead"><i>${I.doc}</i><span><b>Bachelors Degree</b><small>Academic</small></span></div>
                <p>Bachelor of Science academic degree awarded upon successful completion of an undergraduate programme.</p>
                <h6>What is required</h6>
                <ul><li>All required credit hours completed</li><li>Minimum CGPA of 2.0</li><li>Official graduation year</li></ul>
                <h6>Credential fields</h6>
                <ul class="qp-req">${FIELDS.map(f => `<li>${f[0]} <em>*</em></li>`).join('')}</ul>` : `<div class="qp-empty">${I.tap}<span>Select a credential type<br>to see details</span></div>`}
            </div>
        </div>`;

    const CRED_H = [['Credential ID'], ['Holder name'], ['Credential type', 1], ['Issued by', 1], ['Issue date', 1], ['Status']];
    const credRows = st => [
        ...(st.issued ? [tr(['<b class="qp-id">CRED-0003</b>', '<b>Tariq Al Nuaimi</b>', 'BSc Computer Science', 'Mohammed Al Issuer', 'Today', chip('Valid', 'ok')], CRED_H, 'is-new')] : []),
        tr(['<b class="qp-id">CRED-0002</b>', '<b>Khalid Hassan</b>', 'MSc Computer Science', 'Mohammed Al Issuer', '10 Nov 2026', chip('Valid', 'ok')], CRED_H),
        tr(['<b class="qp-id">CRED-0001</b>', '<b>Tariq Al Nuaimi</b>', 'BSc Computer Engineering', 'Mohammed Al Issuer', '10 Nov 2026', chip('Revoked', 'bad')], CRED_H)
    ];

    /* ---------- screens ---------- */
    const VIEWS = {
        issuer: {
            dash: () => `
                <h4>Dashboard</h4>
                ${tiles([[0, 'Issued Today', 'a'], [0, 'Alerts Unread', 'warn'], [0, 'Expiring Soon', 'bad']])}
                ${panel('Quick actions', `<div class="qp-qa">
                    <button type="button" class="qp-btn qp-btn--line" data-t="qa-issue" data-go="issue1">${I.user} Issue Single Credential</button>
                    <button type="button" class="qp-btn qp-btn--line" data-go="batch">${I.users} Issue Batch</button>
                    <button type="button" class="qp-btn qp-btn--line" data-go="schemas">${I.branch} Manage Schemas</button></div>`, 'qp-panel--tint')}
                <div class="qp-two">
                    ${panel('Recent issuing activity', `<ul class="qp-feed">
                        <li>Bachelor of Science in Computer Science restored — Tariq Al Nuaimi<time>10 Nov</time></li>
                        <li>Bachelor of Science in Computer Science suspended — Tariq Al Nuaimi<time>10 Nov</time></li>
                        <li>Bachelor of Science in Computer Science issued to Tariq Al Nuaimi<time>10 Nov</time></li>
                        <li>BSc Computer Science revoked — Tariq Al Nuaimi<time>10 Nov</time></li></ul>`)}
                    ${panel('Credentials issued — last 7 days', bars([['Mon', 0], ['Tue', 2], ['Wed', 0], ['Thu', 0], ['Fri', 0], ['Sat', 0], ['Sun', 0]]))}
                </div>`,
            issue1: st => `<h4>Issue Single Credential</h4>${stepper(SINGLE, 1)}${typeList(st, true)}
                <div class="qp-foot"><button type="button" class="qp-btn qp-btn--bad" data-go="dash">Cancel</button><button type="button" class="qp-btn" data-t="next">Next ${I.arrow}</button></div>`,
            issue2: st => `<h4>Issue Single Credential</h4>${stepper(SINGLE, 2)}
                ${(h => table(h, [
                    tr(['<span class="qp-av">KH</span><b>Khalid Hassan</b>', 'Bachelor Student', 'CEN', '784-1998-•••••••-3', '<button type="button" class="qp-btn qp-btn--ghost qp-btn--xs">Select</button>'], h),
                    tr(['<span class="qp-av">TN</span><b>Tariq Al Nuaimi</b>', 'Bachelor Student', 'CCI', '784-1990-•••••••-1', `<button type="button" class="qp-btn qp-btn--ghost qp-btn--xs" data-t="holder">${st.holder ? 'Selected' : 'Select'}</button>`], h, st.holder ? 'is-new' : '')
                ]))([['Name'], ['Type', 1], ['College', 1], ['EID', 1], ['']])}
                <div class="qp-foot"><button type="button" class="qp-btn qp-btn--ghost" data-guide="back">Back</button></div>`,
            issue3: () => `<h4>Issue Single Credential</h4>${stepper(SINGLE, 3)}
                <div class="qp-holder"><span class="qp-av">TN</span><span><b>Tariq Al Nuaimi</b><small>784-1990-•••••••-1 · Bachelor Student</small></span>${chip('Bachelors Degree', 'a')}</div>
                <div class="qp-form">${FIELDS.map(f => `<label><span>${f[0]} <em>*</em></span><output>${f[1]}</output></label>`).join('')}</div>
                <div class="qp-foot"><button type="button" class="qp-btn qp-btn--ghost" data-guide="back">Back</button><button type="button" class="qp-btn" data-t="next">Next ${I.arrow}</button></div>`,
            issue4: () => `<h4>Issue Single Credential</h4>${stepper(SINGLE, 4)}
                <div class="qp-two qp-two--pre">
                    <div class="qp-cred"><small>University of Sharjah</small><b>BSc Computer Science</b><span>Tariq Al Nuaimi</span><em>Bachelors Degree · 2025</em></div>
                    ${(h => table(h, FIELDS.map(f => tr([f[0], `<b>${f[1]}</b>`, `<code>sha3 ${f[2]}</code>`], h))))([['Field'], ['Value'], ['On-chain', 0]])}
                </div>
                <p class="qp-note">${I.lock} The ledger stores the five hashes and one signature. The values stay off-chain, encrypted to the holder&rsquo;s key.</p>
                <div class="qp-foot"><button type="button" class="qp-btn qp-btn--ghost" data-guide="back">Back</button><button type="button" class="qp-btn" data-t="sign">${I.shield} Sign &amp; Issue</button></div>`,
            issue5: () => `<h4>Issue Single Credential</h4>${stepper(SINGLE, 5)}
                <ol class="qp-pipe">
                    <li><i>${I.check}</i><b>Hash each field with its own salt</b><span>SHA3-256 × 5</span></li>
                    <li><i>${I.check}</i><b>Sign the commitment</b><span>ML-DSA-44 · 2,420 bytes</span></li>
                    <li><i>${I.check}</i><b>Encrypt the credential for the holder</b><span>ML-KEM-768 + AES-256-GCM</span></li>
                    <li><i>${I.check}</i><b>Store the ciphertext</b><span>IPFS</span></li>
                    <li><i>${I.check}</i><b>Write the commitment to the ledger</b><span>Hyperledger Fabric</span></li>
                </ol>
                <div class="qp-done"><i>${I.check}</i><span><b>CRED-0003 issued to Tariq Al Nuaimi</b><small>The holder&rsquo;s wallet has been notified.</small></span>
                    <button type="button" class="qp-btn" data-t="view">View in All Credentials ${I.arrow}</button></div>`,
            batch: st => `<h4>Issue Batch Credential</h4>${stepper(BATCH, 1)}${typeList(st, false)}`,
            creds: st => `<h4>All Credentials</h4>${table(CRED_H, credRows(st))}`,
            revoke: st => `<h4>Revoke / Suspend Management</h4>${table(CRED_H, credRows(st))}
                <div class="qp-foot qp-foot--c"><span class="qp-btn qp-btn--bad is-off">${I.ban} Revoke</span><span class="qp-btn qp-btn--warn is-off">Suspend</span><span class="qp-btn qp-btn--ghost is-off">Restore</span></div>`,
            schemas: () => `<h4>Schemas</h4>${(h => table(h, [['Bachelors Degree', 248], ['Masters Degree', 87], ['PhD Degree', 34], ['Diploma', 112], ['Higher Training Certificate', 203], ['Research Fellowship', 19]]
                .map(s => tr([`<b>${s[0]}</b>`, '<span class="qp-a">Academic</span>', `${s[1]} issued`, chip('Active', 'ok')], h))
                .concat(tr(['<b>Employee ID</b>', 'Corporate', '0 issued', chip('Archived', 'mute')], h, 'is-dim'))))([['Schema'], ['Category', 1], ['Issued', 1], ['Status']])}`
        },

        verifier: {
            dash: () => `
                <h4>Dashboard</h4>
                ${tiles([[0, 'Verified Today', 'a'], [0, 'Alerts Unread', 'warn'], [0, 'Expiring Soon', 'bad']])}
                ${panel('Quick actions', `<div class="qp-qa">
                    <button type="button" class="qp-btn qp-btn--line" data-go="scan">${I.qr} Scan QR Code</button>
                    <button type="button" class="qp-btn qp-btn--line" data-t="qa-manual" data-go="manual">${I.key} Manual Verify</button>
                    <span class="qp-btn qp-btn--line is-off">${I.users} Batch Verify</span></div>`, 'qp-panel--tint')}
                <div class="qp-two">
                    ${panel('Recent verifications', `<ul class="qp-feed">
                        <li>Tariq Al Nuaimi — BSc Computer Science${chip('Revoked', 'bad')}</li>
                        <li>Tariq Al Nuaimi — BSc Computer Science${chip('Valid', 'ok')}</li>
                        <li>Tariq Al Nuaimi — BSc Computer Science${chip('Expired', 'mute')}</li>
                        <li>Tariq Al Nuaimi — BSc Computer Science${chip('Suspended', 'warn')}</li></ul>`)}
                    ${panel('Verifications — last 7 days', bars([['Mon', 0], ['Tue', 4], ['Wed', 0], ['Thu', 0], ['Fri', 0], ['Sat', 0], ['Sun', 0]]))}
                </div>`,
            scan: () => `<h4>Scan to Validate</h4><div class="qp-scan"><div><i></i>${I.qr}</div><span>Align the QR code within the frame</span></div>`,
            manual: st => `<h4>Manual Verify</h4>
                <div class="qp-seg"><span class="is-on">${I.key} OTP</span><span>${I.doc} Upload Document</span></div>
                <div class="qp-form qp-form--1"><label><span>Enter OTP <em>*</em></span>
                    <button type="button" class="qp-otp${st.otp ? ' is-set' : ''}" data-t="otp">${st.otp ? '4 8 2 &nbsp; 9 1 3' : 'Enter 6-digit OTP'}</button></label></div>
                ${panel('How the holder gets a code', '<ol class="qp-how"><li>Open the QWallet app</li><li>Open the credential and tap Details</li><li>Tap Generate OTP</li></ol>', 'qp-panel--tint')}
                <div class="qp-foot"><button type="button" class="qp-btn qp-btn--ghost" data-go="dash">Back</button><button type="button" class="qp-btn${st.otp ? '' : ' is-off'}" data-t="verify">${I.check} Verify</button></div>`,
            record: () => `<h4>Verification Record</h4>
                <div class="qp-valid"><i>${I.check}</i><span><b>Credential valid</b><small>The blockchain record indicates this credential is fully valid and unmodified.</small></span></div>
                <div class="qp-two">
                    ${panel('Credential details', `<dl class="qp-dl"><div><dt>Credential ID</dt><dd>CRED-0003</dd></div><div><dt>Type</dt><dd>BSc Computer Science</dd></div><div><dt>Issuer org</dt><dd>University of Sharjah</dd></div><div><dt>Holder</dt><dd>Tariq Al Nuaimi</dd></div><div><dt>Method</dt><dd>Manual · OTP</dd></div></dl>`)}
                    ${panel('System &amp; policy checks', `<ul class="qp-checks">
                        <li>${I.check} Exists on blockchain</li><li>${I.check} Not revoked</li><li>${I.check} Signature valid (ML-DSA-44)</li><li>${I.check} Field hashes valid</li><li>${I.check} Holder signature valid (ML-DSA-44)</li></ul>`)}
                </div>`,
            history: () => `<h4>Verification History</h4>${(h => table(h, [['Today', 'CRED-0003', 'Valid', 'ok'], ['10 Nov 2026', 'CRED-0001', 'Revoked', 'bad'], ['10 Nov 2026', 'CRED-0001', 'Valid', 'ok'], ['10 Nov 2026', 'CRED-0001', 'Expired', 'mute'], ['10 Nov 2026', 'CRED-0001', 'Suspended', 'warn'], ['10 Nov 2026', 'CRED-0001', 'Tampered', 'warn']]
                .map((r, i) => tr([r[0], `<b class="qp-id">${r[1]}</b>`, '<b>Tariq Al Nuaimi</b>', 'Mohammed Al Issuer', chip(r[2], r[3]), 'Manual'], h, i ? '' : 'is-new'))))([['Date'], ['Credential ID'], ['Holder name', 1], ['Issuer', 1], ['Result'], ['Method', 1]])}`,
            policies: () => `<h4>Policies</h4>${(h => table(h, [['POL-001', 'Credential Expiry Check', 'All Credentials', 'Active', 'ok'], ['POL-002', 'Issuer Authorisation Verification', 'All Credentials', 'Active', 'ok'], ['POL-003', 'Academic Credential Schema Match', 'Academic Credentials', 'Active', 'ok'], ['POL-004', 'Medical Licence Renewal Threshold', 'Medical Credentials', 'Active', 'ok'], ['POL-005', 'Revocation List Cross-Check', 'All Credentials', 'Inactive', 'mute'], ['POL-006', 'Professional Licence Scope Validator', 'Professional Licences', 'Active', 'ok'], ['POL-007', 'Holder Identity Binding Check', 'All Credentials', 'Draft', 'a']]
                .map(p => tr([`<b class="qp-id">${p[0]}</b>`, `<b>${p[1]}</b>`, p[2], chip(p[3], p[4])], h))))([['Policy ID', 1], ['Policy name'], ['Applies to', 1], ['Status']])}`
        },

        admin: {
            dash: () => `
                <h4>Dashboard</h4>
                ${tiles([[3, 'Issuing Staff', 'blue'], [2, 'Verifying Staff', 'green']])}
                <div class="qp-stats">
                    <div>${I.users}<span><small>Total staff</small><b>5</b></span></div>
                    <div>${I.check}<span><small>Active members</small><b>2</b></span></div>
                    <div>${I.clock}<span><small>Pending requests</small><b>1</b></span></div>
                    <div class="is-hi">${I.lock}<span><small>Crypto algorithm</small><b>Dilithium</b></span></div>
                </div>
                <div class="qp-two">
                    ${panel('Organisation profile', `<dl class="qp-dl"><div><dt>Name</dt><dd>University of Sharjah</dd></div><div><dt>Country</dt><dd>United Arab Emirates</dd></div><div><dt>DID</dt><dd class="qp-a">did:qportal:uae:uos-2024-001</dd></div><div><dt>Registered</dt><dd>01 Jan 2024</dd></div></dl>`)}
                    ${panel('Recent audit activity', `<ul class="qp-feed">
                        <li>Credential CRED-0002 restored to active<time>10 Nov</time></li>
                        <li>Staff member invited to issuer portal<time>10 Nov</time></li>
                        <li>Credential CRED-0001 revoked<time>10 Nov</time></li></ul>`)}
                </div>`,
            staff: () => `<h4>Manage Staff and Permissions</h4>${(h => table(h, [['STF-0001', 'Mohammed Al Issuer', 'Issuer', 'Issuer Admin', 'Active', 'ok'], ['STF-0002', 'Verifier Portal', 'Verifier', 'Verifier Staff', 'Active', 'ok'], ['STF-0003', '—', 'Issuer', 'Issuer Staff', 'Invited', 'a'], ['STF-0005', '—', 'Issuer', 'Schema Manager', 'Invited', 'a'], ['STF-0006', '—', 'Verifier', 'Policy Manager', 'Invited', 'a']]
                .map(s => tr([`<b class="qp-id">${s[0]}</b>`, `<b>${s[1]}</b>`, `<span class="qp-${s[2] === 'Issuer' ? 'blue' : 'green'}">${s[2]}</span>`, s[3], chip(s[4], s[5])], h))))([['Staff ID', 1], ['Name'], ['Portal'], ['Role', 1], ['Status']])}`,
            audit: () => `<h4>Audit Log ${chip('Append-only · Read-only', 'a')}</h4>${(h => table(h, [['AUD-085', 'Management', 'mute', 'Staff member removed from issuer portal'], ['AUD-084', 'Management', 'mute', 'Staff member invited to issuer portal'], ['AUD-083', 'Restored', 'mute', 'Credential CRED-0002 restored to active'], ['AUD-082', 'Suspended', 'warn', 'Credential CRED-0002 suspended'], ['AUD-081', 'Issued', 'blue', 'Credential CRED-0002 issued to holder H-0001'], ['AUD-080', 'Revoked', 'bad', 'Credential CRED-0001 revoked']]
                .map(a => tr([`<b class="qp-id">${a[0]}</b>`, chip(a[1], a[2]), a[3], '<b>Mohammed Al Issuer</b>', '10 Nov 2026'], h))))([['Log ID', 1], ['Action'], ['Details'], ['Performed by', 1], ['Timestamp', 1]])}`,
            crypto: () => `<h4>Crypto Settings</h4>
                <div class="qp-form qp-form--1"><label><span>Current algorithm</span><output>Dilithium <small>CRYSTALS-Dilithium · ML-DSA</small></output></label></div>
                ${panel('Organisation public key', '<p class="qp-keyblob">MIIHtzANBglghkgBZQMEAxEFAAOCB6QAMIIHnwKCB5oAq3Tz8mPv1LxR0dK7uYc2WnFh5sJe9aQbXg4VtZoN6yMpCkUi3rEwDlS0fHj8G2bTqA7vOxPn1cYmZe5LuRk9WsIh4dJfBa6tNgQo0XyMv3KpEz7UrCl2iHwSj8FbDq1nGx5OtYe4VmAc9LpZuRk6WsIh3dJfBa7tNgQo1XyMv4KpEz8UrCl3iHwSj9FbDq2nGx6OtYe5VmAc0LpZ…</p>')}`
        }
    };

    /* ---------- the component ---------- */
    class Portal {
        constructor(root) {
            this.root = root;
            this.role = 'issuer'; this.step = 0; this.free = null;
            root.innerHTML = `
                <div class="pg-roles" role="tablist" aria-label="Choose a role">${ORDER.map((r, i) => `
                    <button type="button" role="tab" data-role-tab="${r}"><span>0${i + 1}</span><b>${ROLES[r].label}</b><em>${ROLES[r].job}</em></button>`).join('')}
                </div>
                <div class="window-stage"><div class="window" data-tilt>
                    <div class="window__bar"><i></i><i></i><i></i><span class="window__url">qportal.vercel.app</span></div>
                    <div class="qp">
                        <aside class="qp-side">
                            <div class="qp-brand"><img src="assets/qchain-mark.webp" alt="" width="26" height="26"><b>QPortal</b></div>
                            <div class="qp-hello"><b>Good afternoon, Mohammed</b><span>University of Sharjah</span></div>
                            <nav class="qp-nav" aria-label="QPortal sections"></nav>
                            <div class="qp-user"><span class="qp-av">M</span><span><b>Mohammed A.</b><small data-rolename></small></span></div>
                        </aside>
                        <section class="qp-main">
                            <header class="qp-top"><span>University of Sharjah</span><span class="qp-tag" data-tag></span>${I.bell}</header>
                            <div class="qp-view" aria-live="polite"></div>
                        </section>
                    </div>
                </div></div>
                <div class="pg">
                    <div class="pg__n"></div>
                    <div class="pg__text"></div>
                    <div class="pg__btns"></div>
                    <div class="pg__bar"><i></i></div>
                </div>`;
            this.qp = root.querySelector('.qp');
            this.nav = root.querySelector('.qp-nav');
            this.view = root.querySelector('.qp-view');
            root.addEventListener('click', e => this.click(e));
            this.render();
        }

        get tour() { return TOURS[this.role]; }
        get cur() { return this.tour[this.step]; }

        setRole(r) { this.role = r; this.step = 0; this.free = null; this.render(true); }

        next() {
            this.free = null;
            if (this.step < this.tour.length - 1) this.step++;
            else {
                const i = ORDER.indexOf(this.role);
                if (i === ORDER.length - 1) return;
                this.role = ORDER[i + 1]; this.step = 0;
            }
            this.render(true);
        }

        back() {
            if (this.free) { this.free = null; return this.render(true); }
            if (this.step > 0) this.step--;
            else {
                const i = ORDER.indexOf(this.role);
                if (i === 0) return;
                this.role = ORDER[i - 1]; this.step = this.tour.length - 1;
            }
            this.render(true);
        }

        click(e) {
            const t = e.target.closest('[data-role-tab],[data-guide],[data-t],[data-nav],[data-go]');
            if (!t || !this.root.contains(t)) return;
            if (t.dataset.roleTab) return this.setRole(t.dataset.roleTab);
            if (t.dataset.guide) {
                const g = t.dataset.guide;
                if (g === 'next') return this.next();
                if (g === 'back') return this.back();
                if (g === 'resume') { this.free = null; return this.render(true); }
                if (g === 'replay') return this.setRole('issuer');
                return;
            }
            if (!this.free && t.classList.contains('qp-target')) return this.next();
            const go = t.dataset.nav || t.dataset.go;
            if (go && VIEWS[this.role][go]) { this.free = go; this.render(true); }
        }

        render(user) {
            const role = ROLES[this.role], cur = this.cur;
            const view = this.free || cur.view, st = this.free ? {} : (cur.st || {});
            const active = NAV_OF[view] || view;
            const target = this.free ? '' : cur.target;

            this.qp.dataset.role = this.role;
            this.root.dataset.role = this.role;
            this.root.querySelector('[data-tag]').textContent = role.tag;
            this.root.querySelector('[data-rolename]').textContent = role.label;
            this.root.querySelectorAll('[data-role-tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.roleTab === this.role));

            this.nav.innerHTML = role.nav.map(([key, label, icon], i) => `${i === 1 ? `<span class="qp-group">${role.group}</span>` : ''}
                <button type="button" class="${key === active ? 'is-on' : ''}${key ? '' : ' is-off'}" ${key ? `data-nav="${key === 'issue' ? 'issue1' : key}" data-t="nav-${key}"` : 'tabindex="-1" title="Open the live demo to see this screen"'}>${I[icon]}<span>${label}</span></button>`).join('');

            this.view.innerHTML = `<div class="qp-screen" data-view="${view}">${VIEWS[this.role][view](st)}</div>`;
            this.view.scrollTop = 0;

            const hit = target && this.qp.querySelector(`[data-t="${target}"]`);

            /* on narrow windows the menu is a scrolling strip: centre the item that matters */
            const pin = hit && this.nav.contains(hit) ? hit : this.nav.querySelector('.is-on');
            if (pin && this.nav.scrollWidth > this.nav.clientWidth) {
                const a = pin.getBoundingClientRect(), b = this.nav.getBoundingClientRect();
                this.nav.scrollLeft += a.left - b.left - (b.width - a.width) / 2;
            }

            if (hit) {
                hit.classList.add('qp-target');
                if (user) {
                    /* keep the highlighted control in view inside the window, never scrolling the page */
                    if (!this.nav.contains(hit)) {
                        const d = hit.getBoundingClientRect().bottom - this.view.getBoundingClientRect().bottom;
                        if (d > 0) this.view.scrollTop = d + 16;
                    }
                }
            }

            /* the guide */
            const total = this.tour.length, n = this.step + 1;
            const lastRole = this.role === ORDER[ORDER.length - 1], last = n === total;
            const first = this.role === ORDER[0] && this.step === 0;
            this.root.querySelector('.pg__n').innerHTML = this.free ? 'Looking around' : `${role.label} <b>${n}</b> / ${total}`;
            this.root.querySelector('.pg__text').innerHTML = this.free
                ? `<b>${(BLURB[this.role][view] || '')}</b><p>You have stepped off the tour. Click around, or pick it up where you left it.</p>`
                : `<b>${cur.title}</b><p>${cur.text}</p>`;
            this.root.querySelector('.pg__btns').innerHTML = this.free
                ? `<button type="button" class="btn btn--sm" data-guide="resume">Resume the tour</button>`
                : `${first ? '' : '<button type="button" class="btn btn--line btn--sm" data-guide="back">Back</button>'}
                   ${last && lastRole
                        ? '<button type="button" class="btn btn--line btn--sm" data-guide="replay">Replay</button><a class="btn btn--sm" href="https://qportal.vercel.app/" target="_blank" rel="noopener">Open the real QPortal <span class="arr">↗</span></a>'
                        : `<button type="button" class="btn btn--sm" data-guide="next">${last ? `Next: ${ROLES[ORDER[ORDER.indexOf(this.role) + 1]].label.toLowerCase()}` : 'Next'} <span class="arr arr--r">→</span></button>`}`;
            this.root.querySelector('.pg__bar i').style.setProperty('--p', this.free ? 0 : n / total);
        }
    }

    const boot = () => document.querySelectorAll('[data-portal]').forEach(el => { if (!el.qportal) el.qportal = new Portal(el); });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
