# company Middleware Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | / | 401/403/400/404 or public status | blocked | 401 | 119.900ms | pass |  |
| middleware | blocks unauthenticated access | GET | /allowance | 401/403/400/404 or public status | blocked | 401 | 65.835ms | pass |  |
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 152.493ms | pass |  |
| middleware | blocks unauthenticated access | POST | /organizations | 401/403/400/404 or public status | blocked | 401 | 25.969ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /settings | 401/403/400/404 or public status | blocked | 401 | 32.288ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /organizations/:organizationId/settings | 401/403/400/404 or public status | blocked | 401 | 15.120ms | pass |  |
| middleware | blocks unauthenticated access | POST | /access/organization | 401/403/400/404 or public status | blocked | 401 | 16.539ms | pass |  |
| middleware | blocks unauthenticated access | POST | /access/warehouse | 401/403/400/404 or public status | blocked | 401 | 15.895ms | pass |  |
| middleware | blocks unauthenticated access | POST | /suspend | 401/403/400/404 or public status | blocked | 401 | 23.328ms | pass |  |
| middleware | blocks unauthenticated access | POST | /activate | 401/403/400/404 or public status | blocked | 401 | 19.490ms | pass |  |
| middleware | blocks unauthenticated access | POST | /subscription/link | 401/403/400/404 or public status | blocked | 401 | 17.854ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /onboarding | 401/403/400/404 or public status | blocked | 401 | 19.387ms | pass |  |
