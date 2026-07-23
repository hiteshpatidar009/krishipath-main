# enterprise-management Middleware Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | GET | / | 401/403/400/404 or public status | blocked | 401 | 70.282ms | pass |  |
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 86.719ms | pass |  |
| middleware | blocks unauthenticated access | GET | /hierarchy/tree | 401/403/400/404 or public status | blocked | 401 | 14.316ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId | 401/403/400/404 or public status | blocked | 401 | 13.791ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:enterpriseId | 401/403/400/404 or public status | blocked | 401 | 17.324ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:enterpriseId | 401/403/400/404 or public status | blocked | 401 | 11.660ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/activate | 401/403/400/404 or public status | blocked | 401 | 8.352ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/deactivate | 401/403/400/404 or public status | blocked | 401 | 16.934ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/move | 401/403/400/404 or public status | blocked | 401 | 19.715ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/configuration | 401/403/400/404 or public status | blocked | 401 | 14.333ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:enterpriseId/configuration | 401/403/400/404 or public status | blocked | 401 | 18.528ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/configuration/inherit-all | 401/403/400/404 or public status | blocked | 401 | 23.127ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/configuration/copy | 401/403/400/404 or public status | blocked | 401 | 9.257ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:enterpriseId/configuration/overrides/:settingKey | 401/403/400/404 or public status | blocked | 401 | 17.085ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/documents | 401/403/400/404 or public status | blocked | 401 | 21.191ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/documents | 401/403/400/404 or public status | blocked | 401 | 20.904ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:enterpriseId/documents/:documentId | 401/403/400/404 or public status | blocked | 401 | 23.041ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/audit-logs | 401/403/400/404 or public status | blocked | 401 | 46.615ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/companies | 401/403/400/404 or public status | blocked | 401 | 20.582ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/companies | 401/403/400/404 or public status | blocked | 401 | 26.627ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:enterpriseId/companies/:companyId | 401/403/400/404 or public status | blocked | 401 | 26.678ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/users | 401/403/400/404 or public status | blocked | 401 | 24.071ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/users | 401/403/400/404 or public status | blocked | 401 | 18.591ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:enterpriseId/users/:userId | 401/403/400/404 or public status | blocked | 401 | 26.663ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/transfers | 401/403/400/404 or public status | blocked | 401 | 22.731ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers | 401/403/400/404 or public status | blocked | 401 | 22.484ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/transfers/:transferId | 401/403/400/404 or public status | blocked | 401 | 22.354ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/submit | 401/403/400/404 or public status | blocked | 401 | 26.794ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/approve | 401/403/400/404 or public status | blocked | 401 | 14.142ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/reject | 401/403/400/404 or public status | blocked | 401 | 23.727ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/dispatch | 401/403/400/404 or public status | blocked | 401 | 19.522ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/receive | 401/403/400/404 or public status | blocked | 401 | 20.496ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/complete | 401/403/400/404 or public status | blocked | 401 | 21.103ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/settle | 401/403/400/404 or public status | blocked | 401 | 52.578ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/transfers/:transferId/cancel | 401/403/400/404 or public status | blocked | 401 | 29.173ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/invoices | 401/403/400/404 or public status | blocked | 401 | 16.099ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:enterpriseId/invoices | 401/403/400/404 or public status | blocked | 401 | 37.936ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:enterpriseId/reports/summary | 401/403/400/404 or public status | blocked | 401 | 15.161ms | pass |  |
