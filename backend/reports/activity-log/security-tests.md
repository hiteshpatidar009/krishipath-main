# activity-log Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=2 |  | 25.784ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 22.305ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 23.854ms | pass |  |
