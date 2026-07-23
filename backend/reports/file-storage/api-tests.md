# file-storage API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | /sign | 401/403/400/404 or public status | blocked | 401 | 175.540ms | pass |  |
| validation | rejects malformed payload | POST | /sign | validation or auth rejection | blocked | 401 | 33.356ms | pass |  |
| security | blocks SQL injection payload | POST | /sign | payload blocked before mutation | blocked | 401 | 21.038ms | pass |  |
| security | blocks XSS payload | POST | /sign | payload blocked before mutation | blocked | 401 | 20.210ms | pass |  |
| performance | records oversized payload behavior | POST | /sign | bounded response without crash | blocked | 401 | 26.487ms | pass |  |
