# push-notification Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=1 |  | 12.327ms | pass |  |
| security | blocks SQL injection payload | POST | /send | payload blocked before mutation | blocked | 401 | 87.930ms | pass |  |
| security | blocks XSS payload | POST | /send | payload blocked before mutation | blocked | 401 | 27.625ms | pass |  |
