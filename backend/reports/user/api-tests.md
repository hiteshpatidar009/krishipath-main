# user API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | /invitations/accept | 401/403/400/404 or public status | blocked | 400 | 58.572ms | pass |  |
| validation | rejects malformed payload | POST | /invitations/accept | validation or auth rejection | blocked | 400 | 8.836ms | pass |  |
| security | blocks SQL injection payload | POST | /invitations/accept | payload blocked before mutation | blocked | 409 | 336.118ms | pass |  |
| security | blocks XSS payload | POST | /invitations/accept | payload blocked before mutation | blocked | 409 | 44.420ms | pass |  |
| performance | records oversized payload behavior | POST | /invitations/accept | bounded response without crash | blocked | 409 | 51.718ms | pass |  |
| middleware | blocks unauthenticated access | GET | /invitations/token/:token | 401/403/400/404 or public status | blocked | 404 | 40.895ms | pass |  |
| middleware | blocks unauthenticated access | GET | / | 401/403/400/404 or public status | blocked | 401 | 6.587ms | pass |  |
| middleware | blocks unauthenticated access | GET | /summary | 401/403/400/404 or public status | blocked | 401 | 5.303ms | pass |  |
| middleware | blocks unauthenticated access | GET | /export | 401/403/400/404 or public status | blocked | 401 | 7.780ms | pass |  |
| middleware | blocks unauthenticated access | GET | /invitations | 401/403/400/404 or public status | blocked | 401 | 6.483ms | pass |  |
| middleware | blocks unauthenticated access | POST | /invitations/:id/resend | 401/403/400/404 or public status | blocked | 401 | 10.293ms | pass |  |
| validation | rejects malformed payload | POST | /invitations/:id/resend | validation or auth rejection | blocked | 401 | 6.228ms | pass |  |
| security | blocks SQL injection payload | POST | /invitations/:id/resend | payload blocked before mutation | blocked | 401 | 4.957ms | pass |  |
| security | blocks XSS payload | POST | /invitations/:id/resend | payload blocked before mutation | blocked | 401 | 5.589ms | pass |  |
| performance | records oversized payload behavior | POST | /invitations/:id/resend | bounded response without crash | blocked | 401 | 3.997ms | pass |  |
| middleware | blocks unauthenticated access | POST | /invitations/:id/revoke | 401/403/400/404 or public status | blocked | 401 | 3.856ms | pass |  |
| validation | rejects malformed payload | POST | /invitations/:id/revoke | validation or auth rejection | blocked | 401 | 4.134ms | pass |  |
| security | blocks SQL injection payload | POST | /invitations/:id/revoke | payload blocked before mutation | blocked | 401 | 3.870ms | pass |  |
| security | blocks XSS payload | POST | /invitations/:id/revoke | payload blocked before mutation | blocked | 401 | 3.527ms | pass |  |
| performance | records oversized payload behavior | POST | /invitations/:id/revoke | bounded response without crash | blocked | 401 | 3.484ms | pass |  |
| middleware | blocks unauthenticated access | POST | /bulk-action | 401/403/400/404 or public status | blocked | 401 | 3.515ms | pass |  |
| validation | rejects malformed payload | POST | /bulk-action | validation or auth rejection | blocked | 401 | 4.290ms | pass |  |
| security | blocks SQL injection payload | POST | /bulk-action | payload blocked before mutation | blocked | 401 | 3.542ms | pass |  |
| security | blocks XSS payload | POST | /bulk-action | payload blocked before mutation | blocked | 401 | 3.334ms | pass |  |
| performance | records oversized payload behavior | POST | /bulk-action | bounded response without crash | blocked | 401 | 4.167ms | pass |  |
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 4.474ms | pass |  |
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 4.043ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 3.556ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 3.728ms | pass |  |
| performance | records oversized payload behavior | POST | / | bounded response without crash | blocked | 401 | 4.094ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:userId | 401/403/400/404 or public status | blocked | 401 | 3.967ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:userId/sessions | 401/403/400/404 or public status | blocked | 401 | 3.550ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:userId/activity | 401/403/400/404 or public status | blocked | 401 | 5.785ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:userId/warehouses | 401/403/400/404 or public status | blocked | 401 | 8.901ms | pass |  |
| middleware | blocks unauthenticated access | PUT | /:userId/warehouses | 401/403/400/404 or public status | blocked | 401 | 6.896ms | pass |  |
| validation | rejects malformed payload | PUT | /:userId/warehouses | validation or auth rejection | blocked | 401 | 5.955ms | pass |  |
| security | blocks SQL injection payload | PUT | /:userId/warehouses | payload blocked before mutation | blocked | 401 | 5.415ms | pass |  |
| security | blocks XSS payload | PUT | /:userId/warehouses | payload blocked before mutation | blocked | 401 | 5.572ms | pass |  |
| performance | records oversized payload behavior | PUT | /:userId/warehouses | bounded response without crash | blocked | 401 | 5.236ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:userId | 401/403/400/404 or public status | blocked | 401 | 4.803ms | pass |  |
| validation | rejects malformed payload | PATCH | /:userId | validation or auth rejection | blocked | 401 | 4.696ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:userId | payload blocked before mutation | blocked | 401 | 4.068ms | pass |  |
| security | blocks XSS payload | PATCH | /:userId | payload blocked before mutation | blocked | 401 | 3.536ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:userId | bounded response without crash | blocked | 401 | 6.037ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:userId/roles | 401/403/400/404 or public status | blocked | 401 | 6.514ms | pass |  |
| validation | rejects malformed payload | POST | /:userId/roles | validation or auth rejection | blocked | 401 | 4.485ms | pass |  |
| security | blocks SQL injection payload | POST | /:userId/roles | payload blocked before mutation | blocked | 401 | 4.519ms | pass |  |
| security | blocks XSS payload | POST | /:userId/roles | payload blocked before mutation | blocked | 401 | 4.405ms | pass |  |
| performance | records oversized payload behavior | POST | /:userId/roles | bounded response without crash | blocked | 401 | 3.681ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:userId/activate | 401/403/400/404 or public status | blocked | 401 | 5.325ms | pass |  |
| validation | rejects malformed payload | POST | /:userId/activate | validation or auth rejection | blocked | 401 | 4.273ms | pass |  |
| security | blocks SQL injection payload | POST | /:userId/activate | payload blocked before mutation | blocked | 401 | 4.744ms | pass |  |
| security | blocks XSS payload | POST | /:userId/activate | payload blocked before mutation | blocked | 401 | 3.915ms | pass |  |
| performance | records oversized payload behavior | POST | /:userId/activate | bounded response without crash | blocked | 401 | 4.842ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:userId/suspend | 401/403/400/404 or public status | blocked | 401 | 3.740ms | pass |  |
| validation | rejects malformed payload | POST | /:userId/suspend | validation or auth rejection | blocked | 401 | 5.317ms | pass |  |
| security | blocks SQL injection payload | POST | /:userId/suspend | payload blocked before mutation | blocked | 401 | 7.138ms | pass |  |
| security | blocks XSS payload | POST | /:userId/suspend | payload blocked before mutation | blocked | 401 | 3.957ms | pass |  |
| performance | records oversized payload behavior | POST | /:userId/suspend | bounded response without crash | blocked | 401 | 5.584ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:userId/restore | 401/403/400/404 or public status | blocked | 401 | 5.991ms | pass |  |
| validation | rejects malformed payload | POST | /:userId/restore | validation or auth rejection | blocked | 401 | 6.281ms | pass |  |
| security | blocks SQL injection payload | POST | /:userId/restore | payload blocked before mutation | blocked | 401 | 7.304ms | pass |  |
| security | blocks XSS payload | POST | /:userId/restore | payload blocked before mutation | blocked | 401 | 8.287ms | pass |  |
| performance | records oversized payload behavior | POST | /:userId/restore | bounded response without crash | blocked | 401 | 8.767ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:userId/reset-password | 401/403/400/404 or public status | blocked | 401 | 7.234ms | pass |  |
| validation | rejects malformed payload | POST | /:userId/reset-password | validation or auth rejection | blocked | 401 | 7.750ms | pass |  |
| security | blocks SQL injection payload | POST | /:userId/reset-password | payload blocked before mutation | blocked | 401 | 5.980ms | pass |  |
| security | blocks XSS payload | POST | /:userId/reset-password | payload blocked before mutation | blocked | 401 | 4.420ms | pass |  |
| performance | records oversized payload behavior | POST | /:userId/reset-password | bounded response without crash | blocked | 401 | 5.256ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:userId/reset-mfa | 401/403/400/404 or public status | blocked | 401 | 5.543ms | pass |  |
| validation | rejects malformed payload | POST | /:userId/reset-mfa | validation or auth rejection | blocked | 401 | 4.060ms | pass |  |
| security | blocks SQL injection payload | POST | /:userId/reset-mfa | payload blocked before mutation | blocked | 401 | 5.495ms | pass |  |
| security | blocks XSS payload | POST | /:userId/reset-mfa | payload blocked before mutation | blocked | 401 | 7.028ms | pass |  |
| performance | records oversized payload behavior | POST | /:userId/reset-mfa | bounded response without crash | blocked | 401 | 4.984ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:userId/terminate-sessions | 401/403/400/404 or public status | blocked | 401 | 6.330ms | pass |  |
| validation | rejects malformed payload | POST | /:userId/terminate-sessions | validation or auth rejection | blocked | 401 | 5.885ms | pass |  |
| security | blocks SQL injection payload | POST | /:userId/terminate-sessions | payload blocked before mutation | blocked | 401 | 4.286ms | pass |  |
| security | blocks XSS payload | POST | /:userId/terminate-sessions | payload blocked before mutation | blocked | 401 | 4.026ms | pass |  |
| performance | records oversized payload behavior | POST | /:userId/terminate-sessions | bounded response without crash | blocked | 401 | 4.319ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:userId/preferences | 401/403/400/404 or public status | blocked | 401 | 8.213ms | pass |  |
| validation | rejects malformed payload | PATCH | /:userId/preferences | validation or auth rejection | blocked | 401 | 3.745ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:userId/preferences | payload blocked before mutation | blocked | 401 | 3.637ms | pass |  |
| security | blocks XSS payload | PATCH | /:userId/preferences | payload blocked before mutation | blocked | 401 | 4.329ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:userId/preferences | bounded response without crash | blocked | 401 | 6.512ms | pass |  |
