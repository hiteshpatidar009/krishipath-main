# organization Middleware Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | /hierarchy | 401/403/400/404 or public status | blocked | 401 | 89.122ms | pass |  |
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 92.833ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:organizationId/access/validate | 401/403/400/404 or public status | blocked | 401 | 33.118ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:organizationId | 401/403/400/404 or public status | blocked | 401 | 33.626ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:organizationId/invitations | 401/403/400/404 or public status | blocked | 401 | 29.673ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:organizationId/roles | 401/403/400/404 or public status | blocked | 401 | 19.973ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:organizationId/activate | 401/403/400/404 or public status | blocked | 401 | 25.227ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:organizationId/suspend | 401/403/400/404 or public status | blocked | 401 | 20.231ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:organizationId/warehouses | 401/403/400/404 or public status | blocked | 401 | 15.872ms | pass |  |
