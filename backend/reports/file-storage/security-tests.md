# file-storage Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=1 |  | 18.587ms | pass |  |
| security | blocks SQL injection payload | POST | /sign | payload blocked before mutation | blocked | 401 | 21.038ms | pass |  |
| security | blocks XSS payload | POST | /sign | payload blocked before mutation | blocked | 401 | 20.210ms | pass |  |
