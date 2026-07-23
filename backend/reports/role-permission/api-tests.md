# role-permission API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | /rbac/status | 401/403/400/404 or public status | public-health | 200 | 103.917ms | pass |  |
| middleware | blocks unauthenticated access | GET | /permissions | 401/403/400/404 or public status | blocked | 401 | 19.861ms | pass |  |
| middleware | blocks unauthenticated access | GET | /roles | 401/403/400/404 or public status | blocked | 401 | 10.834ms | pass |  |
| middleware | blocks unauthenticated access | GET | /roles/:roleId | 401/403/400/404 or public status | blocked | 401 | 31.637ms | pass |  |
| middleware | blocks unauthenticated access | POST | /roles | 401/403/400/404 or public status | blocked | 401 | 161.068ms | pass |  |
| validation | rejects malformed payload | POST | /roles | validation or auth rejection | blocked | 401 | 27.041ms | pass |  |
| security | blocks SQL injection payload | POST | /roles | payload blocked before mutation | blocked | 401 | 30.351ms | pass |  |
| security | blocks XSS payload | POST | /roles | payload blocked before mutation | blocked | 401 | 74.738ms | pass |  |
| performance | records oversized payload behavior | POST | /roles | bounded response without crash | blocked | 401 | 40.423ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /roles/:roleId | 401/403/400/404 or public status | blocked | 401 | 33.652ms | pass |  |
| validation | rejects malformed payload | PATCH | /roles/:roleId | validation or auth rejection | blocked | 401 | 26.137ms | pass |  |
| security | blocks SQL injection payload | PATCH | /roles/:roleId | payload blocked before mutation | blocked | 401 | 23.938ms | pass |  |
| security | blocks XSS payload | PATCH | /roles/:roleId | payload blocked before mutation | blocked | 401 | 26.039ms | pass |  |
| performance | records oversized payload behavior | PATCH | /roles/:roleId | bounded response without crash | blocked | 401 | 34.994ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /roles/:roleId | 401/403/400/404 or public status | blocked | 401 | 50.848ms | pass |  |
| validation | rejects malformed payload | DELETE | /roles/:roleId | validation or auth rejection | blocked | 401 | 32.248ms | pass |  |
| security | blocks SQL injection payload | DELETE | /roles/:roleId | payload blocked before mutation | blocked | 401 | 29.165ms | pass |  |
| security | blocks XSS payload | DELETE | /roles/:roleId | payload blocked before mutation | blocked | 401 | 50.379ms | pass |  |
| performance | records oversized payload behavior | DELETE | /roles/:roleId | bounded response without crash | blocked | 401 | 19.400ms | pass |  |
| middleware | blocks unauthenticated access | POST | /roles/:roleId/permissions | 401/403/400/404 or public status | blocked | 401 | 40.936ms | pass |  |
| validation | rejects malformed payload | POST | /roles/:roleId/permissions | validation or auth rejection | blocked | 401 | 27.876ms | pass |  |
| security | blocks SQL injection payload | POST | /roles/:roleId/permissions | payload blocked before mutation | blocked | 401 | 24.137ms | pass |  |
| security | blocks XSS payload | POST | /roles/:roleId/permissions | payload blocked before mutation | blocked | 401 | 29.029ms | pass |  |
| performance | records oversized payload behavior | POST | /roles/:roleId/permissions | bounded response without crash | blocked | 401 | 35.741ms | pass |  |
| middleware | blocks unauthenticated access | POST | /roles/:roleId/clone | 401/403/400/404 or public status | blocked | 401 | 17.906ms | pass |  |
| validation | rejects malformed payload | POST | /roles/:roleId/clone | validation or auth rejection | blocked | 401 | 14.464ms | pass |  |
| security | blocks SQL injection payload | POST | /roles/:roleId/clone | payload blocked before mutation | blocked | 401 | 23.733ms | pass |  |
| security | blocks XSS payload | POST | /roles/:roleId/clone | payload blocked before mutation | blocked | 401 | 24.526ms | pass |  |
| performance | records oversized payload behavior | POST | /roles/:roleId/clone | bounded response without crash | blocked | 401 | 15.610ms | pass |  |
| middleware | blocks unauthenticated access | POST | /roles/:roleId/retire | 401/403/400/404 or public status | blocked | 401 | 23.319ms | pass |  |
| validation | rejects malformed payload | POST | /roles/:roleId/retire | validation or auth rejection | blocked | 401 | 43.282ms | pass |  |
| security | blocks SQL injection payload | POST | /roles/:roleId/retire | payload blocked before mutation | blocked | 401 | 23.378ms | pass |  |
| security | blocks XSS payload | POST | /roles/:roleId/retire | payload blocked before mutation | blocked | 401 | 23.031ms | pass |  |
| performance | records oversized payload behavior | POST | /roles/:roleId/retire | bounded response without crash | blocked | 401 | 19.460ms | pass |  |
| middleware | blocks unauthenticated access | POST | /roles/:roleId/restore | 401/403/400/404 or public status | blocked | 401 | 20.623ms | pass |  |
| validation | rejects malformed payload | POST | /roles/:roleId/restore | validation or auth rejection | blocked | 401 | 19.127ms | pass |  |
| security | blocks SQL injection payload | POST | /roles/:roleId/restore | payload blocked before mutation | blocked | 401 | 17.148ms | pass |  |
| security | blocks XSS payload | POST | /roles/:roleId/restore | payload blocked before mutation | blocked | 401 | 21.145ms | pass |  |
| performance | records oversized payload behavior | POST | /roles/:roleId/restore | bounded response without crash | blocked | 401 | 24.140ms | pass |  |
| middleware | blocks unauthenticated access | GET | /permissions/matrix | 401/403/400/404 or public status | blocked | 401 | 14.614ms | pass |  |
| middleware | blocks unauthenticated access | PUT | /permissions/matrix | 401/403/400/404 or public status | blocked | 401 | 11.983ms | pass |  |
| validation | rejects malformed payload | PUT | /permissions/matrix | validation or auth rejection | blocked | 401 | 14.473ms | pass |  |
| security | blocks SQL injection payload | PUT | /permissions/matrix | payload blocked before mutation | blocked | 401 | 14.258ms | pass |  |
| security | blocks XSS payload | PUT | /permissions/matrix | payload blocked before mutation | blocked | 401 | 19.556ms | pass |  |
| performance | records oversized payload behavior | PUT | /permissions/matrix | bounded response without crash | blocked | 401 | 20.257ms | pass |  |
| middleware | blocks unauthenticated access | POST | /permissions/publish | 401/403/400/404 or public status | blocked | 401 | 14.702ms | pass |  |
| validation | rejects malformed payload | POST | /permissions/publish | validation or auth rejection | blocked | 401 | 20.181ms | pass |  |
| security | blocks SQL injection payload | POST | /permissions/publish | payload blocked before mutation | blocked | 401 | 15.950ms | pass |  |
| security | blocks XSS payload | POST | /permissions/publish | payload blocked before mutation | blocked | 401 | 20.515ms | pass |  |
| performance | records oversized payload behavior | POST | /permissions/publish | bounded response without crash | blocked | 401 | 16.783ms | pass |  |
| middleware | blocks unauthenticated access | POST | /permissions/compare | 401/403/400/404 or public status | blocked | 401 | 17.640ms | pass |  |
| validation | rejects malformed payload | POST | /permissions/compare | validation or auth rejection | blocked | 401 | 20.942ms | pass |  |
| security | blocks SQL injection payload | POST | /permissions/compare | payload blocked before mutation | blocked | 401 | 16.814ms | pass |  |
| security | blocks XSS payload | POST | /permissions/compare | payload blocked before mutation | blocked | 401 | 18.118ms | pass |  |
| performance | records oversized payload behavior | POST | /permissions/compare | bounded response without crash | blocked | 401 | 19.587ms | pass |  |
| middleware | blocks unauthenticated access | GET | /permissions/modules | 401/403/400/404 or public status | blocked | 401 | 14.218ms | pass |  |
