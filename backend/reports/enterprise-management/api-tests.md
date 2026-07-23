# enterprise-management API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | / | 401/403/400/404 or public status | blocked | 401 | 70.282ms | pass |  |
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 86.719ms | pass |  |
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 16.570ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 12.769ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 11.709ms | pass |  |
| performance | records oversized payload behavior | POST | / | bounded response without crash | blocked | 401 | 13.288ms | pass |  |
| middleware | blocks unauthenticated access | GET | /hierarchy/tree | 401/403/400/404 or public status | blocked | 401 | 14.316ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId | 401/403/400/404 or public status | blocked | 401 | 13.791ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:enterpriseId | 401/403/400/404 or public status | blocked | 401 | 17.324ms | pass |  |
| validation | rejects malformed payload | PATCH | /:enterpriseId | validation or auth rejection | blocked | 401 | 13.882ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:enterpriseId | payload blocked before mutation | blocked | 401 | 10.794ms | pass |  |
| security | blocks XSS payload | PATCH | /:enterpriseId | payload blocked before mutation | blocked | 401 | 14.403ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:enterpriseId | bounded response without crash | blocked | 401 | 12.103ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:enterpriseId | 401/403/400/404 or public status | blocked | 401 | 11.660ms | pass |  |
| validation | rejects malformed payload | DELETE | /:enterpriseId | validation or auth rejection | blocked | 401 | 7.629ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:enterpriseId | payload blocked before mutation | blocked | 401 | 10.934ms | pass |  |
| security | blocks XSS payload | DELETE | /:enterpriseId | payload blocked before mutation | blocked | 401 | 9.188ms | pass |  |
| performance | records oversized payload behavior | DELETE | /:enterpriseId | bounded response without crash | blocked | 401 | 9.241ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/activate | 401/403/400/404 or public status | blocked | 401 | 8.352ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/activate | validation or auth rejection | blocked | 401 | 7.320ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/activate | payload blocked before mutation | blocked | 401 | 10.953ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/activate | payload blocked before mutation | blocked | 401 | 12.272ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/activate | bounded response without crash | blocked | 401 | 8.549ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/deactivate | 401/403/400/404 or public status | blocked | 401 | 16.934ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/deactivate | validation or auth rejection | blocked | 401 | 21.737ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/deactivate | payload blocked before mutation | blocked | 401 | 22.150ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/deactivate | payload blocked before mutation | blocked | 401 | 20.411ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/deactivate | bounded response without crash | blocked | 401 | 17.708ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/move | 401/403/400/404 or public status | blocked | 401 | 19.715ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/move | validation or auth rejection | blocked | 401 | 15.696ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/move | payload blocked before mutation | blocked | 401 | 14.131ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/move | payload blocked before mutation | blocked | 401 | 17.453ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/move | bounded response without crash | blocked | 401 | 17.986ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/configuration | 401/403/400/404 or public status | blocked | 401 | 14.333ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:enterpriseId/configuration | 401/403/400/404 or public status | blocked | 401 | 18.528ms | pass |  |
| validation | rejects malformed payload | PATCH | /:enterpriseId/configuration | validation or auth rejection | blocked | 401 | 20.993ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:enterpriseId/configuration | payload blocked before mutation | blocked | 401 | 24.871ms | pass |  |
| security | blocks XSS payload | PATCH | /:enterpriseId/configuration | payload blocked before mutation | blocked | 401 | 23.912ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:enterpriseId/configuration | bounded response without crash | blocked | 401 | 15.449ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/configuration/inherit-all | 401/403/400/404 or public status | blocked | 401 | 23.127ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/configuration/inherit-all | validation or auth rejection | blocked | 401 | 16.630ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/configuration/inherit-all | payload blocked before mutation | blocked | 401 | 19.204ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/configuration/inherit-all | payload blocked before mutation | blocked | 401 | 13.834ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/configuration/inherit-all | bounded response without crash | blocked | 401 | 13.889ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/configuration/copy | 401/403/400/404 or public status | blocked | 401 | 9.257ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/configuration/copy | validation or auth rejection | blocked | 401 | 10.766ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/configuration/copy | payload blocked before mutation | blocked | 401 | 20.051ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/configuration/copy | payload blocked before mutation | blocked | 401 | 29.876ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/configuration/copy | bounded response without crash | blocked | 401 | 14.239ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:enterpriseId/configuration/overrides/:settingKey | 401/403/400/404 or public status | blocked | 401 | 17.085ms | pass |  |
| validation | rejects malformed payload | DELETE | /:enterpriseId/configuration/overrides/:settingKey | validation or auth rejection | blocked | 401 | 18.569ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:enterpriseId/configuration/overrides/:settingKey | payload blocked before mutation | blocked | 401 | 10.127ms | pass |  |
| security | blocks XSS payload | DELETE | /:enterpriseId/configuration/overrides/:settingKey | payload blocked before mutation | blocked | 401 | 19.333ms | pass |  |
| performance | records oversized payload behavior | DELETE | /:enterpriseId/configuration/overrides/:settingKey | bounded response without crash | blocked | 401 | 32.193ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/documents | 401/403/400/404 or public status | blocked | 401 | 21.191ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/documents | 401/403/400/404 or public status | blocked | 401 | 20.904ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/documents | validation or auth rejection | blocked | 401 | 30.018ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/documents | payload blocked before mutation | blocked | 401 | 24.025ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/documents | payload blocked before mutation | blocked | 401 | 31.992ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/documents | bounded response without crash | blocked | 401 | 19.691ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:enterpriseId/documents/:documentId | 401/403/400/404 or public status | blocked | 401 | 23.041ms | pass |  |
| validation | rejects malformed payload | DELETE | /:enterpriseId/documents/:documentId | validation or auth rejection | blocked | 401 | 15.911ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:enterpriseId/documents/:documentId | payload blocked before mutation | blocked | 401 | 23.785ms | pass |  |
| security | blocks XSS payload | DELETE | /:enterpriseId/documents/:documentId | payload blocked before mutation | blocked | 401 | 69.317ms | pass |  |
| performance | records oversized payload behavior | DELETE | /:enterpriseId/documents/:documentId | bounded response without crash | blocked | 401 | 17.760ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/audit-logs | 401/403/400/404 or public status | blocked | 401 | 46.615ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/companies | 401/403/400/404 or public status | blocked | 401 | 20.582ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/companies | 401/403/400/404 or public status | blocked | 401 | 26.627ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/companies | validation or auth rejection | blocked | 401 | 18.930ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/companies | payload blocked before mutation | blocked | 401 | 25.225ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/companies | payload blocked before mutation | blocked | 401 | 31.344ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/companies | bounded response without crash | blocked | 401 | 60.897ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:enterpriseId/companies/:companyId | 401/403/400/404 or public status | blocked | 401 | 26.678ms | pass |  |
| validation | rejects malformed payload | DELETE | /:enterpriseId/companies/:companyId | validation or auth rejection | blocked | 401 | 48.496ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:enterpriseId/companies/:companyId | payload blocked before mutation | blocked | 401 | 14.178ms | pass |  |
| security | blocks XSS payload | DELETE | /:enterpriseId/companies/:companyId | payload blocked before mutation | blocked | 401 | 44.491ms | pass |  |
| performance | records oversized payload behavior | DELETE | /:enterpriseId/companies/:companyId | bounded response without crash | blocked | 401 | 26.684ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/users | 401/403/400/404 or public status | blocked | 401 | 24.071ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/users | 401/403/400/404 or public status | blocked | 401 | 18.591ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/users | validation or auth rejection | blocked | 401 | 41.829ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/users | payload blocked before mutation | blocked | 401 | 35.256ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/users | payload blocked before mutation | blocked | 401 | 16.371ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/users | bounded response without crash | blocked | 401 | 15.726ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:enterpriseId/users/:userId | 401/403/400/404 or public status | blocked | 401 | 26.663ms | pass |  |
| validation | rejects malformed payload | DELETE | /:enterpriseId/users/:userId | validation or auth rejection | blocked | 401 | 27.117ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:enterpriseId/users/:userId | payload blocked before mutation | blocked | 401 | 34.060ms | pass |  |
| security | blocks XSS payload | DELETE | /:enterpriseId/users/:userId | payload blocked before mutation | blocked | 401 | 44.432ms | pass |  |
| performance | records oversized payload behavior | DELETE | /:enterpriseId/users/:userId | bounded response without crash | blocked | 401 | 19.433ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/transfers | 401/403/400/404 or public status | blocked | 401 | 22.731ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers | 401/403/400/404 or public status | blocked | 401 | 22.484ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers | validation or auth rejection | blocked | 401 | 16.326ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers | payload blocked before mutation | blocked | 401 | 15.882ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers | payload blocked before mutation | blocked | 401 | 12.766ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/transfers | bounded response without crash | blocked | 401 | 23.447ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/transfers/:transferId | 401/403/400/404 or public status | blocked | 401 | 22.354ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/submit | 401/403/400/404 or public status | blocked | 401 | 26.794ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/submit | validation or auth rejection | blocked | 401 | 14.342ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/submit | payload blocked before mutation | blocked | 401 | 10.267ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/submit | payload blocked before mutation | blocked | 401 | 18.557ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/transfers/:transferId/submit | bounded response without crash | blocked | 401 | 14.164ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/approve | 401/403/400/404 or public status | blocked | 401 | 14.142ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/approve | validation or auth rejection | blocked | 401 | 22.199ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/approve | payload blocked before mutation | blocked | 401 | 24.670ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/approve | payload blocked before mutation | blocked | 401 | 19.432ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/transfers/:transferId/approve | bounded response without crash | blocked | 401 | 18.467ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/reject | 401/403/400/404 or public status | blocked | 401 | 23.727ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/reject | validation or auth rejection | blocked | 401 | 18.866ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/reject | payload blocked before mutation | blocked | 401 | 14.169ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/reject | payload blocked before mutation | blocked | 401 | 15.838ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/transfers/:transferId/reject | bounded response without crash | blocked | 401 | 15.435ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/dispatch | 401/403/400/404 or public status | blocked | 401 | 19.522ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/dispatch | validation or auth rejection | blocked | 401 | 21.094ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/dispatch | payload blocked before mutation | blocked | 401 | 21.966ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/dispatch | payload blocked before mutation | blocked | 401 | 21.511ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/transfers/:transferId/dispatch | bounded response without crash | blocked | 401 | 19.986ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/receive | 401/403/400/404 or public status | blocked | 401 | 20.496ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/receive | validation or auth rejection | blocked | 401 | 19.539ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/receive | payload blocked before mutation | blocked | 401 | 18.213ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/receive | payload blocked before mutation | blocked | 401 | 20.613ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/transfers/:transferId/receive | bounded response without crash | blocked | 401 | 19.904ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/complete | 401/403/400/404 or public status | blocked | 401 | 21.103ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/complete | validation or auth rejection | blocked | 401 | 20.776ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/complete | payload blocked before mutation | blocked | 401 | 24.944ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/complete | payload blocked before mutation | blocked | 401 | 18.504ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/transfers/:transferId/complete | bounded response without crash | blocked | 401 | 14.418ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/settle | 401/403/400/404 or public status | blocked | 401 | 52.578ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/settle | validation or auth rejection | blocked | 401 | 31.119ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/settle | payload blocked before mutation | blocked | 401 | 46.768ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/settle | payload blocked before mutation | blocked | 401 | 32.524ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/transfers/:transferId/settle | bounded response without crash | blocked | 401 | 22.864ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/cancel | 401/403/400/404 or public status | blocked | 401 | 29.173ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/cancel | validation or auth rejection | blocked | 401 | 59.021ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/transfers/:transferId/cancel | payload blocked before mutation | blocked | 401 | 29.961ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/transfers/:transferId/cancel | payload blocked before mutation | blocked | 401 | 26.754ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/transfers/:transferId/cancel | bounded response without crash | blocked | 401 | 26.374ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/invoices | 401/403/400/404 or public status | blocked | 401 | 16.099ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/invoices | 401/403/400/404 or public status | blocked | 401 | 37.936ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/invoices | validation or auth rejection | blocked | 401 | 40.583ms | pass |  |
| security | blocks SQL injection payload | POST | /:enterpriseId/invoices | payload blocked before mutation | blocked | 401 | 22.443ms | pass |  |
| security | blocks XSS payload | POST | /:enterpriseId/invoices | payload blocked before mutation | blocked | 401 | 21.506ms | pass |  |
| performance | records oversized payload behavior | POST | /:enterpriseId/invoices | bounded response without crash | blocked | 401 | 15.850ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/reports/summary | 401/403/400/404 or public status | blocked | 401 | 15.161ms | pass |  |
