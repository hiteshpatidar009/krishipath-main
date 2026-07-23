# audit-log Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=2 |  | 18.670ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 44.658ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 31.151ms | pass |  |
