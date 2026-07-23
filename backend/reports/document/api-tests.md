# document API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 190.674ms | pass |  |
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 25.013ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 22.189ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 20.154ms | pass |  |
| performance | records oversized payload behavior | POST | / | bounded response without crash | blocked | 401 | 37.130ms | pass |  |
| middleware | blocks unauthenticated access | GET | / | 401/403/400/404 or public status | blocked | 401 | 21.112ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:id | 401/403/400/404 or public status | blocked | 401 | 26.382ms | pass |  |
