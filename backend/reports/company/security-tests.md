# company Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=12 |  | 57.355ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 18.005ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 19.041ms | pass |  |
| security | blocks SQL injection payload | POST | /organizations | payload blocked before mutation | blocked | 401 | 28.130ms | pass |  |
| security | blocks XSS payload | POST | /organizations | payload blocked before mutation | blocked | 401 | 20.849ms | pass |  |
| security | blocks SQL injection payload | PATCH | /settings | payload blocked before mutation | blocked | 401 | 19.552ms | pass |  |
| security | blocks XSS payload | PATCH | /settings | payload blocked before mutation | blocked | 401 | 19.934ms | pass |  |
| security | blocks SQL injection payload | PATCH | /organizations/:organizationId/settings | payload blocked before mutation | blocked | 401 | 17.493ms | pass |  |
| security | blocks XSS payload | PATCH | /organizations/:organizationId/settings | payload blocked before mutation | blocked | 401 | 12.535ms | pass |  |
| security | blocks SQL injection payload | POST | /access/organization | payload blocked before mutation | blocked | 401 | 19.358ms | pass |  |
| security | blocks XSS payload | POST | /access/organization | payload blocked before mutation | blocked | 401 | 15.471ms | pass |  |
| security | blocks SQL injection payload | POST | /access/warehouse | payload blocked before mutation | blocked | 401 | 17.385ms | pass |  |
| security | blocks XSS payload | POST | /access/warehouse | payload blocked before mutation | blocked | 401 | 14.977ms | pass |  |
| security | blocks SQL injection payload | POST | /suspend | payload blocked before mutation | blocked | 401 | 25.339ms | pass |  |
| security | blocks XSS payload | POST | /suspend | payload blocked before mutation | blocked | 401 | 17.146ms | pass |  |
| security | blocks SQL injection payload | POST | /activate | payload blocked before mutation | blocked | 401 | 26.057ms | pass |  |
| security | blocks XSS payload | POST | /activate | payload blocked before mutation | blocked | 401 | 22.686ms | pass |  |
| security | blocks SQL injection payload | POST | /subscription/link | payload blocked before mutation | blocked | 401 | 22.286ms | pass |  |
| security | blocks XSS payload | POST | /subscription/link | payload blocked before mutation | blocked | 401 | 19.342ms | pass |  |
| security | blocks SQL injection payload | PATCH | /onboarding | payload blocked before mutation | blocked | 401 | 14.470ms | pass |  |
| security | blocks XSS payload | PATCH | /onboarding | payload blocked before mutation | blocked | 401 | 21.538ms | pass |  |
