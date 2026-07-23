# company API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | / | 401/403/400/404 or public status | blocked | 401 | 119.900ms | pass |  |
| middleware | blocks unauthenticated access | GET | /allowance | 401/403/400/404 or public status | blocked | 401 | 65.835ms | pass |  |
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 152.493ms | pass |  |
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 27.949ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 18.005ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 19.041ms | pass |  |
| performance | records oversized payload behavior | POST | / | bounded response without crash | blocked | 401 | 53.472ms | pass |  |
| middleware | blocks unauthenticated access | POST | /organizations | 401/403/400/404 or public status | blocked | 401 | 25.969ms | pass |  |
| validation | rejects malformed payload | POST | /organizations | validation or auth rejection | blocked | 401 | 33.580ms | pass |  |
| security | blocks SQL injection payload | POST | /organizations | payload blocked before mutation | blocked | 401 | 28.130ms | pass |  |
| security | blocks XSS payload | POST | /organizations | payload blocked before mutation | blocked | 401 | 20.849ms | pass |  |
| performance | records oversized payload behavior | POST | /organizations | bounded response without crash | blocked | 401 | 41.162ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /settings | 401/403/400/404 or public status | blocked | 401 | 32.288ms | pass |  |
| validation | rejects malformed payload | PATCH | /settings | validation or auth rejection | blocked | 401 | 27.200ms | pass |  |
| security | blocks SQL injection payload | PATCH | /settings | payload blocked before mutation | blocked | 401 | 19.552ms | pass |  |
| security | blocks XSS payload | PATCH | /settings | payload blocked before mutation | blocked | 401 | 19.934ms | pass |  |
| performance | records oversized payload behavior | PATCH | /settings | bounded response without crash | blocked | 401 | 23.533ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /organizations/:organizationId/settings | 401/403/400/404 or public status | blocked | 401 | 15.120ms | pass |  |
| validation | rejects malformed payload | PATCH | /organizations/:organizationId/settings | validation or auth rejection | blocked | 401 | 22.234ms | pass |  |
| security | blocks SQL injection payload | PATCH | /organizations/:organizationId/settings | payload blocked before mutation | blocked | 401 | 17.493ms | pass |  |
| security | blocks XSS payload | PATCH | /organizations/:organizationId/settings | payload blocked before mutation | blocked | 401 | 12.535ms | pass |  |
| performance | records oversized payload behavior | PATCH | /organizations/:organizationId/settings | bounded response without crash | blocked | 401 | 14.124ms | pass |  |
| middleware | blocks unauthenticated access | POST | /access/organization | 401/403/400/404 or public status | blocked | 401 | 16.539ms | pass |  |
| validation | rejects malformed payload | POST | /access/organization | validation or auth rejection | blocked | 401 | 13.261ms | pass |  |
| security | blocks SQL injection payload | POST | /access/organization | payload blocked before mutation | blocked | 401 | 19.358ms | pass |  |
| security | blocks XSS payload | POST | /access/organization | payload blocked before mutation | blocked | 401 | 15.471ms | pass |  |
| performance | records oversized payload behavior | POST | /access/organization | bounded response without crash | blocked | 401 | 16.708ms | pass |  |
| middleware | blocks unauthenticated access | POST | /access/warehouse | 401/403/400/404 or public status | blocked | 401 | 15.895ms | pass |  |
| validation | rejects malformed payload | POST | /access/warehouse | validation or auth rejection | blocked | 401 | 12.814ms | pass |  |
| security | blocks SQL injection payload | POST | /access/warehouse | payload blocked before mutation | blocked | 401 | 17.385ms | pass |  |
| security | blocks XSS payload | POST | /access/warehouse | payload blocked before mutation | blocked | 401 | 14.977ms | pass |  |
| performance | records oversized payload behavior | POST | /access/warehouse | bounded response without crash | blocked | 401 | 20.204ms | pass |  |
| middleware | blocks unauthenticated access | POST | /suspend | 401/403/400/404 or public status | blocked | 401 | 23.328ms | pass |  |
| validation | rejects malformed payload | POST | /suspend | validation or auth rejection | blocked | 401 | 16.815ms | pass |  |
| security | blocks SQL injection payload | POST | /suspend | payload blocked before mutation | blocked | 401 | 25.339ms | pass |  |
| security | blocks XSS payload | POST | /suspend | payload blocked before mutation | blocked | 401 | 17.146ms | pass |  |
| performance | records oversized payload behavior | POST | /suspend | bounded response without crash | blocked | 401 | 12.620ms | pass |  |
| middleware | blocks unauthenticated access | POST | /activate | 401/403/400/404 or public status | blocked | 401 | 19.490ms | pass |  |
| validation | rejects malformed payload | POST | /activate | validation or auth rejection | blocked | 401 | 15.386ms | pass |  |
| security | blocks SQL injection payload | POST | /activate | payload blocked before mutation | blocked | 401 | 26.057ms | pass |  |
| security | blocks XSS payload | POST | /activate | payload blocked before mutation | blocked | 401 | 22.686ms | pass |  |
| performance | records oversized payload behavior | POST | /activate | bounded response without crash | blocked | 401 | 22.790ms | pass |  |
| middleware | blocks unauthenticated access | POST | /subscription/link | 401/403/400/404 or public status | blocked | 401 | 17.854ms | pass |  |
| validation | rejects malformed payload | POST | /subscription/link | validation or auth rejection | blocked | 401 | 16.476ms | pass |  |
| security | blocks SQL injection payload | POST | /subscription/link | payload blocked before mutation | blocked | 401 | 22.286ms | pass |  |
| security | blocks XSS payload | POST | /subscription/link | payload blocked before mutation | blocked | 401 | 19.342ms | pass |  |
| performance | records oversized payload behavior | POST | /subscription/link | bounded response without crash | blocked | 401 | 30.284ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /onboarding | 401/403/400/404 or public status | blocked | 401 | 19.387ms | pass |  |
| validation | rejects malformed payload | PATCH | /onboarding | validation or auth rejection | blocked | 401 | 17.186ms | pass |  |
| security | blocks SQL injection payload | PATCH | /onboarding | payload blocked before mutation | blocked | 401 | 14.470ms | pass |  |
| security | blocks XSS payload | PATCH | /onboarding | payload blocked before mutation | blocked | 401 | 21.538ms | pass |  |
| performance | records oversized payload behavior | PATCH | /onboarding | bounded response without crash | blocked | 401 | 39.891ms | pass |  |
