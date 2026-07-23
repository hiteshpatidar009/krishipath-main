# sms API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | /send | 401/403/400/404 or public status | blocked | 401 | 68.888ms | pass |  |
| validation | rejects malformed payload | POST | /send | validation or auth rejection | blocked | 401 | 14.170ms | pass |  |
| security | blocks SQL injection payload | POST | /send | payload blocked before mutation | blocked | 401 | 10.665ms | pass |  |
| security | blocks XSS payload | POST | /send | payload blocked before mutation | blocked | 401 | 10.345ms | pass |  |
| performance | records oversized payload behavior | POST | /send | bounded response without crash | blocked | 401 | 12.570ms | pass |  |
