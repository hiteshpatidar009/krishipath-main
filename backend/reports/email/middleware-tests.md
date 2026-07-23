# email Middleware Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | /send | 401/403/400/404 or public status | blocked | 401 | 162.633ms | pass |  |
