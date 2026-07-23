# email API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | /send | 401/403/400/404 or public status | blocked | 401 | 162.633ms | pass |  |
| validation | rejects malformed payload | POST | /send | validation or auth rejection | blocked | 401 | 33.784ms | pass |  |
| security | blocks SQL injection payload | POST | /send | payload blocked before mutation | blocked | 401 | 33.779ms | pass |  |
| security | blocks XSS payload | POST | /send | payload blocked before mutation | blocked | 401 | 24.102ms | pass |  |
| performance | records oversized payload behavior | POST | /send | bounded response without crash | blocked | 401 | 26.321ms | pass |  |
