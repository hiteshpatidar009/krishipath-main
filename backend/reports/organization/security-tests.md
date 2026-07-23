# organization Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=9 |  | 32.285ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 26.610ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 52.934ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:organizationId | payload blocked before mutation | blocked | 401 | 25.248ms | pass |  |
| security | blocks XSS payload | PATCH | /:organizationId | payload blocked before mutation | blocked | 401 | 22.694ms | pass |  |
| security | blocks SQL injection payload | POST | /:organizationId/invitations | payload blocked before mutation | blocked | 401 | 30.113ms | pass |  |
| security | blocks XSS payload | POST | /:organizationId/invitations | payload blocked before mutation | blocked | 401 | 23.401ms | pass |  |
| security | blocks SQL injection payload | POST | /:organizationId/roles | payload blocked before mutation | blocked | 401 | 35.220ms | pass |  |
| security | blocks XSS payload | POST | /:organizationId/roles | payload blocked before mutation | blocked | 401 | 50.622ms | pass |  |
| security | blocks SQL injection payload | POST | /:organizationId/activate | payload blocked before mutation | blocked | 401 | 23.842ms | pass |  |
| security | blocks XSS payload | POST | /:organizationId/activate | payload blocked before mutation | blocked | 401 | 35.303ms | pass |  |
| security | blocks SQL injection payload | POST | /:organizationId/suspend | payload blocked before mutation | blocked | 401 | 30.105ms | pass |  |
| security | blocks XSS payload | POST | /:organizationId/suspend | payload blocked before mutation | blocked | 401 | 31.884ms | pass |  |
| security | blocks SQL injection payload | POST | /:organizationId/warehouses | payload blocked before mutation | blocked | 401 | 18.495ms | pass |  |
| security | blocks XSS payload | POST | /:organizationId/warehouses | payload blocked before mutation | blocked | 401 | 17.808ms | pass |  |
