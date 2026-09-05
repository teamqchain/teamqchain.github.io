/* ============================================================
   QCHAIN — MASTER SCRIPT
   Data + charts preserved from the original; injected markup
   restyled to the new design language; a motion layer added
   for scroll reveals, nav-on-scroll, and the mobile sheet.
   ============================================================ */

tailwind.config = { darkMode: 'class' };

/* Apply the saved / preferred theme before paint to avoid a flash. */
if (localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.theme = isDark ? 'dark' : 'light';
    if (typeof Chart !== 'undefined') updateChartColors(isDark);
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    const opening = menu.classList.contains('is-closed');
    menu.classList.toggle('is-closed', !opening);
    menu.classList.toggle('is-open', opening);
}

/* Small helper: read a themed colour from the CSS custom properties
   so charts stay in sync with the palette in both light and dark. */
function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function chartTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        isDark,
        text: isDark ? '#93a2b8' : '#5a6b82',
        grid: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.08)',
        surface: isDark ? '#0f1729' : '#ffffff',
        backdrop: isDark ? '#0f1729' : '#ffffff'
    };
}

/* =========================================
   DATA SOURCES  (unchanged)
========================================= */

// RESEARCH DATA
const references = [
    { title: "A Survey about Post Quantum Cryptography Methods", link: "https://publications.eai.eu/index.php/IoT/article/view/5099", type: "Review Article", publisher: "EAI Endorsed Transactions on Internet of Things", year: "2024", bullets: ["Identification of severe quantum computing threats to widely used asymmetric encryption standards like RSA and ECC.", "Categorization of post-quantum cryptography into prominent families: lattice-based, hash-based, code-based, and multivariate encryption methods.", "Evaluation highlighting lattice-based cryptography as a highly promising, resource-efficient option for constrained microcontroller environments."] },
    { title: "How to factor 2048 bit RSA integers with less than a million noisy qubits", link: "https://arxiv.org/abs/2505.15917", type: "Research Paper", publisher: "Quantum Journal", year: "2025", bullets: ["Substantial reduction in the estimated number of qubits required to factor 2048-bit RSA integers.", "Estimation that factoring a 2048-bit RSA integer can be achieved in less than a week by a quantum computer using under one million noisy qubits.", "Qubit count reductions achieved primarily through approximate residue arithmetic, storing idle logical qubits with yoked surface codes, and using magic state cultivation."] },
    { title: "A Review on the Advances, Applications, and Future Prospects of Post-Quantum Cryptography in Blockchain and IoT", link: "https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=11059920", type: "Topical Review", publisher: "IEEE Access", year: "2025", bullets: ["Strong advocacy for Hybrid (ECC + PQC) approach.", "Analysis of NIST vs ETSI standards.", "Framework for secure transition."] },
    { title: "Fortifying the Blockchain: A Systematic Review and Classification of Post-Quantum Consensus Solutions for Enhanced Security and Resilience", link: "https://ieeexplore.ieee.org/document/10185538", type: "Systematic Review", publisher: "IEEE Access", year: "2023", bullets: ["Reviews PBFT and Raft in PQC context.", "Emphasizes 'Quantum-Ready' consensus protocols.", "Discusses Membership Service Provider (MSP) implications."] },
    { title: "Status Report on the Fourth Round of the NIST Post-Quantum Cryptography Standardization Process", link: "https://nvlpubs.nist.gov/nistpubs/ir/2025/NIST.IR.8545.pdf", type: "Report", publisher: "NIST", year: "2025", bullets: ["Lattice-based schemes (CRYSTALS-Kyber, CRYSTALS-Dilithium) emerged as leading candidates", "Strong security guarantees against classical and quantum attacks", "Practical efficiency compared to other PQC families"] },
    { title: "Hybrid Post-Quantum Signatures for Bitcoin and Ethereum", link: "https://jbba.scholasticahq.com/article/154321-hybrid-post-quantum-signatures-for-bitcoin-and-ethereum-a-protocol-level-integration-strategy.pdf", type: "Research Article", publisher: "The JBBA", year: "2025", bullets: ["Proposes Hybrid Cryptographic Frameworks.", "Estimates significant throughput loss (50%+) during transition.", "Advocates for gradual 'Defensive Downgrade'."] },
    { title: "Breaking Rainbow Takes a Weekend on a Laptop", link: "https://eprint.iacr.org/2022/214.pdf", type: "Technical Review", publisher: "IBM Research", year: "2022", bullets: ["Discovery of new key-recovery attacks against the NIST PQC finalist Rainbow signature scheme.", "Practical full secret key recovery for SL 1 parameters in approximately 53 hours on a standard laptop.", "Combination with the rectangular MinRank attack to significantly improve attacks against SL 3 and SL 5 parameters."] },
    { title: "Performance and Applicability of Post-Quantum Digital Signature Algorithms in Resource-Constrained Environments", link: "https://www.mdpi.com/1999-4893/16/11/518", type: "Review", publisher: "MDPI (Algorithms)", year: "2023", bullets: ["Dilithium: Best balance for low-power devices.", "SPHINCS+: Too heavy/slow for rapid transactions.", "Falcon: Excellent verification speed, good for validators."] },
    { title: "Performance Analysis and Industry Deployment of Post-Quantum Cryptography Algorithms", link: "https://arxiv.org/abs/2503.12952", type: "Preprint", publisher: "arXiv", year: "2025", bullets: ["AVX2 optimization significantly boosts PQC speed.", "Dilithium2/3/5 benchmarks provided.", "Discusses industry deployment hurdles."] },
    { title: "A Blockchain System Based on Quantum-Resistant Digital Signature", link: "https://www.researchgate.net/publication/349824717_A_Blockchain_System_Based_on_Quantum-Resistant_Digital_Signature", type: "Research Article", publisher: "Hindawi (Security and Comm. Networks)", year: "2021", bullets: ["Focuses on Lattice-based signatures.", "Highlights vulnerability of ECDSA in smart city contexts.", "Provides security proofs against quantum attacks."] },
    { title: "A Quantum-Resistant Blockchain System: A Comparative Analysis", link: "https://www.mdpi.com/2227-7390/11/18/3947", type: "Review / Comparative Analysis", publisher: "MDPI (Mathematics)", year: "2023", bullets: ["Proposes IPFS integration to solve PQC key size issues.", "Analyzes performance of Dilithium and Falcon.", "Demonstrates reduced blockchain bloat via off-chain storage."] },
    { title: "A Performance Comparison of Post-Quantum Algorithms in Blockchain", link: "https://jbba.scholasticahq.com/api/v1/articles/38508-a-performance-comparison-of-post-quantum-algorithms-in-blockchain.pdf", type: "Peer Reviewed Research", publisher: "The JBBA", year: "2022", bullets: ["Dilithium identified as a strong 'all-rounder'.", "Falcon noted for fast verification but complex implementation.", "Rainbow (multivariate) analyzed but noted for recent vulnerabilities."] }
];

// AUDIT DATA
const findings = [
    { id:"F01", sev:"Critical", cat:"Authentication", title:"No API authentication; open CORS; one shared privileged identity", loc:"offchain/server.go, config.go", impact:"Every route (including /issueCredential, /revokeCredential, /suspendCredential) is registered with no auth middleware, and CORS is Access-Control-Allow-Origin: *. All privileged calls run under a single hard-coded wallet identity (issuer1/verifier1) with stamped IDs (ISS-UOS-0001). Anyone who can reach the URL can issue, revoke or suspend any credential. The chaincode checkAccess(role) is satisfied by that one shared identity, so on-chain RBAC is effectively bypassed from the API's perspective.", rec:"Introduce real login (issuer/verifier/admin) with JWT or sessions, per-user Fabric identities so checkAccess is meaningful, and role-based authorization on every privileged route. Restrict CORS to known frontend origins." },
    { id:"F02", sev:"High", cat:"Correctness", title:"Expired credentials still verify as valid", loc:"offchain/verification.go, mobile.go; QChaincode.js", impact:"Verification (and OTP/QR resolveSession) only checks Status == \"active\". Nothing ever transitions a credential to \"expired\": expiryDate is stored but never enforced at verify time, and there is no sweep job that flips status. A credential past its expiry date returns verified=true with all four checks green. A verifier is actively misled.", rec:"At verification, treat expiryDate < now as not-valid (a distinct 'expired' result), independent of on-chain Status. Optionally add a scheduled job that sets status='expired'. Decide whether expiry is a chain fact or a verify-time policy and apply it consistently." },
    { id:"F03", sev:"High", cat:"Authentication", title:"OTP / presentation tokens are brute-forceable", loc:"offchain/mobile.go handleGenerateOTP / handleResolveSession", impact:"OTP is a 6-digit code (10^6 space) valid ~120s, and /resolveSession has no rate-limiting, lockout, or attempt counter. An attacker can brute-force a live OTP within its window to redeem a presentation. crypto/rand is used (good) and tokens are one-time after redemption, but neither mitigates online guessing during the window.", rec:"Add per-token and per-IP rate-limiting with lockout after a few failed attempts on /resolveSession; increase token entropy (8+ digits or alphanumeric) and/or shorten the window. Log and alert on repeated failures." },
    { id:"F04", sev:"High", cat:"Post-Quantum Identity", title:"Fabric MSP identity, tx-signing and TLS remain classical ECDSA", loc:"qchain-network/config/core.yaml (BCCSP: SW/SHA2/256), fabric.go, registerEnroll.sh", impact:"The credential signature is post-quantum, but the blockchain's own identity layer is not: MSP X.509 certs, the gateway client's transaction signatures, and node TLS all use ECDSA. A quantum adversary able to forge ECDSA could forge Fabric identities and impersonate the University's peer, even though credential signatures stay safe. This is the known, planned Track A gap.", rec:"Execute Track A: replace ECDSA with ML-DSA across BCCSP → MSP → cryptogen → TLS (see the Track A implementation plan). Until then, document it explicitly as the system's residual quantum exposure." },
    { id:"F05", sev:"High", cat:"Confidentiality", title:"Pre-G2 credentials keep full plaintext on-chain forever", loc:"Fabric world-state & block history (immutable)", impact:"The G2 change stops new issuances from writing plaintext attributes on-chain, but credentials issued before it retain their full plaintext in the immutable block history on every peer. This cannot be edited away. Any 'the ledger is confidential' claim must be scoped to post-G2 records.", rec:"Re-issue the demo/sensitive dataset on the post-G2 chain if a clean state is required, and state the historical caveat in any report. New rebuilds start clean." },
    { id:"F06", sev:"High", cat:"Key Management", title:"Signing key and decryption key co-located on one host in plaintext .env", loc:"offchain/.env (ISSUER_PRIVATE_KEY_HEX, ORG_KEM_PRIVATE_KEY_HEX)", impact:"The org ML-DSA signing key and the org ML-KEM decryption key both sit in .env on the same VM. A single host compromise yields the power to both forge credential signatures and decrypt every off-chain credential body, a total break of the system's guarantees. G2 increased the value of this target by making the KEM key load-bearing for verification.", rec:"Move keys to a KMS/HSM (PKCS#11 is already a BCCSP option); at minimum separate the two keys' custody and tighten file permissions. Define rotation and backup procedures before any holder-held-key phase." },
    { id:"F07", sev:"High", cat:"Confidentiality", title:"Holder PII stored in plaintext in MySQL", loc:"qchain-network/scripts/schema.sql (holders table)", impact:"emirates_id, email, phone, names and cached credential fields are stored in clear columns. Track B encrypted the credential body (credential_data) but the PII columns (Track C) were never implemented. A DB-file theft or a read-only DB account exposes national-ID-level PII directly.", rec:"Apply application-layer field encryption (Track C) to sensitive columns, reusing the Track B envelope; keep lookup keys as blind indexes / salted hashes so queries still work." },
    { id:"F08", sev:"Medium", cat:"Non-repudiation", title:"Holder presentations are not signed", loc:"offchain/mobile.go (OTP/QR sessions)", impact:"OTP/QR sessions are server-minted rows; the holder never signs a presentation. A holder can plausibly repudiate 'I presented this credential', and a compromised server could mint presentations on a holder's behalf.", rec:"Give holders PQC keys (columns already exist) and require a holder signature over the presentation challenge; verify it at resolveSession." },
    { id:"F09", sev:"Medium", cat:"Secrets", title:"Default/hard-coded credentials in config", loc:"docker-compose.yaml (CouchDB admin/adminpw), fabric-ca-server-config.yaml (admin:adminpw)", impact:"CouchDB runs with admin/adminpw (also embedded in the healthcheck URL) and the fabric-ca bootstrap identity is admin:adminpw. On a publicly-exposed VM these are guessable administrative footholds into the state database and the CA.", rec:"Replace all default credentials with strong secrets injected via environment/secret files; never commit them. Restrict CouchDB (5984) and CA ports to the internal Docker network." },
    { id:"F10", sev:"Medium", cat:"Availability", title:"No request body-size limit on API handlers", loc:"offchain/httputil.go decodeBody / all handlers", impact:"decodeBody calls json.NewDecoder(r.Body).Decode with no http.MaxBytesReader cap. A single large POST (e.g. to /issueCredential info) can consume memory; combined with the missing auth and open Funnel this is a cheap DoS vector.", rec:"Wrap request bodies with http.MaxBytesReader at a sane limit; reject oversized payloads with 413." },
    { id:"F11", sev:"Medium", cat:"Confidentiality", title:"Selective disclosure is still cosmetic", loc:"offchain/mobile.go applySelectiveDisclosure", impact:"Hidden fields are set to nil in the response after the full body has been decrypted server-side. The verifier trusts the server to redact; the data was fully present in memory. It is presentation-time hiding, not cryptographic non-disclosure.", rec:"Build true selective disclosure on the per-field envelope (release only disclosed field keys) or salted-Merkle commitments signed by the org key, so an undisclosed field is never handed over." },
    { id:"F12", sev:"Medium", cat:"Correctness", title:"Mobile-session redemption is not atomic (replay window)", loc:"offchain/mobile.go handleResolveSession", impact:"resolveSession reads the session, verifies, then deletes it (deleteMobileSession) only on some paths. Between read and delete, concurrent requests with the same token can each pass verification.", rec:"Redeem atomically: a single UPDATE ... SET used=1 WHERE id=? AND used=0 that must affect exactly one row before proceeding; treat zero rows as already-used." },
    { id:"F13", sev:"Medium", cat:"Non-repudiation", title:"Audit and event logs are mutable, off-chain and unsigned", loc:"MySQL credential_events / verification_logs / audit tables", impact:"Operational history lives only in mutable MySQL, not anchored on-chain and not signed. A DB-level actor can rewrite the audit trail, weakening non-repudiation for issuance/revocation/verification events.", rec:"Anchor periodic log-hash checkpoints on-chain, or sign log entries with the org ML-DSA key, so tampering is detectable." },
    { id:"F14", sev:"Medium", cat:"Hardening", title:"Gateway lacks security headers and rate-limiting", loc:"web-gateway/nginx.conf", impact:"The single public entry point sets only X-Content-Type-Options. There is no HSTS, CSP, X-Frame-Options, or referrer policy, and no rate-limiting in front of /api/ , so the unauthenticated backend is directly reachable from the public Funnel at full speed.", rec:"Add HSTS, a CSP, X-Frame-Options=DENY and referrer policy; apply limit_req to /api/. Keep CouchDB/CA/IPFS-API ports off the public interface." },
    { id:"F15", sev:"Medium", cat:"Supply Chain", title:"Unpinned :latest images and a stale, non-compiling test file", loc:"docker-compose.yaml (hyperledger/*:latest), offchain/server_test.go", impact:"Fabric peer/orderer/IPFS images use :latest, so a rebuild can silently change the platform version underneath the network. Separately, server_test.go references removed functions (connectionProfilePath, pqcGenKeyPair, handleUploadDocument) and fails to compile, which breaks `go test ./...` and hides regressions behind a red build.", rec:"Pin image tags to a tested Fabric version (e.g. 2.5.9). Delete or update server_test.go so the full test suite compiles and runs in CI." },
    { id:"F16", sev:"Low", cat:"Key Management", title:"Backend build path and chaincode-name inconsistencies", loc:"docker-compose.yaml (build context ../../offchain/go-bindings; CHAINCODE_NAME=QChaincode vs default qchaincode)", impact:"The compose build context points at a stale go-bindings path, and CHAINCODE_NAME differs between compose (QChaincode) and config.go default (qchaincode). Both cause confusing build/deploy failures for anyone standing the system up fresh.", rec:"Fix the build context to offchain/, and make the chaincode name consistent across compose, config, and the lifecycle deploy." },
    { id:"F17", sev:"Low", cat:"Confidentiality", title:"IPFS re-encrypt cannot recall already-exposed plaintext", loc:"offchain/reencrypt.go (RUN_IPFS_REENCRYPT)", impact:"The cleanup tool replaces plaintext IPFS blobs with encrypted ones and unpins the old CID, but data already fetched by third parties, or cached on other IPFS nodes, is not recallable. This is inherent to IPFS, not a code defect.", rec:"Document the limitation; assume any pre-encryption IPFS body may already be public and re-issue truly sensitive credentials." },
    { id:"F18", sev:"Low", cat:"Availability", title:"Multiple single points of failure", loc:"docker-compose.yaml (1 orderer, 1 peer/org, 1 IPFS, 1 MySQL, 1 VM)", impact:"Everything runs on one VM with a single-consenter etcdraft orderer (no real fault tolerance), one peer per org, one IPFS node and one MySQL. Any single failure takes down issuance/verification (the on-chain hash survives, but bodies may be unreachable).", rec:"For production: multiple Raft consenters, additional peers, a second IPFS node/pin service, and DB replication. Acceptable for a demo if stated." },
    { id:"F19", sev:"Low", cat:"Availability", title:"Public demo is open with no access control", loc:"Tailscale Funnel → gateway (setup-tailscale-funnel.sh)", impact:"The demo is exposed publicly with no authentication (compounding F01) and no abuse protection. Fine as a shared demo, but it means anyone on the internet can drive the unauthenticated API.", rec:"Gate the public demo behind at least basic auth or an allowlist while F01 is outstanding; document shared-demo status." },
    { id:"F20", sev:"Low", cat:"Hardening", title:"IPFS upload failure silently proceeds without a CID", loc:"offchain/credentials.go handleIssueCredential (step 5)", impact:"If the IPFS upload fails, issuance continues with an empty CID (logged, non-fatal). In G2 metadata mode the MySQL row is still the primary source, so verification survives, but the IPFS backup for that credential is missing, silently reducing resilience.", rec:"Surface IPFS-upload failures more prominently (metric/alert), and offer a reconcile pass (the RUN_IPFS_REENCRYPT tool already repopulates CIDs) so no credential is left without its off-chain backup." }
];

const strengths = [
    { title:"Post-quantum credential signature", body:"ML-DSA-44 (FIPS 204) via liboqs signs the SHA3-256 credential hash; verification is symmetric and correct (crypto.go). The core authenticity claim is genuinely post-quantum." },
    { title:"On-chain integrity verification", body:"Verification re-hashes the credential payload and checks it against the on-chain hash + signature, it never trusts the database for the cryptographic decision. Correct trust model." },
    { title:"Sound Track B envelope crypto", body:"Hybrid KEM-DEM (ML-KEM-768 + AES-256-GCM + HKDF-SHA3-256) with per-field single-use wrapping keys. Cross-field and cross-credential ciphertext swaps are correctly rejected." },
    { title:"G2 fails closed", body:"With on-chain plaintext removed, if the encrypted body can't be resolved from DB or IPFS the hash check fails (body_unavailable) rather than defaulting to valid. No 'assume valid' path." },
    { title:"SQL is fully parameterized", body:"Every query uses placeholders and argument slices, including the dynamically-built status/verification filters. No SQL-injection vectors were found." },
    { title:"Safe-by-default & reversible design", body:"Track B/G2 degrade gracefully (legacy passthrough, ONCHAIN_PLAINTEXT reversal flag) and coexist with old records." },
    { title:"Good randomness & algorithm agility", body:"crypto/rand is used for OTP/session tokens, and the envelope records its own KEM algorithm so old ciphertexts survive library upgrades (post-audit fix)." }
];

const sevMeta = {
    Critical: { badge:"bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300", dot:"bg-red-600", bar:"sev-critical" },
    High:     { badge:"bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300", dot:"bg-orange-500", bar:"sev-high" },
    Medium:   { badge:"bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300", dot:"bg-yellow-500", bar:"sev-medium" },
    Low:      { badge:"bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300", dot:"bg-blue-500", bar:"sev-low" }
};

/* =========================================
   BOOTSTRAPPING & RENDERING
========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Render data into the DOM (if the containers exist on this page)
    populateRefTable();
    renderFindings();
    renderStrengths();

    // 2. Motion layer
    initScrollReveals();
    initNavScrollState();

    // 3. Charts (lazy-loaded on scroll to save memory)
    if (typeof Chart !== 'undefined') {
        const t = chartTheme();
        Chart.defaults.color = t.text;
        Chart.defaults.borderColor = t.grid;
        Chart.defaults.font.family = "'Inter', system-ui, sans-serif";

        const observerOptions = { root: null, rootMargin: '80px', threshold: 0.1 };
        const chartObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.id === 'timelineChart') initTimelineChart();
                    if (entry.target.id === 'radarChart') initRadarChart();
                    if (entry.target.id === 'barChart') initBarChart();
                    if (entry.target.id === 'sevChart') initAuditCharts();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        ['timelineChart', 'radarChart', 'barChart', 'sevChart'].forEach(id => {
            const el = document.getElementById(id);
            if (el) chartObserver.observe(el);
        });
    }
});

/* --- MOTION: scroll reveals (respects reduced motion) --- */
function initScrollReveals() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
        items.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            // stagger siblings that share a group for a gentle cascade
            const delay = parseInt(el.dataset.revealDelay || '0', 10);
            el.style.setProperty('--reveal-delay', delay + 'ms');
            el.classList.add('is-visible');
            obs.unobserve(el);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    items.forEach(el => io.observe(el));
}

/* --- MOTION: nav gains an edge + shadow once content scrolls under it --- */
function initNavScrollState() {
    const nav = document.querySelector('.glass-nav');
    if (!nav) return;
    let ticking = false;
    const update = () => {
        nav.classList.toggle('is-scrolled', window.scrollY > 6);
        ticking = false;
    };
    update();
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
}

/* --- POPULATE: research references --- */
function populateRefTable() {
    const tbody = document.querySelector('#refTable tbody');
    if (!tbody) return;

    tbody.innerHTML = references.map(ref => `
        <tr class="data-row">
            <td class="px-6 py-4"><a href="${ref.link}" target="_blank" rel="noopener" class="font-semibold link-accent hover:underline text-sm">${ref.title}</a></td>
            <td class="px-6 py-4 t-muted whitespace-nowrap">${ref.year}</td>
            <td class="px-6 py-4 t-base">${ref.publisher}</td>
            <td class="px-6 py-4"><span class="chip whitespace-nowrap">${ref.type}</span></td>
            <td class="px-4 py-4 align-top">
                <div class="space-y-1.5">${ref.bullets.map(b => `<div class="flex items-start gap-2"><span class="t-accent mt-0.5 text-xs">●</span><span class="text-xs t-muted leading-relaxed">${b}</span></div>`).join('')}</div>
            </td>
        </tr>
    `).join('');
}

/* --- POPULATE: audit findings --- */
function renderFindings() {
    const tbody = document.getElementById('findBody');
    if (!tbody) return;

    tbody.innerHTML = findings.map(f => {
        const m = sevMeta[f.sev];
        return `
        <tr class="finding-summary data-row cursor-pointer align-top" data-sev="${f.sev}" data-search="${(f.id+' '+f.title+' '+f.cat+' '+f.loc+' '+f.impact).toUpperCase()}" onclick="toggleDetail('${f.id}')">
            <td class="px-4 py-4 font-mono font-bold t-base whitespace-nowrap">${f.id}</td>
            <td class="px-4 py-4 whitespace-nowrap"><span class="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${m.badge}"><span class="w-2 h-2 rounded-full ${m.dot}"></span>${f.sev}</span></td>
            <td class="px-4 py-4 font-semibold t-base min-w-[220px]">${f.title}<span class="block md:hidden text-xs font-normal t-subtle mt-1">${f.cat} · ${f.loc}</span></td>
            <td class="px-4 py-4 hidden md:table-cell"><span class="chip whitespace-nowrap">${f.cat}</span></td>
            <td class="px-4 py-4 hidden md:table-cell font-mono text-xs t-subtle min-w-[180px]">${f.loc}</td>
        </tr>
        <tr id="detail-${f.id}" class="finding-detail hidden" data-sev="${f.sev}">
            <td colspan="5" class="px-4 pb-6 pt-0 surface-2 border-l-4 ${m.bar}">
                <div class="max-w-4xl pt-3">
                    <p class="eyebrow t-subtle mb-1">Impact</p>
                    <p class="text-sm t-muted mb-4 leading-relaxed">${f.impact}</p>
                    <p class="eyebrow t-accent mb-1">Recommendation</p>
                    <p class="text-sm t-muted leading-relaxed">${f.rec}</p>
                </div>
            </td>
        </tr>`;
    }).join('');
}

/* --- POPULATE: audit strengths --- */
function renderStrengths() {
    const grid = document.getElementById('strengthGrid');
    if (!grid) return;

    grid.innerHTML = strengths.map((s, i) => `
        <div class="card card-hover card-rail p-5" data-reveal data-reveal-delay="${(i % 3) * 70}">
            <div class="flex items-start gap-2 mb-2">
                <span class="t-accent mt-0.5">✓</span>
                <h4 class="font-bold t-base text-sm">${s.title}</h4>
            </div>
            <p class="text-sm t-muted leading-relaxed">${s.body}</p>
        </div>`).join('');

    // newly-injected reveal targets need to be observed too
    initScrollReveals();
}

/* --- UI INTERACTIONS --- */
function updateAlgoInfo(algo) {
    const box = document.getElementById('algo-verdict');
    if (!box) return;
    if (algo === 'dilithium') box.innerHTML = `<strong class="block t-accent mb-1">Verdict: Recommended for MSP</strong><p class="t-muted">ML-DSA offers the best balance of security and performance.</p>`;
    else if (algo === 'falcon') box.innerHTML = `<strong class="block mb-1" style="color:#a855f7">Verdict: High-Performance Specialist</strong><p class="t-muted">FN-DSA is ideal for fast validation but risks side-channel attacks.</p>`;
    else if (algo === 'sphincs') box.innerHTML = `<strong class="block mb-1" style="color:#f97316">Verdict: Long-Term Backup</strong><p class="t-muted">SLH-DSA is too bulky for high-frequency chains, best reserved for Root CA rotation.</p>`;
}

function showArchDetail(part) {
    const title = document.getElementById('detail-title');
    const text = document.getElementById('detail-text');
    if (!title || !text) return;

    document.querySelectorAll('.interactive-block').forEach(b => b.classList.remove('block-selected'));
    const active = document.querySelector(`[data-arch="${part}"]`);
    if (active) active.classList.add('block-selected');

    if (part === 'users') { title.textContent = "Client Applications"; title.style.color = "var(--text)"; text.innerHTML = "Flutter-based interfaces. <b>Issuers</b> issue degrees, <b>Holders</b> manage keys, and <b>Verifiers</b> query the ledger."; }
    else if (part === 'backend') { title.textContent = "Backend Server (Go)"; title.style.color = "#3b82f6"; text.innerHTML = "The core bridge. Utilizes <code>liboqs-go</code> to execute operations before interacting with the Fabric SDK."; }
    else if (part === 'fabric') { title.textContent = "Fabric & Custom CSP"; title.style.color = "var(--accent)"; text.innerHTML = "Extended Fabric CSP natively supporting PQC alongside ECDSA. Chaincode handles logic."; }
    else if (part === 'storage') { title.textContent = "Hybrid Storage"; title.style.color = "#a855f7"; text.innerHTML = "Heavy metadata is stored off-chain via <b>IPFS</b>. The ledger only records the IPFS hashes and PQC signatures."; }
}

function filterRefTable() {
    const q = document.getElementById('searchInputRef').value.toUpperCase();
    const rows = document.getElementById('refTable').getElementsByTagName('tr');
    for (let i = 1; i < rows.length; i++) {
        rows[i].style.display = Array.from(rows[i].getElementsByTagName("td")).map(td => td.textContent).join(" ").toUpperCase().indexOf(q) > -1 ? "" : "none";
    }
}

function filterFindings() {
    const q = document.getElementById('searchInputAudit').value.toUpperCase();
    const sev = document.getElementById('sevFilter').value;
    let visible = 0;
    document.querySelectorAll('.finding-summary').forEach(row => {
        const show = row.dataset.search.indexOf(q) > -1 && (!sev || row.dataset.sev === sev);
        row.style.display = show ? '' : 'none';
        const detail = document.getElementById('detail-' + row.querySelector('td').textContent);
        if (detail && !show) detail.classList.add('hidden');
        if (show) visible++;
    });
    const emptyMsg = document.getElementById('noResults');
    if (emptyMsg) emptyMsg.classList.toggle('hidden', visible !== 0);
}

function toggleDetail(id) {
    const row = document.getElementById('detail-' + id);
    if (row) row.classList.toggle('hidden');
}

/* --- CHART FUNCTIONS --- */
function updateChartColors(isDark) {
    const t = chartTheme();
    Chart.defaults.color = t.text;
    Chart.defaults.borderColor = t.grid;

    for (let id in Chart.instances) {
        let chart = Chart.instances[id];
        if (chart.config.type === 'radar') {
            chart.options.scales.r.angleLines.color = t.grid;
            chart.options.scales.r.grid.color = t.grid;
            chart.options.scales.r.pointLabels.color = t.text;
            chart.options.scales.r.ticks.backdropColor = t.backdrop;
        }
        if (chart.options.scales.x) { chart.options.scales.x.ticks.color = t.text; chart.options.scales.x.grid.color = t.grid; }
        if (chart.options.scales.y) { chart.options.scales.y.ticks.color = t.text; chart.options.scales.y.grid.color = t.grid; }
        if (chart.config.type === 'doughnut') chart.data.datasets[0].borderColor = t.surface;
        chart.update();
    }
}

function initTimelineChart() {
    new Chart(document.getElementById('timelineChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: ['2023', '2026', '2029', '2033'],
            datasets: [
                { label: 'Estimated Logical Qubits', data: [48, 100, 200, 2000], borderColor: '#0d9488', backgroundColor: 'rgba(13, 148, 136, 0.12)', tension: 0.35, fill: true, pointRadius: 3, pointHoverRadius: 5 },
                { label: 'RSA-2048 Threshold (~1000 Qubits)', data: [1000, 1000, 1000, 1000], borderColor: '#ef4444', borderDash: [5, 5], pointRadius: 0, borderWidth: 2, fill: false }
            ]
        },
        options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'The Race to Quantum Advantage' } }, scales: { y: { title: { display: true, text: 'Logical Qubits' }, type: 'linear' } } }
    });
}

function initRadarChart() {
    const t = chartTheme();
    new Chart(document.getElementById('radarChart').getContext('2d'), {
        type: 'radar',
        data: {
            labels: [['Verification', 'Speed'], ['Signing', 'Speed'], ['Public Key', 'Size'], ['Signature', 'Size'], ['Implementation', 'Ease']],
            datasets: [
                { label: 'ML-DSA (Dilithium)', data: [80, 85, 60, 60, 90], realData: ['Fast (~0.1ms)', 'Fast (~0.5ms)', '1312 Bytes', '2420 Bytes', 'Simple'], backgroundColor: 'rgba(20, 184, 166, 0.2)', borderColor: '#14b8a6', pointBackgroundColor: '#14b8a6' },
                { label: 'FN-DSA (Falcon)', data: [95, 70, 80, 80, 40], realData: ['Very Fast (~0.05ms)', 'Moderate (~1ms)', '897 Bytes', '666 Bytes', 'Complex (FPU needed)'], backgroundColor: 'rgba(168, 85, 247, 0.2)', borderColor: '#a855f7', pointBackgroundColor: '#a855f7' },
                { label: 'SLH-DSA (SPHINCS+)', data: [30, 30, 90, 10, 80], realData: ['Slow (~10ms)', 'Very Slow (~200ms)', '32 Bytes', '17088 Bytes', 'Moderate'], backgroundColor: 'rgba(249, 115, 22, 0.2)', borderColor: '#f97316', pointBackgroundColor: '#f97316' }
            ]
        },
        options: { maintainAspectRatio: false, responsive: true, elements: { line: { borderWidth: 3 } }, scales: { r: { angleLines: { display: false }, suggestedMin: 0, suggestedMax: 100, ticks: { display: false, backdropColor: t.backdrop } } }, plugins: { tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.dataset.realData[ctx.dataIndex]}` } } } }
    });
}

function initBarChart() {
    new Chart(document.getElementById('barChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['ECDSA', 'FN-DSA', 'ML-DSA', 'SLH-DSA'],
            datasets: [{ label: 'Signature Size (Bytes)', data: [64, 666, 2420, 17088], backgroundColor: ['#ef4444', '#a855f7', '#14b8a6', '#f97316'], borderRadius: 6 }]
        },
        options: { maintainAspectRatio: false, responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { type: 'logarithmic', title: { display: true, text: 'Bytes (Log Scale)' }, ticks: { callback: val => [10, 100, 1000, 10000, 100000].includes(val) ? val.toLocaleString() : null } } } }
    });
}

function initAuditCharts() {
    const t = chartTheme();
    new Chart(document.getElementById('sevChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Critical', 'High', 'Medium', 'Low'],
            datasets: [{ data: [1, 6, 8, 5], backgroundColor: ['#dc2626', '#f97316', '#eab308', '#3b82f6'], borderWidth: 3, borderColor: t.surface }]
        },
        options: { maintainAspectRatio: false, responsive: true, cutout: '62%', plugins: { legend: { position: 'bottom' } } }
    });

    new Chart(document.getElementById('catChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Authentication', 'Confidentiality', 'Correctness', 'Key Mgmt', 'Non-repudiation', 'Availability', 'Hardening', 'Other'],
            datasets: [{ label: 'Findings', data: [2, 4, 2, 2, 2, 3, 2, 3], backgroundColor: '#14b8a6', borderRadius: 6 }]
        },
        options: { maintainAspectRatio: false, responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { precision: 0 }, title: { display: true, text: 'Count' } } } }
    });
}
