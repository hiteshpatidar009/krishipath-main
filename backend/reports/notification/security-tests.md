# notification Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=4 |  | 27.925ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 33.547ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 37.578ms | pass |  |
| security | blocks SQL injection payload | POST | /templates | payload blocked before mutation | blocked | 401 | 26.006ms | pass |  |
| security | blocks XSS payload | POST | /templates | payload blocked before mutation | blocked | 401 | 18.558ms | pass |  |
