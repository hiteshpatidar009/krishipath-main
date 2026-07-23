# auth Middleware Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | /status | 401/403/400/404 or public status | public-health | 200 | 6.225ms | pass |  |
| middleware | blocks unauthenticated access | GET | /captcha/start | 401/403/400/404 or public status | public-health | 200 | 11.507ms | pass |  |
| middleware | blocks unauthenticated access | POST | /signup | 401/403/400/404 or public status | blocked | 422 | 26.042ms | pass |  |
| middleware | blocks unauthenticated access | POST | /login | 401/403/400/404 or public status | blocked | 422 | 27.652ms | pass |  |
| middleware | blocks unauthenticated access | POST | /mfa/start | 401/403/400/404 or public status | blocked | 422 | 25.109ms | pass |  |
| middleware | blocks unauthenticated access | POST | /mfa/verify | 401/403/400/404 or public status | blocked | 422 | 185.979ms | pass |  |
| middleware | blocks unauthenticated access | POST | /refresh | 401/403/400/404 or public status | blocked | 400 | 613.692ms | pass |  |
| middleware | blocks unauthenticated access | POST | /switch-company | 401/403/400/404 or public status | blocked | 400 | 27.954ms | pass |  |
| middleware | blocks unauthenticated access | POST | /password/forgot | 401/403/400/404 or public status | blocked | 422 | 25.058ms | pass |  |
| middleware | blocks unauthenticated access | POST | /password/reset | 401/403/400/404 or public status | blocked | 422 | 26.684ms | pass |  |
| middleware | blocks unauthenticated access | POST | /password-reset/request | 401/403/400/404 or public status | blocked | 422 | 24.421ms | pass |  |
| middleware | blocks unauthenticated access | POST | /password-reset/validate | 401/403/400/404 or public status | blocked | 422 | 6.681ms | pass |  |
| middleware | blocks unauthenticated access | POST | /password-reset/complete | 401/403/400/404 or public status | blocked | 422 | 29.265ms | pass |  |
| middleware | blocks unauthenticated access | POST | /plan | 401/403/400/404 or public status | blocked | 401 | 5.479ms | pass |  |
| middleware | blocks unauthenticated access | POST | /subscription/activate | 401/403/400/404 or public status | blocked | 401 | 6.441ms | pass |  |
| middleware | blocks unauthenticated access | GET | /mfa/methods | 401/403/400/404 or public status | blocked | 401 | 6.376ms | pass |  |
| middleware | blocks unauthenticated access | GET | /sessions | 401/403/400/404 or public status | blocked | 401 | 7.782ms | pass |  |
| middleware | blocks unauthenticated access | GET | /mfa/trust-sessions | 401/403/400/404 or public status | blocked | 401 | 8.285ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /mfa/trust-sessions | 401/403/400/404 or public status | blocked | 401 | 8.462ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /mfa/trust-sessions/all | 401/403/400/404 or public status | blocked | 401 | 5.151ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /sessions | 401/403/400/404 or public status | blocked | 401 | 5.875ms | pass |  |
| middleware | blocks unauthenticated access | POST | /sessions/revoke-others | 401/403/400/404 or public status | blocked | 401 | 5.535ms | pass |  |
| middleware | blocks unauthenticated access | POST | /roles | 401/403/400/404 or public status | blocked | 401 | 5.850ms | pass |  |
| middleware | blocks unauthenticated access | GET | /roles | 401/403/400/404 or public status | blocked | 401 | 5.642ms | pass |  |
| middleware | blocks unauthenticated access | GET | /permissions | 401/403/400/404 or public status | blocked | 401 | 4.614ms | pass |  |
| middleware | blocks unauthenticated access | POST | /users | 401/403/400/404 or public status | blocked | 401 | 7.729ms | pass |  |
| middleware | blocks unauthenticated access | GET | /me | 401/403/400/404 or public status | blocked | 401 | 7.113ms | pass |  |
