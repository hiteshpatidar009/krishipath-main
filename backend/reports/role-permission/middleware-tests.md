# role-permission Middleware Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | /rbac/status | 401/403/400/404 or public status | public-health | 200 | 103.917ms | pass |  |
| middleware | blocks unauthenticated access | GET | /permissions | 401/403/400/404 or public status | blocked | 401 | 19.861ms | pass |  |
| middleware | blocks unauthenticated access | GET | /roles | 401/403/400/404 or public status | blocked | 401 | 10.834ms | pass |  |
| middleware | blocks unauthenticated access | GET | /roles/:roleId | 401/403/400/404 or public status | blocked | 401 | 31.637ms | pass |  |
| middleware | blocks unauthenticated access | POST | /roles | 401/403/400/404 or public status | blocked | 401 | 161.068ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /roles/:roleId | 401/403/400/404 or public status | blocked | 401 | 33.652ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /roles/:roleId | 401/403/400/404 or public status | blocked | 401 | 50.848ms | pass |  |
| middleware | blocks unauthenticated access | POST | /roles/:roleId/permissions | 401/403/400/404 or public status | blocked | 401 | 40.936ms | pass |  |
| middleware | blocks unauthenticated access | POST | /roles/:roleId/clone | 401/403/400/404 or public status | blocked | 401 | 17.906ms | pass |  |
| middleware | blocks unauthenticated access | POST | /roles/:roleId/retire | 401/403/400/404 or public status | blocked | 401 | 23.319ms | pass |  |
| middleware | blocks unauthenticated access | POST | /roles/:roleId/restore | 401/403/400/404 or public status | blocked | 401 | 20.623ms | pass |  |
| middleware | blocks unauthenticated access | GET | /permissions/matrix | 401/403/400/404 or public status | blocked | 401 | 14.614ms | pass |  |
| middleware | blocks unauthenticated access | PUT | /permissions/matrix | 401/403/400/404 or public status | blocked | 401 | 11.983ms | pass |  |
| middleware | blocks unauthenticated access | POST | /permissions/publish | 401/403/400/404 or public status | blocked | 401 | 14.702ms | pass |  |
| middleware | blocks unauthenticated access | POST | /permissions/compare | 401/403/400/404 or public status | blocked | 401 | 17.640ms | pass |  |
| middleware | blocks unauthenticated access | GET | /permissions/modules | 401/403/400/404 or public status | blocked | 401 | 14.218ms | pass |  |
