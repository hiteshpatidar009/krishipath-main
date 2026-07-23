# audit-log API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | / | 401/403/400/404 or public status | blocked | 401 | 104.084ms | pass |  |
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 98.430ms | pass |  |
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 30.697ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 44.658ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 31.151ms | pass |  |
| performance | records oversized payload behavior | POST | / | bounded response without crash | blocked | 401 | 30.596ms | pass |  |
