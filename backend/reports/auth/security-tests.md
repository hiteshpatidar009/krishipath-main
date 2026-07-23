# auth Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=27 |  | 9.204ms | pass |  |
| security | blocks SQL injection payload | POST | /signup | payload blocked before mutation | blocked | 409 | 51.160ms | pass |  |
| security | blocks XSS payload | POST | /signup | payload blocked before mutation | blocked | 409 | 40.218ms | pass |  |
| security | blocks SQL injection payload | POST | /login | payload blocked before mutation | blocked | 409 | 45.376ms | pass |  |
| security | blocks XSS payload | POST | /login | payload blocked before mutation | blocked | 409 | 41.584ms | pass |  |
| security | blocks SQL injection payload | POST | /mfa/start | payload blocked before mutation | blocked | 500 | 36.675ms | pass |  |
| security | blocks XSS payload | POST | /mfa/start | payload blocked before mutation | blocked | 500 | 202.595ms | pass |  |
| security | blocks SQL injection payload | POST | /mfa/verify | payload blocked before mutation | blocked | 500 | 75.588ms | pass |  |
| security | blocks XSS payload | POST | /mfa/verify | payload blocked before mutation | blocked | 500 | 490.609ms | pass |  |
| security | blocks SQL injection payload | POST | /refresh | payload blocked before mutation | blocked | 409 | 51.240ms | pass |  |
| security | blocks XSS payload | POST | /refresh | payload blocked before mutation | blocked | 409 | 41.647ms | pass |  |
| security | blocks SQL injection payload | POST | /switch-company | payload blocked before mutation | blocked | 409 | 47.155ms | pass |  |
| security | blocks XSS payload | POST | /switch-company | payload blocked before mutation | blocked | 409 | 47.903ms | pass |  |
| security | blocks SQL injection payload | POST | /password/forgot | payload blocked before mutation | blocked | 409 | 49.932ms | pass |  |
| security | blocks XSS payload | POST | /password/forgot | payload blocked before mutation | blocked | 409 | 41.783ms | pass |  |
| security | blocks SQL injection payload | POST | /password/reset | payload blocked before mutation | blocked | 409 | 71.121ms | pass |  |
| security | blocks XSS payload | POST | /password/reset | payload blocked before mutation | blocked | 409 | 51.356ms | pass |  |
| security | blocks SQL injection payload | POST | /password-reset/request | payload blocked before mutation | blocked | 409 | 37.424ms | pass |  |
| security | blocks XSS payload | POST | /password-reset/request | payload blocked before mutation | blocked | 409 | 40.324ms | pass |  |
| security | blocks SQL injection payload | POST | /password-reset/validate | payload blocked before mutation | blocked | 422 | 6.777ms | pass |  |
| security | blocks XSS payload | POST | /password-reset/validate | payload blocked before mutation | blocked | 422 | 8.471ms | pass |  |
| security | blocks SQL injection payload | POST | /password-reset/complete | payload blocked before mutation | blocked | 409 | 51.265ms | pass |  |
| security | blocks XSS payload | POST | /password-reset/complete | payload blocked before mutation | blocked | 409 | 48.276ms | pass |  |
| security | blocks SQL injection payload | POST | /plan | payload blocked before mutation | blocked | 500 | 28.084ms | pass |  |
| security | blocks XSS payload | POST | /plan | payload blocked before mutation | blocked | 500 | 24.649ms | pass |  |
| security | blocks SQL injection payload | POST | /subscription/activate | payload blocked before mutation | blocked | 500 | 208.568ms | pass |  |
| security | blocks XSS payload | POST | /subscription/activate | payload blocked before mutation | blocked | 500 | 201.262ms | pass |  |
| security | blocks SQL injection payload | DELETE | /mfa/trust-sessions | payload blocked before mutation | blocked | 500 | 510.151ms | pass |  |
| security | blocks XSS payload | DELETE | /mfa/trust-sessions | payload blocked before mutation | blocked | 500 | 467.892ms | pass |  |
| security | blocks SQL injection payload | DELETE | /mfa/trust-sessions/all | payload blocked before mutation | blocked | 500 | 212.826ms | pass |  |
| security | blocks XSS payload | DELETE | /mfa/trust-sessions/all | payload blocked before mutation | blocked | 500 | 191.645ms | pass |  |
| security | blocks SQL injection payload | DELETE | /sessions | payload blocked before mutation | blocked | 500 | 213.071ms | pass |  |
| security | blocks XSS payload | DELETE | /sessions | payload blocked before mutation | blocked | 500 | 186.091ms | pass |  |
| security | blocks SQL injection payload | POST | /sessions/revoke-others | payload blocked before mutation | blocked | 500 | 180.068ms | pass |  |
| security | blocks XSS payload | POST | /sessions/revoke-others | payload blocked before mutation | blocked | 500 | 203.433ms | pass |  |
| security | blocks SQL injection payload | POST | /roles | payload blocked before mutation | blocked | 500 | 197.142ms | pass |  |
| security | blocks XSS payload | POST | /roles | payload blocked before mutation | blocked | 500 | 191.242ms | pass |  |
| security | blocks SQL injection payload | POST | /users | payload blocked before mutation | blocked | 500 | 532.941ms | pass |  |
| security | blocks XSS payload | POST | /users | payload blocked before mutation | blocked | 500 | 522.285ms | pass |  |
