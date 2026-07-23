# file-storage Middleware Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | /sign | 401/403/400/404 or public status | blocked | 401 | 175.540ms | pass |  |
