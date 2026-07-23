# activity-log Middleware Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | / | 401/403/400/404 or public status | blocked | 401 | 163.770ms | pass |  |
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 120.709ms | pass |  |
