# notification Middleware Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | / | 401/403/400/404 or public status | blocked | 401 | 159.000ms | pass |  |
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 128.386ms | pass |  |
| middleware | blocks unauthenticated access | GET | /templates | 401/403/400/404 or public status | blocked | 401 | 96.546ms | pass |  |
| middleware | blocks unauthenticated access | POST | /templates | 401/403/400/404 or public status | blocked | 401 | 78.177ms | pass |  |
