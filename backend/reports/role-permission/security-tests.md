# role-permission Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=16 |  | 18.540ms | pass |  |
| security | blocks SQL injection payload | POST | /roles | payload blocked before mutation | blocked | 401 | 30.351ms | pass |  |
| security | blocks XSS payload | POST | /roles | payload blocked before mutation | blocked | 401 | 74.738ms | pass |  |
| security | blocks SQL injection payload | PATCH | /roles/:roleId | payload blocked before mutation | blocked | 401 | 23.938ms | pass |  |
| security | blocks XSS payload | PATCH | /roles/:roleId | payload blocked before mutation | blocked | 401 | 26.039ms | pass |  |
| security | blocks SQL injection payload | DELETE | /roles/:roleId | payload blocked before mutation | blocked | 401 | 29.165ms | pass |  |
| security | blocks XSS payload | DELETE | /roles/:roleId | payload blocked before mutation | blocked | 401 | 50.379ms | pass |  |
| security | blocks SQL injection payload | POST | /roles/:roleId/permissions | payload blocked before mutation | blocked | 401 | 24.137ms | pass |  |
| security | blocks XSS payload | POST | /roles/:roleId/permissions | payload blocked before mutation | blocked | 401 | 29.029ms | pass |  |
| security | blocks SQL injection payload | POST | /roles/:roleId/clone | payload blocked before mutation | blocked | 401 | 23.733ms | pass |  |
| security | blocks XSS payload | POST | /roles/:roleId/clone | payload blocked before mutation | blocked | 401 | 24.526ms | pass |  |
| security | blocks SQL injection payload | POST | /roles/:roleId/retire | payload blocked before mutation | blocked | 401 | 23.378ms | pass |  |
| security | blocks XSS payload | POST | /roles/:roleId/retire | payload blocked before mutation | blocked | 401 | 23.031ms | pass |  |
| security | blocks SQL injection payload | POST | /roles/:roleId/restore | payload blocked before mutation | blocked | 401 | 17.148ms | pass |  |
| security | blocks XSS payload | POST | /roles/:roleId/restore | payload blocked before mutation | blocked | 401 | 21.145ms | pass |  |
| security | blocks SQL injection payload | PUT | /permissions/matrix | payload blocked before mutation | blocked | 401 | 14.258ms | pass |  |
| security | blocks XSS payload | PUT | /permissions/matrix | payload blocked before mutation | blocked | 401 | 19.556ms | pass |  |
| security | blocks SQL injection payload | POST | /permissions/publish | payload blocked before mutation | blocked | 401 | 15.950ms | pass |  |
| security | blocks XSS payload | POST | /permissions/publish | payload blocked before mutation | blocked | 401 | 20.515ms | pass |  |
| security | blocks SQL injection payload | POST | /permissions/compare | payload blocked before mutation | blocked | 401 | 16.814ms | pass |  |
| security | blocks XSS payload | POST | /permissions/compare | payload blocked before mutation | blocked | 401 | 18.118ms | pass |  |
