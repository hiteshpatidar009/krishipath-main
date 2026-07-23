# enterprise-management Validation Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 16.570ms | pass |  |
| validation | rejects malformed payload | PATCH | /:enterpriseId | validation or auth rejection | blocked | 401 | 13.882ms | pass |  |
| validation | rejects malformed payload | DELETE | /:enterpriseId | validation or auth rejection | blocked | 401 | 7.629ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/activate | validation or auth rejection | blocked | 401 | 7.320ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/deactivate | validation or auth rejection | blocked | 401 | 21.737ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/move | validation or auth rejection | blocked | 401 | 15.696ms | pass |  |
| validation | rejects malformed payload | PATCH | /:enterpriseId/configuration | validation or auth rejection | blocked | 401 | 20.993ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/configuration/inherit-all | validation or auth rejection | blocked | 401 | 16.630ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/configuration/copy | validation or auth rejection | blocked | 401 | 10.766ms | pass |  |
| validation | rejects malformed payload | DELETE | /:enterpriseId/configuration/overrides/:settingKey | validation or auth rejection | blocked | 401 | 18.569ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/documents | validation or auth rejection | blocked | 401 | 30.018ms | pass |  |
| validation | rejects malformed payload | DELETE | /:enterpriseId/documents/:documentId | validation or auth rejection | blocked | 401 | 15.911ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/companies | validation or auth rejection | blocked | 401 | 18.930ms | pass |  |
| validation | rejects malformed payload | DELETE | /:enterpriseId/companies/:companyId | validation or auth rejection | blocked | 401 | 48.496ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/users | validation or auth rejection | blocked | 401 | 41.829ms | pass |  |
| validation | rejects malformed payload | DELETE | /:enterpriseId/users/:userId | validation or auth rejection | blocked | 401 | 27.117ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers | validation or auth rejection | blocked | 401 | 16.326ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/submit | validation or auth rejection | blocked | 401 | 14.342ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/approve | validation or auth rejection | blocked | 401 | 22.199ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/reject | validation or auth rejection | blocked | 401 | 18.866ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/dispatch | validation or auth rejection | blocked | 401 | 21.094ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/receive | validation or auth rejection | blocked | 401 | 19.539ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/complete | validation or auth rejection | blocked | 401 | 20.776ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/settle | validation or auth rejection | blocked | 401 | 31.119ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/transfers/:transferId/cancel | validation or auth rejection | blocked | 401 | 59.021ms | pass |  |
| validation | rejects malformed payload | POST | /:enterpriseId/invoices | validation or auth rejection | blocked | 401 | 40.583ms | pass |  |
| validation | validation source scan |  |  | validators or parsers present | validation-ready |  | 26.461ms | pass |  |
