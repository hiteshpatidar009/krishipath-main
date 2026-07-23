# email Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=1 |  | 21.261ms | pass |  |
| security | blocks SQL injection payload | POST | /send | payload blocked before mutation | blocked | 401 | 33.779ms | pass |  |
| security | blocks XSS payload | POST | /send | payload blocked before mutation | blocked | 401 | 24.102ms | pass |  |
