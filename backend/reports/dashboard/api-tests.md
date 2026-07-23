# dashboard API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | /overview | 401/403/400/404 or public status | blocked | 401 | 69.222ms | pass |  |
| middleware | blocks unauthenticated access | GET | /home | 401/403/400/404 or public status | blocked | 401 | 26.970ms | pass |  |
