# Stress Response

Eight-scenario, author-created response-choice reflection at `/stress-response/`. It is not a diagnostic or validated assessment.

## Release contract

- Ads remain suspended while the 2026-09-03 invalid-traffic restriction is active.
- Funnel: `stress_response_view -> start -> progress -> complete`, plus success-only `share`, `next_click`, and delegated `related_click`.
- Events contain only `event_category`; answers, labels, scores, locale, URL, and timing stay private.
- Each answer adds one point to its displayed response label; the first matching label breaks ties.
- Verify from the workspace root with `npm run verify:stress-response`.
