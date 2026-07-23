# auth API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | /status | 401/403/400/404 or public status | public-health | 200 | 6.225ms | pass |  |
| middleware | blocks unauthenticated access | GET | /captcha/start | 401/403/400/404 or public status | public-health | 200 | 11.507ms | pass |  |
| middleware | blocks unauthenticated access | POST | /signup | 401/403/400/404 or public status | blocked | 422 | 26.042ms | pass |  |
| validation | rejects malformed payload | POST | /signup | validation or auth rejection | blocked | 422 | 27.675ms | pass |  |
| security | blocks SQL injection payload | POST | /signup | payload blocked before mutation | blocked | 409 | 51.160ms | pass |  |
| security | blocks XSS payload | POST | /signup | payload blocked before mutation | blocked | 409 | 40.218ms | pass |  |
| performance | records oversized payload behavior | POST | /signup | bounded response without crash | blocked | 409 | 41.515ms | pass |  |
| middleware | blocks unauthenticated access | POST | /login | 401/403/400/404 or public status | blocked | 422 | 27.652ms | pass |  |
| validation | rejects malformed payload | POST | /login | validation or auth rejection | blocked | 422 | 32.085ms | pass |  |
| security | blocks SQL injection payload | POST | /login | payload blocked before mutation | blocked | 409 | 45.376ms | pass |  |
| security | blocks XSS payload | POST | /login | payload blocked before mutation | blocked | 409 | 41.584ms | pass |  |
| performance | records oversized payload behavior | POST | /login | bounded response without crash | blocked | 409 | 53.021ms | pass |  |
| middleware | blocks unauthenticated access | POST | /mfa/start | 401/403/400/404 or public status | blocked | 422 | 25.109ms | pass |  |
| validation | rejects malformed payload | POST | /mfa/start | validation or auth rejection | blocked | 500 | 30.115ms | pass |  |
| security | blocks SQL injection payload | POST | /mfa/start | payload blocked before mutation | blocked | 500 | 36.675ms | pass |  |
| security | blocks XSS payload | POST | /mfa/start | payload blocked before mutation | blocked | 500 | 202.595ms | pass |  |
| performance | records oversized payload behavior | POST | /mfa/start | bounded response without crash | blocked | 500 | 194.442ms | pass |  |
| middleware | blocks unauthenticated access | POST | /mfa/verify | 401/403/400/404 or public status | blocked | 422 | 185.979ms | pass |  |
| validation | rejects malformed payload | POST | /mfa/verify | validation or auth rejection | blocked | 500 | 430.825ms | pass |  |
| security | blocks SQL injection payload | POST | /mfa/verify | payload blocked before mutation | blocked | 500 | 75.588ms | pass |  |
| security | blocks XSS payload | POST | /mfa/verify | payload blocked before mutation | blocked | 500 | 490.609ms | pass |  |
| performance | records oversized payload behavior | POST | /mfa/verify | bounded response without crash | blocked | 500 | 544.907ms | pass |  |
| middleware | blocks unauthenticated access | POST | /refresh | 401/403/400/404 or public status | blocked | 400 | 613.692ms | pass |  |
| validation | rejects malformed payload | POST | /refresh | validation or auth rejection | blocked | 400 | 531.925ms | pass |  |
| security | blocks SQL injection payload | POST | /refresh | payload blocked before mutation | blocked | 409 | 51.240ms | pass |  |
| security | blocks XSS payload | POST | /refresh | payload blocked before mutation | blocked | 409 | 41.647ms | pass |  |
| performance | records oversized payload behavior | POST | /refresh | bounded response without crash | blocked | 409 | 44.288ms | pass |  |
| middleware | blocks unauthenticated access | POST | /switch-company | 401/403/400/404 or public status | blocked | 400 | 27.954ms | pass |  |
| validation | rejects malformed payload | POST | /switch-company | validation or auth rejection | blocked | 400 | 26.354ms | pass |  |
| security | blocks SQL injection payload | POST | /switch-company | payload blocked before mutation | blocked | 409 | 47.155ms | pass |  |
| security | blocks XSS payload | POST | /switch-company | payload blocked before mutation | blocked | 409 | 47.903ms | pass |  |
| performance | records oversized payload behavior | POST | /switch-company | bounded response without crash | blocked | 409 | 39.171ms | pass |  |
| middleware | blocks unauthenticated access | POST | /password/forgot | 401/403/400/404 or public status | blocked | 422 | 25.058ms | pass |  |
| validation | rejects malformed payload | POST | /password/forgot | validation or auth rejection | blocked | 422 | 28.295ms | pass |  |
| security | blocks SQL injection payload | POST | /password/forgot | payload blocked before mutation | blocked | 409 | 49.932ms | pass |  |
| security | blocks XSS payload | POST | /password/forgot | payload blocked before mutation | blocked | 409 | 41.783ms | pass |  |
| performance | records oversized payload behavior | POST | /password/forgot | bounded response without crash | blocked | 409 | 44.980ms | pass |  |
| middleware | blocks unauthenticated access | POST | /password/reset | 401/403/400/404 or public status | blocked | 422 | 26.684ms | pass |  |
| validation | rejects malformed payload | POST | /password/reset | validation or auth rejection | blocked | 422 | 28.669ms | pass |  |
| security | blocks SQL injection payload | POST | /password/reset | payload blocked before mutation | blocked | 409 | 71.121ms | pass |  |
| security | blocks XSS payload | POST | /password/reset | payload blocked before mutation | blocked | 409 | 51.356ms | pass |  |
| performance | records oversized payload behavior | POST | /password/reset | bounded response without crash | blocked | 409 | 45.816ms | pass |  |
| middleware | blocks unauthenticated access | POST | /password-reset/request | 401/403/400/404 or public status | blocked | 422 | 24.421ms | pass |  |
| validation | rejects malformed payload | POST | /password-reset/request | validation or auth rejection | blocked | 422 | 28.037ms | pass |  |
| security | blocks SQL injection payload | POST | /password-reset/request | payload blocked before mutation | blocked | 409 | 37.424ms | pass |  |
| security | blocks XSS payload | POST | /password-reset/request | payload blocked before mutation | blocked | 409 | 40.324ms | pass |  |
| performance | records oversized payload behavior | POST | /password-reset/request | bounded response without crash | blocked | 409 | 39.413ms | pass |  |
| middleware | blocks unauthenticated access | POST | /password-reset/validate | 401/403/400/404 or public status | blocked | 422 | 6.681ms | pass |  |
| validation | rejects malformed payload | POST | /password-reset/validate | validation or auth rejection | blocked | 422 | 6.568ms | pass |  |
| security | blocks SQL injection payload | POST | /password-reset/validate | payload blocked before mutation | blocked | 422 | 6.777ms | pass |  |
| security | blocks XSS payload | POST | /password-reset/validate | payload blocked before mutation | blocked | 422 | 8.471ms | pass |  |
| performance | records oversized payload behavior | POST | /password-reset/validate | bounded response without crash | blocked | 422 | 7.990ms | pass |  |
| middleware | blocks unauthenticated access | POST | /password-reset/complete | 401/403/400/404 or public status | blocked | 422 | 29.265ms | pass |  |
| validation | rejects malformed payload | POST | /password-reset/complete | validation or auth rejection | blocked | 422 | 30.690ms | pass |  |
| security | blocks SQL injection payload | POST | /password-reset/complete | payload blocked before mutation | blocked | 409 | 51.265ms | pass |  |
| security | blocks XSS payload | POST | /password-reset/complete | payload blocked before mutation | blocked | 409 | 48.276ms | pass |  |
| performance | records oversized payload behavior | POST | /password-reset/complete | bounded response without crash | blocked | 409 | 41.759ms | pass |  |
| middleware | blocks unauthenticated access | POST | /plan | 401/403/400/404 or public status | blocked | 401 | 5.479ms | pass |  |
| validation | rejects malformed payload | POST | /plan | validation or auth rejection | blocked | 400 | 5.792ms | pass |  |
| security | blocks SQL injection payload | POST | /plan | payload blocked before mutation | blocked | 500 | 28.084ms | pass |  |
| security | blocks XSS payload | POST | /plan | payload blocked before mutation | blocked | 500 | 24.649ms | pass |  |
| performance | records oversized payload behavior | POST | /plan | bounded response without crash | blocked | 500 | 232.628ms | pass |  |
| middleware | blocks unauthenticated access | POST | /subscription/activate | 401/403/400/404 or public status | blocked | 401 | 6.441ms | pass |  |
| validation | rejects malformed payload | POST | /subscription/activate | validation or auth rejection | blocked | 400 | 8.266ms | pass |  |
| security | blocks SQL injection payload | POST | /subscription/activate | payload blocked before mutation | blocked | 500 | 208.568ms | pass |  |
| security | blocks XSS payload | POST | /subscription/activate | payload blocked before mutation | blocked | 500 | 201.262ms | pass |  |
| performance | records oversized payload behavior | POST | /subscription/activate | bounded response without crash | blocked | 500 | 189.015ms | pass |  |
| middleware | blocks unauthenticated access | GET | /mfa/methods | 401/403/400/404 or public status | blocked | 401 | 6.376ms | pass |  |
| middleware | blocks unauthenticated access | GET | /sessions | 401/403/400/404 or public status | blocked | 401 | 7.782ms | pass |  |
| middleware | blocks unauthenticated access | GET | /mfa/trust-sessions | 401/403/400/404 or public status | blocked | 401 | 8.285ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /mfa/trust-sessions | 401/403/400/404 or public status | blocked | 401 | 8.462ms | pass |  |
| validation | rejects malformed payload | DELETE | /mfa/trust-sessions | validation or auth rejection | blocked | 400 | 7.625ms | pass |  |
| security | blocks SQL injection payload | DELETE | /mfa/trust-sessions | payload blocked before mutation | blocked | 500 | 510.151ms | pass |  |
| security | blocks XSS payload | DELETE | /mfa/trust-sessions | payload blocked before mutation | blocked | 500 | 467.892ms | pass |  |
| performance | records oversized payload behavior | DELETE | /mfa/trust-sessions | bounded response without crash | blocked | 500 | 181.667ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /mfa/trust-sessions/all | 401/403/400/404 or public status | blocked | 401 | 5.151ms | pass |  |
| validation | rejects malformed payload | DELETE | /mfa/trust-sessions/all | validation or auth rejection | blocked | 400 | 7.328ms | pass |  |
| security | blocks SQL injection payload | DELETE | /mfa/trust-sessions/all | payload blocked before mutation | blocked | 500 | 212.826ms | pass |  |
| security | blocks XSS payload | DELETE | /mfa/trust-sessions/all | payload blocked before mutation | blocked | 500 | 191.645ms | pass |  |
| performance | records oversized payload behavior | DELETE | /mfa/trust-sessions/all | bounded response without crash | blocked | 500 | 186.556ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /sessions | 401/403/400/404 or public status | blocked | 401 | 5.875ms | pass |  |
| validation | rejects malformed payload | DELETE | /sessions | validation or auth rejection | blocked | 400 | 5.169ms | pass |  |
| security | blocks SQL injection payload | DELETE | /sessions | payload blocked before mutation | blocked | 500 | 213.071ms | pass |  |
| security | blocks XSS payload | DELETE | /sessions | payload blocked before mutation | blocked | 500 | 186.091ms | pass |  |
| performance | records oversized payload behavior | DELETE | /sessions | bounded response without crash | blocked | 500 | 253.259ms | pass |  |
| middleware | blocks unauthenticated access | POST | /sessions/revoke-others | 401/403/400/404 or public status | blocked | 401 | 5.535ms | pass |  |
| validation | rejects malformed payload | POST | /sessions/revoke-others | validation or auth rejection | blocked | 400 | 5.429ms | pass |  |
| security | blocks SQL injection payload | POST | /sessions/revoke-others | payload blocked before mutation | blocked | 500 | 180.068ms | pass |  |
| security | blocks XSS payload | POST | /sessions/revoke-others | payload blocked before mutation | blocked | 500 | 203.433ms | pass |  |
| performance | records oversized payload behavior | POST | /sessions/revoke-others | bounded response without crash | blocked | 500 | 212.921ms | pass |  |
| middleware | blocks unauthenticated access | POST | /roles | 401/403/400/404 or public status | blocked | 401 | 5.850ms | pass |  |
| validation | rejects malformed payload | POST | /roles | validation or auth rejection | blocked | 400 | 7.606ms | pass |  |
| security | blocks SQL injection payload | POST | /roles | payload blocked before mutation | blocked | 500 | 197.142ms | pass |  |
| security | blocks XSS payload | POST | /roles | payload blocked before mutation | blocked | 500 | 191.242ms | pass |  |
| performance | records oversized payload behavior | POST | /roles | bounded response without crash | blocked | 500 | 577.125ms | pass |  |
| middleware | blocks unauthenticated access | GET | /roles | 401/403/400/404 or public status | blocked | 401 | 5.642ms | pass |  |
| middleware | blocks unauthenticated access | GET | /permissions | 401/403/400/404 or public status | blocked | 401 | 4.614ms | pass |  |
| middleware | blocks unauthenticated access | POST | /users | 401/403/400/404 or public status | blocked | 401 | 7.729ms | pass |  |
| validation | rejects malformed payload | POST | /users | validation or auth rejection | blocked | 400 | 6.163ms | pass |  |
| security | blocks SQL injection payload | POST | /users | payload blocked before mutation | blocked | 500 | 532.941ms | pass |  |
| security | blocks XSS payload | POST | /users | payload blocked before mutation | blocked | 500 | 522.285ms | pass |  |
| performance | records oversized payload behavior | POST | /users | bounded response without crash | blocked | 500 | 512.464ms | pass |  |
| middleware | blocks unauthenticated access | GET | /me | 401/403/400/404 or public status | blocked | 401 | 7.113ms | pass |  |
