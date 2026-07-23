# sms Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=1 |  | 5.912ms | pass |  |
| security | blocks SQL injection payload | POST | /send | payload blocked before mutation | blocked | 401 | 10.665ms | pass |  |
| security | blocks XSS payload | POST | /send | payload blocked before mutation | blocked | 401 | 10.345ms | pass |  |
