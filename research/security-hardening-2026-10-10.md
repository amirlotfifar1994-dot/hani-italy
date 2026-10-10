# Security and viewport release — 2026-10-10

Scope: owner-requested security hardening and a first homepage viewport containing navigation and hero, with categories below the fold. This is not an independent penetration test or a guarantee of complete security.

## Implementation

- Mandatory production administrator TOTP; encrypted secrets, expiring enrolment, replay prevention, single-use hashed recovery codes and a management gate.
- Secure host-prefix cookies, shorter idle/absolute expiry, session rotation, five-session cap and full revocation. Password verification and OAuth linking revalidate session/password state after asynchronous work.
- Durable keyed rate limits, redacted bounded audit events, expiring strong owner provisioning and private file permissions.
- Global response policies including HSTS and CSP without executable inline scripts. SSR data is inert JSON read by the external bootstrap. Existing inline styles and Google Fonts are retained.
- Sharp 0.35.5, explicit SVG decoder block, image signature validation, WebP re-encoding and a 200 MB uploaded-media quota.
- Root-mounted container volume ownership preparation followed by privilege drop before HTTP startup.
- Hero min-height calculated from the viewport minus the actual announcement/navigation heights, observed on resize and font readiness. Mobile photo sizing preserves hero content without bringing categories into the opening view.

## Verification

Complete existing authentication/catalogue/comments/SEO checks and isolated hosting checks passed. Additional security tests cover RFC 6238 vectors, role/MFA isolation, replay and recovery persistence, session revocation/expiry and rate-limit persistence. A concurrent password-change/old-password-login regression also passed. `npm audit` reports no known vulnerabilities for the installed dependency tree at release preparation.

An isolated Edge/Playwright browser run passed Persian/Italian/English home hydration, 1440×900, 1882×913, 618×895 and 390×844 layouts, no horizontal overflow, mandatory owner MFA, one-time recovery display, audit view and recovery sign-in. An inline-script injection canary was blocked by the actual browser CSP. Font-provider requests are intercepted for this local run to exercise the system-font fallback; this test does not claim Google Fonts loaded.

CI separately validates the production Docker image with a root-owned persistent volume and asserts the running application UID is 1000. The release must pass CI and be verified on Railway before it is reported as published. Runtime data and credentials are excluded from source control. See SECURITY.md for backups, recovery and remaining infrastructure work.

References: [OWASP response headers](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html), [session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [CSP](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html), [TOTP standard](https://www.rfc-editor.org/info/rfc6238/), [Sharp advisory and patched release](https://github.com/advisories/GHSA-wq5f-xc86-pv6w).
