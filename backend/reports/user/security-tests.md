# user Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=24 |  | 2.565ms | pass |  |
| security | blocks SQL injection payload | POST | /invitations/accept | payload blocked before mutation | blocked | 409 | 336.118ms | pass |  |
| security | blocks XSS payload | POST | /invitations/accept | payload blocked before mutation | blocked | 409 | 44.420ms | pass |  |
| security | blocks SQL injection payload | POST | /invitations/:id/resend | payload blocked before mutation | blocked | 401 | 4.957ms | pass |  |
| security | blocks XSS payload | POST | /invitations/:id/resend | payload blocked before mutation | blocked | 401 | 5.589ms | pass |  |
| security | blocks SQL injection payload | POST | /invitations/:id/revoke | payload blocked before mutation | blocked | 401 | 3.870ms | pass |  |
| security | blocks XSS payload | POST | /invitations/:id/revoke | payload blocked before mutation | blocked | 401 | 3.527ms | pass |  |
| security | blocks SQL injection payload | POST | /bulk-action | payload blocked before mutation | blocked | 401 | 3.542ms | pass |  |
| security | blocks XSS payload | POST | /bulk-action | payload blocked before mutation | blocked | 401 | 3.334ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 3.556ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 3.728ms | pass |  |
| security | blocks SQL injection payload | PUT | /:userId/warehouses | payload blocked before mutation | blocked | 401 | 5.415ms | pass |  |
| security | blocks XSS payload | PUT | /:userId/warehouses | payload blocked before mutation | blocked | 401 | 5.572ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:userId | payload blocked before mutation | blocked | 401 | 4.068ms | pass |  |
| security | blocks XSS payload | PATCH | /:userId | payload blocked before mutation | blocked | 401 | 3.536ms | pass |  |
| security | blocks SQL injection payload | POST | /:userId/roles | payload blocked before mutation | blocked | 401 | 4.519ms | pass |  |
| security | blocks XSS payload | POST | /:userId/roles | payload blocked before mutation | blocked | 401 | 4.405ms | pass |  |
| security | blocks SQL injection payload | POST | /:userId/activate | payload blocked before mutation | blocked | 401 | 4.744ms | pass |  |
| security | blocks XSS payload | POST | /:userId/activate | payload blocked before mutation | blocked | 401 | 3.915ms | pass |  |
| security | blocks SQL injection payload | POST | /:userId/suspend | payload blocked before mutation | blocked | 401 | 7.138ms | pass |  |
| security | blocks XSS payload | POST | /:userId/suspend | payload blocked before mutation | blocked | 401 | 3.957ms | pass |  |
| security | blocks SQL injection payload | POST | /:userId/restore | payload blocked before mutation | blocked | 401 | 7.304ms | pass |  |
| security | blocks XSS payload | POST | /:userId/restore | payload blocked before mutation | blocked | 401 | 8.287ms | pass |  |
| security | blocks SQL injection payload | POST | /:userId/reset-password | payload blocked before mutation | blocked | 401 | 5.980ms | pass |  |
| security | blocks XSS payload | POST | /:userId/reset-password | payload blocked before mutation | blocked | 401 | 4.420ms | pass |  |
| security | blocks SQL injection payload | POST | /:userId/reset-mfa | payload blocked before mutation | blocked | 401 | 5.495ms | pass |  |
| security | blocks XSS payload | POST | /:userId/reset-mfa | payload blocked before mutation | blocked | 401 | 7.028ms | pass |  |
| security | blocks SQL injection payload | POST | /:userId/terminate-sessions | payload blocked before mutation | blocked | 401 | 4.286ms | pass |  |
| security | blocks XSS payload | POST | /:userId/terminate-sessions | payload blocked before mutation | blocked | 401 | 4.026ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:userId/preferences | payload blocked before mutation | blocked | 401 | 3.637ms | pass |  |
| security | blocks XSS payload | PATCH | /:userId/preferences | payload blocked before mutation | blocked | 401 | 4.329ms | pass |  |
