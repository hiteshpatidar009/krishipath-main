# user Middleware Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | /invitations/accept | 401/403/400/404 or public status | blocked | 400 | 58.572ms | pass |  |
| middleware | blocks unauthenticated access | GET | /invitations/token/:token | 401/403/400/404 or public status | blocked | 404 | 40.895ms | pass |  |
| middleware | blocks unauthenticated access | GET | / | 401/403/400/404 or public status | blocked | 401 | 6.587ms | pass |  |
| middleware | blocks unauthenticated access | GET | /summary | 401/403/400/404 or public status | blocked | 401 | 5.303ms | pass |  |
| middleware | blocks unauthenticated access | GET | /export | 401/403/400/404 or public status | blocked | 401 | 7.780ms | pass |  |
| middleware | blocks unauthenticated access | GET | /invitations | 401/403/400/404 or public status | blocked | 401 | 6.483ms | pass |  |
| middleware | blocks unauthenticated access | POST | /invitations/:id/resend | 401/403/400/404 or public status | blocked | 401 | 10.293ms | pass |  |
| middleware | blocks unauthenticated access | POST | /invitations/:id/revoke | 401/403/400/404 or public status | blocked | 401 | 3.856ms | pass |  |
| middleware | blocks unauthenticated access | POST | /bulk-action | 401/403/400/404 or public status | blocked | 401 | 3.515ms | pass |  |
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 4.474ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:userId | 401/403/400/404 or public status | blocked | 401 | 3.967ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:userId/sessions | 401/403/400/404 or public status | blocked | 401 | 3.550ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:userId/activity | 401/403/400/404 or public status | blocked | 401 | 5.785ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:userId/warehouses | 401/403/400/404 or public status | blocked | 401 | 8.901ms | pass |  |
| middleware | blocks unauthenticated access | PUT | /:userId/warehouses | 401/403/400/404 or public status | blocked | 401 | 6.896ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:userId | 401/403/400/404 or public status | blocked | 401 | 4.803ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:userId/roles | 401/403/400/404 or public status | blocked | 401 | 6.514ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:userId/activate | 401/403/400/404 or public status | blocked | 401 | 5.325ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:userId/suspend | 401/403/400/404 or public status | blocked | 401 | 3.740ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:userId/restore | 401/403/400/404 or public status | blocked | 401 | 5.991ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:userId/reset-password | 401/403/400/404 or public status | blocked | 401 | 7.234ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:userId/reset-mfa | 401/403/400/404 or public status | blocked | 401 | 5.543ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:userId/terminate-sessions | 401/403/400/404 or public status | blocked | 401 | 6.330ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:userId/preferences | 401/403/400/404 or public status | blocked | 401 | 8.213ms | pass |  |
