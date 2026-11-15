/* ============================================================
   QChain — content data (reading list, audit findings, strengths)
   Edit here; research.html and audit.html render from these arrays.
   ============================================================ */

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

const findings = [
    {
        id: "F01",
        sev: "Critical",
        status: "Active",
        cat: "Authentication",
        title: "No API authentication; open CORS; one shared privileged identity",
        loc: "offchain/server.go, config.go",
        impact: "Every route (including /issueCredential, /revokeCredential, /suspendCredential, /updateCredential) is registered without authentication middleware. CORS header is set to '*'. All privileged operations run using a single shared wallet identity (issuer1/verifier1). Anyone who can reach the HTTP port can issue, revoke, or modify credentials at will, effectively bypassing on-chain role checks.",
        rec: "Introduce JWT/session authentication across all privileged routes. Implement per-user Fabric identities and strict role-based authorization (RBAC). Restrict CORS to authorized frontend domains."
    },
    {
        id: "F21",
        sev: "Critical",
        status: "Active",
        cat: "Access Control",
        title: "Unauthenticated database cleanup endpoint allows arbitrary data wiping",
        loc: "offchain/db_cleanup.go:handleDevCleanupTest, server.go:113",
        impact: "A testing endpoint (POST /dev/cleanupTest) is registered on the production HTTP router without authentication, authorization, or debug-mode checks. An external caller can submit target emiratesIDs, holderIDs, or credentialIDs and trigger cascading SQL deletes that wipe credentials, holder records, alerts, subscriptions, verification logs, and audit trails.",
        rec: "Remove handleDevCleanupTest from the production router immediately. If required for testing, restrict it behind an environment flag (e.g. RUN_ENV=development), IP whitelisting, and administrative token authorization."
    },
    {
        id: "F02",
        sev: "High",
        status: "Resolved",
        cat: "Correctness",
        title: "Expired credentials still verify as valid",
        loc: "offchain/verification.go, offchain/chain.go:289",
        impact: "Originally, credentials past their expiryDate returned verified=true with active status because expiry was never evaluated during verification.",
        rec: "RESOLVED: effectiveStatus() now evaluates expiry dates against Dubai local time; verifyPresentation flags expired credentials with status='expired', sets reason='EXPIRED', and fails verification (Verified=false)."
    },
    {
        id: "F03",
        sev: "High",
        status: "Active",
        cat: "Authentication",
        title: "OTP / presentation tokens are brute-forceable",
        loc: "offchain/mobile.go (handleGenerateOTP, handleResolveSession)",
        impact: "Manual verification OTP codes are 6-digit numeric strings (10^6 space) valid for 120 seconds. The /resolveSession endpoint lacks rate-limiting, IP throttling, attempt counting, or lockout. An attacker can attempt an online brute-force attack to redeem active holder sessions during the validity window.",
        rec: "Enforce per-IP and per-session rate limiting with lockout after 3-5 failed attempts on /resolveSession. Increase token entropy (8+ alphanumeric characters) and log security alerts on repeated failures."
    },
    {
        id: "F04",
        sev: "High",
        status: "Active",
        cat: "Post-Quantum Identity",
        title: "Fabric MSP identity, tx-signing and TLS remain classical ECDSA",
        loc: "qchain-network/config/core.yaml (BCCSP: SW/SHA2/256), fabric.go",
        impact: "Credential and presentation signatures are post-quantum (ML-DSA-44), but the blockchain infrastructure (Fabric MSP X.509 certs, consensus signatures, peer TLS) relies on classical ECDSA. A quantum adversary capable of breaking ECDSA could forge peer identities or tamper with consensus transactions.",
        rec: "Execute Track A: upgrade Fabric BCCSP, peer MSP, and crypto-config to support ML-DSA-44 natively. Explicitly document this known Track A research scope in public reports."
    },
    {
        id: "F05",
        sev: "High",
        status: "Active",
        cat: "Confidentiality",
        title: "Pre-G2 credentials keep full plaintext on-chain forever",
        loc: "Fabric world-state & block history (immutable)",
        impact: "Historical blocks committed prior to G2 retain plaintext credential attributes in the immutable peer ledger. This block history cannot be altered. Confidentiality guarantees apply strictly to post-G2 commitments.",
        rec: "Acknowledge the historical immutability boundary in documentation. Any sensitive pre-G2 demo data should be treated as public, and new deployments must start from a clean ledger."
    },
    {
        id: "F06",
        sev: "High",
        status: "Partially Resolved",
        cat: "Key Management",
        title: "Issuer signing key stored in plaintext .env on host",
        loc: "offchain/.env (ISSUER_PRIVATE_KEY_HEX)",
        impact: "Organization decryption keys are no longer stored on the server (holder ML-KEM keys are managed client-side in QWallet). However, the issuer ML-DSA-44 signing key (ISSUER_PRIVATE_KEY_HEX) resides in plaintext in .env, risking unauthorized credential forging if the host is compromised.",
        rec: "Migrate the issuer signing key to a hardware security module (HSM) or cloud KMS using PKCS#11. Restrict file permissions and implement key rotation procedures."
    },
    {
        id: "F07",
        sev: "High",
        status: "Active",
        cat: "Confidentiality",
        title: "Holder PII stored in plaintext in MySQL",
        loc: "qchain-network/scripts/schema.sql (holders table)",
        impact: "Demographic attributes (emirates_id, first_name, last_name, email, phone, college) are stored in cleartext MySQL columns. Track B encrypted off-chain credential bodies, but database-level PII encryption (Track C) has not yet been applied.",
        rec: "Implement application-layer column encryption (Track C) for sensitive holder attributes using AES-256-GCM, and use salted blind indexes for query lookups."
    },
    {
        id: "F22",
        sev: "High",
        status: "Active",
        cat: "Key Management",
        title: "Holder public key overwrite and key hijacking vulnerability",
        loc: "offchain/mobile.go:handleRegisterHolderKeys, QChaincode.js:bindHolderKeys",
        impact: "The chaincode method bindHolderKeys does not verify whether public keys have already been bound for a holder. Combined with an unauthenticated /mobile/registerHolderKeys endpoint, an attacker can overwrite any victim's registered ML-KEM and ML-DSA public keys. New credentials will be encrypted to the attacker, and the attacker can sign fraudulent presentations as the victim.",
        rec: "Enforce one-time immutability in chaincode: reject bindHolderKeys if holder.KemPublicKey is already set. Require authenticated holder verification before registering or updating keys."
    },
    {
        id: "F08",
        sev: "Medium",
        status: "Resolved",
        cat: "Non-repudiation",
        title: "Holder presentations are not signed",
        loc: "offchain/mobile.go, offchain/verification.go:153",
        impact: "Previously, presentation sessions were server-minted rows; holders never signed presentation challenges, allowing potential repudiation.",
        rec: "RESOLVED (Track H): Mobile presentations now require an ML-DSA-44 signature (HolderSignature) over the presentation payload (DisclosedPayload), verified against the holder's on-chain DSA public key before verification succeeds."
    },
    {
        id: "F09",
        sev: "Medium",
        status: "Active",
        cat: "Secrets",
        title: "Default/hard-coded credentials in config",
        loc: "docker-compose.yaml (CouchDB adminpw), fabric-ca-server-config.yaml",
        impact: "CouchDB uses default credentials (admin:adminpw) in environment variables and healthcheck URLs. Fabric CA configurations and bootstrap scripts also default to admin:adminpw, presenting guessable footholds on publicly accessible networks.",
        rec: "Replace all default credentials with cryptographically random secrets injected via secure environment variables. Restrict CouchDB (5984) and CA ports to internal Docker networks."
    },
    {
        id: "F10",
        sev: "Medium",
        status: "Active",
        cat: "Availability",
        title: "No request body-size limit on API handlers",
        loc: "offchain/httputil.go:decodeBody",
        impact: "decodeBody decodes r.Body using json.NewDecoder without an http.MaxBytesReader limit. An attacker can stream oversized HTTP POST payloads to consume backend memory and cause a denial-of-service.",
        rec: "Wrap all request bodies with http.MaxBytesReader(w, r.Body, maxBytesLimit) (e.g. 1MB - 5MB) and return HTTP 413 Payload Too Large on overflow."
    },
    {
        id: "F11",
        sev: "Medium",
        status: "Resolved",
        cat: "Confidentiality",
        title: "Selective disclosure is cosmetic only",
        loc: "offchain/commitment.go, offchain/verification.go",
        impact: "Previously, hidden fields were simply redacted in memory after the server decrypted the full credential payload.",
        rec: "RESOLVED: QChain implemented true cryptographic selective disclosure. Credentials commit to salted field hashes (SHA3(salt:field:value)); salts remain with the holder, and only disclosed attributes and salts are transmitted and verified on-chain."
    },
    {
        id: "F12",
        sev: "Medium",
        status: "Active",
        cat: "Correctness",
        title: "Mobile-session redemption is not atomic (replay window)",
        loc: "offchain/mobile.go:handleResolveSession",
        impact: "handleResolveSession reads the session record, executes on-chain verification, and calls deleteMobileSession only upon conclusion. Concurrent requests with the same token can race during the verification window and both pass validation before deletion.",
        rec: "Execute atomic session consumption using a single SQL UPDATE ... SET is_used = 1 WHERE id = ? AND is_used = 0, verifying that exactly one row was updated before proceeding."
    },
    {
        id: "F13",
        sev: "Medium",
        status: "Active",
        cat: "Non-repudiation",
        title: "Audit and event logs are mutable, off-chain and unsigned",
        loc: "offchain/db_audit.go, MySQL portal_audit_log",
        impact: "System audit logs and operational events reside in mutable MySQL tables without cryptographic signing or blockchain anchoring. Anyone with database access (or via dev cleanup endpoints) can tamper with or delete audit entries.",
        rec: "Sign audit log entries using the organization key or anchor periodic Merkle tree root hashes onto the Fabric ledger to provide tamper-evidence."
    },
    {
        id: "F14",
        sev: "Medium",
        status: "Active",
        cat: "Hardening",
        title: "Gateway lacks security headers and rate-limiting",
        loc: "web-gateway/nginx.conf",
        impact: "The Nginx gateway sets only X-Content-Type-Options: nosniff. It lacks HSTS, Content-Security-Policy (CSP), X-Frame-Options, and Referrer-Policy. Furthermore, no limit_req rate-limiting is configured in front of the /api/ reverse proxy.",
        rec: "Add HSTS, strict CSP, X-Frame-Options: DENY, and Referrer-Policy: strict-origin-when-cross-origin. Configure Nginx limit_req zones to throttle aggressive API calling."
    },
    {
        id: "F15",
        sev: "Medium",
        status: "Partially Resolved",
        cat: "Supply Chain",
        title: "Unpinned :latest Docker images",
        loc: "qchain-network/docker/docker-compose.yaml",
        impact: "The broken server_test.go file was completely rewritten and now passes cleanly. However, Docker compose files continue using :latest tags for hyperledger/fabric-peer, fabric-orderer, and ipfs/kubo, leaving deployments vulnerable to breaking upstream changes.",
        rec: "Pin all container images to explicit, tested semantic version tags (e.g. hyperledger/fabric-peer:2.5.9, ipfs/kubo:v0.26.0)."
    },
    {
        id: "F23",
        sev: "Medium",
        status: "Active",
        cat: "Information Disclosure",
        title: "Unauthenticated holder enumeration and demographic PII harvesting",
        loc: "offchain/mobile.go (/mobile/checkKeys, /mobile/getHolderProfile), holders.go",
        impact: "Unauthenticated endpoints (/mobile/checkKeys?emiratesID=... and /mobile/getHolderProfile?emiratesID=...) allow arbitrary callers to query any Emirates ID and retrieve full names, emails, colleges, and key-binding status. In addition, GET /getHolders returns the entire registered holder registry without authentication.",
        rec: "Require holder session authentication for profile and key lookups. Restrict /getHolders to authorized staff sessions and implement query rate limiting."
    },
    {
        id: "F24",
        sev: "Medium",
        status: "Active",
        cat: "Authorization",
        title: "Unauthenticated staff invitation, role alteration, and deletion",
        loc: "offchain/staff.go (handleInviteStaff, handleUpdateStaffRole, handleDeleteStaff)",
        impact: "Staff administration routes (/inviteStaff, /updateStaffRole, /deleteStaff) have no authentication. Anyone can invite staff into schemaManager or policyManager roles, modify privileges, or delete staff members, with actions falsely attributed to hardcoded administrators in audit logs.",
        rec: "Enforce admin session verification on all staff management endpoints, ensuring only verified organization administrators can modify staff privileges."
    },
    {
        id: "F16",
        sev: "Low",
        status: "Active",
        cat: "Build / Config",
        title: "Backend build path and chaincode-name inconsistencies",
        loc: "docker-compose.yaml (context ../../offchain/go-bindings), config.go",
        impact: "docker-compose.yaml points to a stale build context (../../offchain/go-bindings), and CHAINCODE_NAME is defined as 'QChaincode' in compose but defaults to 'qchaincode' in config.go, creating deployment confusion.",
        rec: "Update compose build context to 'offchain/' and standardize chaincode naming casing across compose, config.go, and deployment scripts."
    },
    {
        id: "F17",
        sev: "Low",
        status: "Active",
        cat: "Confidentiality",
        title: "IPFS re-encrypt cannot recall already-exposed plaintext",
        loc: "Distributed IPFS network",
        impact: "Plaintext credential bodies published to public IPFS gateways prior to encryption cannot be revoked or erased from third-party IPFS peer caches. This is an inherent property of distributed hash-addressed storage.",
        rec: "Document this storage limitation clearly. Assume any pre-encryption IPFS CID may remain cached, and reissue sensitive credentials."
    },
    {
        id: "F18",
        sev: "Low",
        status: "Active",
        cat: "Availability",
        title: "Multiple single points of failure",
        loc: "docker-compose.yaml (1 orderer, 1 peer/org, 1 IPFS, 1 MySQL, 1 VM)",
        impact: "The demonstration network operates on a single VM with a single Raft consenter, single peer per organization, and single IPFS/MySQL node. Any service failure halts issuance and verification.",
        rec: "For production: deploy multi-consenter Raft ordering, redundant peer nodes across distinct availability zones, an IPFS cluster, and high-availability MySQL replication."
    },
    {
        id: "F19",
        sev: "Low",
        status: "Active",
        cat: "Availability",
        title: "Public demo is open with no access control",
        loc: "setup-tailscale-funnel.sh",
        impact: "The research demonstration is exposed directly to the public web via Tailscale Funnel without an authentication barrier, leaving the unauthenticated API open to internet-wide probing.",
        rec: "Place the public demo behind HTTP basic authentication or an IP allowlist while API authentication (F01) is being integrated."
    },
    {
        id: "F20",
        sev: "Low",
        status: "Resolved",
        cat: "Hardening",
        title: "IPFS upload failure silently proceeds without a CID",
        loc: "offchain/credentials.go:handleIssueCredential",
        impact: "Previously, an IPFS upload failure during issuance logged an error but allowed issuance to proceed with an empty CID.",
        rec: "RESOLVED: handleIssueCredential now aborts immediately on IPFS upload failure (returning HTTP 502 Bad Gateway), and chaincode strictly validates IPFS CIDs via regex."
    },
    {
        id: "F25",
        sev: "Low",
        status: "Active",
        cat: "Information Disclosure",
        title: "Unrestricted public scraping of encrypted credential envelopes",
        loc: "offchain/mobile.go:handleGetEnvelope",
        impact: "The endpoint /mobile/getEnvelope?credentialID=... returns IPFS ciphertext envelopes without verifying whether the requester is the legitimate credential holder. While ciphertext is ML-KEM protected, unrestricted scraping leaks issuance timing, envelope sizes, and active CIDs.",
        rec: "Require holder session tokens or active presentation tokens before returning encrypted envelope ciphertext from IPFS."
    }
];

const strengths = [
    { title: "Post-Quantum Credential Signatures (ML-DSA-44)", body: "FIPS 204 compliant ML-DSA-44 via liboqs signs SHA3-256 canonical commitments. Signatures and verification are symmetric, rigorous, and tested against quantum forgeability." },
    { title: "On-Chain Commitment Integrity Verification", body: "Verification re-hashes canonical commitment objects from ledger state and validates the issuer's ML-DSA-44 signature directly; the database is never trusted for cryptographic decisions." },
    { title: "Cryptographic Selective Disclosure (Track H)", body: "Replaced cosmetic redaction with mathematical per-field salted SHA3-256 commitments. Salts remain solely with the holder; undisclosed fields are never transmitted or exposed to verifiers." },
    { title: "Holder-Signed Presentations (ML-DSA-44)", body: "Presentations require an ML-DSA-44 digital signature from the holder's on-chain public key over the presentation payload, providing genuine non-repudiation and stopping impersonation." },
    { title: "Hardware Secure Key Storage in QWallet", body: "Holder ML-KEM and ML-DSA private keys are generated on-device and stored in iOS Keychain / Android Keystore with chunking and post-write verification; private keys never leave the phone." },
    { title: "Robust Hybrid KEM-DEM Envelope Cryptography", body: "Track B hybrid encryption pairs ML-KEM-768 with AES-256-GCM and HKDF-SHA3-256 using single-use per-field wrapping keys, preventing cross-field or cross-credential ciphertext manipulation." },
    { title: "Fail-Closed Verification Architecture", body: "If on-chain state, IPFS envelopes, or commitment hashes fail to resolve or mismatch, verification terminates immediately with specific error codes rather than falling back to valid." },
    { title: "SQL Injection Immune (Fully Parameterized)", body: "Every database query across offchain/ utilizes SQL placeholders and parameter slices, including dynamic search and status filtering. Zero SQL injection flaws were identified." },
    { title: "Fail-Fast IPFS Integration & Validation", body: "Credential issuance halts immediately upon IPFS upload failure, and chaincode strictly validates IPFS CID formatting before embedding it into the signed commitment." },
    { title: "Comprehensive Automated Off-Chain Test Suite", body: "Rewritten server_test.go, verification_test.go, and commitment_test.go provide clean, compiling test coverage for ML-DSA round-trips, timezone formatting, and handler validation." }
];
