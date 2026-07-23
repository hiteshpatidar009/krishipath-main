# enterprise-management Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=38 |  | 24.854ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 12.769ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 11.709ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:enterpriseId | payload blocked before mutation | blocked | 401 | 10.794ms | pass |  |
| security | blocks XSS payload | PATCH | /:enterpriseId | payload blocked before mutation | blocked | 401 | 14.403ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:enterpriseId | payload blocked before mutation | blocked | 401 | 10.934ms | pass |  |
| security | blocks XSS payload | DELETE | /:enterpriseId | payload blocked before mutation | blocked | 401 | 9.188ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/activate | payload blocked before mutation | blocked | 401 | 10.953ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/activate | payload blocked before mutation | blocked | 401 | 12.272ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/deactivate | payload blocked before mutation | blocked | 401 | 22.150ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/deactivate | payload blocked before mutation | blocked | 401 | 20.411ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/move | payload blocked before mutation | blocked | 401 | 14.131ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/move | payload blocked before mutation | blocked | 401 | 17.453ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:enterpriseId/configuration | payload blocked before mutation | blocked | 401 | 24.871ms | pass |  |
| security | blocks XSS payload | PATCH | /:enterpriseId/configuration | payload blocked before mutation | blocked | 401 | 23.912ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/configuration/inherit-all | payload blocked before mutation | blocked | 401 | 19.204ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/configuration/inherit-all | payload blocked before mutation | blocked | 401 | 13.834ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/configuration/copy | payload blocked before mutation | blocked | 401 | 20.051ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/configuration/copy | payload blocked before mutation | blocked | 401 | 29.876ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:enterpriseId/configuration/overrides/:settingKey | payload blocked before mutation | blocked | 401 | 10.127ms | pass |  |
| security | blocks XSS payload | DELETE | /:enterpriseId/configuration/overrides/:settingKey | payload blocked before mutation | blocked | 401 | 19.333ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/documents | payload blocked before mutation | blocked | 401 | 24.025ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/documents | payload blocked before mutation | blocked | 401 | 31.992ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:enterpriseId/documents/:documentId | payload blocked before mutation | blocked | 401 | 23.785ms | pass |  |
| security | blocks XSS payload | DELETE | /:enterpriseId/documents/:documentId | payload blocked before mutation | blocked | 401 | 69.317ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/companies | payload blocked before mutation | blocked | 401 | 25.225ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/companies | payload blocked before mutation | blocked | 401 | 31.344ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:enterpriseId/companies/:companyId | payload blocked before mutation | blocked | 401 | 14.178ms | pass |  |
| security | blocks XSS payload | DELETE | /:enterpriseId/companies/:companyId | payload blocked before mutation | blocked | 401 | 44.491ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/users | payload blocked before mutation | blocked | 401 | 35.256ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/users | payload blocked before mutation | blocked | 401 | 16.371ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:enterpriseId/users/:userId | payload blocked before mutation | blocked | 401 | 34.060ms | pass |  |
| security | blocks XSS payload | DELETE | /:enterpriseId/users/:userId | payload blocked before mutation | blocked | 401 | 44.432ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers | payload blocked before mutation | blocked | 401 | 15.882ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers | payload blocked before mutation | blocked | 401 | 12.766ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/submit | payload blocked before mutation | blocked | 401 | 10.267ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/submit | payload blocked before mutation | blocked | 401 | 18.557ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/approve | payload blocked before mutation | blocked | 401 | 24.670ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/approve | payload blocked before mutation | blocked | 401 | 19.432ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/reject | payload blocked before mutation | blocked | 401 | 14.169ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/reject | payload blocked before mutation | blocked | 401 | 15.838ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/dispatch | payload blocked before mutation | blocked | 401 | 21.966ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/dispatch | payload blocked before mutation | blocked | 401 | 21.511ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/receive | payload blocked before mutation | blocked | 401 | 18.213ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/receive | payload blocked before mutation | blocked | 401 | 20.613ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/complete | payload blocked before mutation | blocked | 401 | 24.944ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/complete | payload blocked before mutation | blocked | 401 | 18.504ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/settle | payload blocked before mutation | blocked | 401 | 46.768ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/settle | payload blocked before mutation | blocked | 401 | 32.524ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/cancel | payload blocked before mutation | blocked | 401 | 29.961ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/cancel | payload blocked before mutation | blocked | 401 | 26.754ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/invoices | payload blocked before mutation | blocked | 401 | 22.443ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/invoices | payload blocked before mutation | blocked | 401 | 21.506ms | pass |  |
