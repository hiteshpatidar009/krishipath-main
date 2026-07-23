# push-notification API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | /send | 401/403/400/404 or public status | blocked | 401 | 277.118ms | pass |  |
| validation | rejects malformed payload | POST | /send | validation or auth rejection | blocked | 401 | 30.948ms | pass |  |
| security | blocks SQL injection payload | POST | /send | payload blocked before mutation | blocked | 401 | 87.930ms | pass |  |
| security | blocks XSS payload | POST | /send | payload blocked before mutation | blocked | 401 | 27.625ms | pass |  |
| performance | records oversized payload behavior | POST | /send | bounded response without crash | blocked | 401 | 47.362ms | pass |  |
