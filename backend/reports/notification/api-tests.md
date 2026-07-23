# notification API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | / | 401/403/400/404 or public status | blocked | 401 | 159.000ms | pass |  |
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 128.386ms | pass |  |
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 34.523ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 33.547ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 37.578ms | pass |  |
| performance | records oversized payload behavior | POST | / | bounded response without crash | blocked | 401 | 51.072ms | pass |  |
| middleware | blocks unauthenticated access | GET | /templates | 401/403/400/404 or public status | blocked | 401 | 96.546ms | pass |  |
| middleware | blocks unauthenticated access | POST | /templates | 401/403/400/404 or public status | blocked | 401 | 78.177ms | pass |  |
| validation | rejects malformed payload | POST | /templates | validation or auth rejection | blocked | 401 | 58.416ms | pass |  |
| security | blocks SQL injection payload | POST | /templates | payload blocked before mutation | blocked | 401 | 26.006ms | pass |  |
| security | blocks XSS payload | POST | /templates | payload blocked before mutation | blocked | 401 | 18.558ms | pass |  |
| performance | records oversized payload behavior | POST | /templates | bounded response without crash | blocked | 401 | 35.651ms | pass |  |
