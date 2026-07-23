# organization API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | /hierarchy | 401/403/400/404 or public status | blocked | 401 | 89.122ms | pass |  |
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 92.833ms | pass |  |
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 13.584ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 26.610ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 52.934ms | pass |  |
| performance | records oversized payload behavior | POST | / | bounded response without crash | blocked | 401 | 35.059ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:organizationId/access/validate | 401/403/400/404 or public status | blocked | 401 | 33.118ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:organizationId | 401/403/400/404 or public status | blocked | 401 | 33.626ms | pass |  |
| validation | rejects malformed payload | PATCH | /:organizationId | validation or auth rejection | blocked | 401 | 36.757ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:organizationId | payload blocked before mutation | blocked | 401 | 25.248ms | pass |  |
| security | blocks XSS payload | PATCH | /:organizationId | payload blocked before mutation | blocked | 401 | 22.694ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:organizationId | bounded response without crash | blocked | 401 | 50.072ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:organizationId/invitations | 401/403/400/404 or public status | blocked | 401 | 29.673ms | pass |  |
| validation | rejects malformed payload | POST | /:organizationId/invitations | validation or auth rejection | blocked | 401 | 37.655ms | pass |  |
| security | blocks SQL injection payload | POST | /:organizationId/invitations | payload blocked before mutation | blocked | 401 | 30.113ms | pass |  |
| security | blocks XSS payload | POST | /:organizationId/invitations | payload blocked before mutation | blocked | 401 | 23.401ms | pass |  |
| performance | records oversized payload behavior | POST | /:organizationId/invitations | bounded response without crash | blocked | 401 | 19.305ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:organizationId/roles | 401/403/400/404 or public status | blocked | 401 | 19.973ms | pass |  |
| validation | rejects malformed payload | POST | /:organizationId/roles | validation or auth rejection | blocked | 401 | 16.526ms | pass |  |
| security | blocks SQL injection payload | POST | /:organizationId/roles | payload blocked before mutation | blocked | 401 | 35.220ms | pass |  |
| security | blocks XSS payload | POST | /:organizationId/roles | payload blocked before mutation | blocked | 401 | 50.622ms | pass |  |
| performance | records oversized payload behavior | POST | /:organizationId/roles | bounded response without crash | blocked | 401 | 23.484ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:organizationId/activate | 401/403/400/404 or public status | blocked | 401 | 25.227ms | pass |  |
| validation | rejects malformed payload | POST | /:organizationId/activate | validation or auth rejection | blocked | 401 | 45.387ms | pass |  |
| security | blocks SQL injection payload | POST | /:organizationId/activate | payload blocked before mutation | blocked | 401 | 23.842ms | pass |  |
| security | blocks XSS payload | POST | /:organizationId/activate | payload blocked before mutation | blocked | 401 | 35.303ms | pass |  |
| performance | records oversized payload behavior | POST | /:organizationId/activate | bounded response without crash | blocked | 401 | 33.195ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:organizationId/suspend | 401/403/400/404 or public status | blocked | 401 | 20.231ms | pass |  |
| validation | rejects malformed payload | POST | /:organizationId/suspend | validation or auth rejection | blocked | 401 | 17.035ms | pass |  |
| security | blocks SQL injection payload | POST | /:organizationId/suspend | payload blocked before mutation | blocked | 401 | 30.105ms | pass |  |
| security | blocks XSS payload | POST | /:organizationId/suspend | payload blocked before mutation | blocked | 401 | 31.884ms | pass |  |
| performance | records oversized payload behavior | POST | /:organizationId/suspend | bounded response without crash | blocked | 401 | 23.645ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:organizationId/warehouses | 401/403/400/404 or public status | blocked | 401 | 15.872ms | pass |  |
| validation | rejects malformed payload | POST | /:organizationId/warehouses | validation or auth rejection | blocked | 401 | 17.650ms | pass |  |
| security | blocks SQL injection payload | POST | /:organizationId/warehouses | payload blocked before mutation | blocked | 401 | 18.495ms | pass |  |
| security | blocks XSS payload | POST | /:organizationId/warehouses | payload blocked before mutation | blocked | 401 | 17.808ms | pass |  |
| performance | records oversized payload behavior | POST | /:organizationId/warehouses | bounded response without crash | blocked | 401 | 34.963ms | pass |  |
