# user Validation Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| validation | rejects malformed payload | POST | /invitations/accept | validation or auth rejection | blocked | 400 | 8.836ms | pass |  |
| validation | rejects malformed payload | POST | /invitations/:id/resend | validation or auth rejection | blocked | 401 | 6.228ms | pass |  |
| validation | rejects malformed payload | POST | /invitations/:id/revoke | validation or auth rejection | blocked | 401 | 4.134ms | pass |  |
| validation | rejects malformed payload | POST | /bulk-action | validation or auth rejection | blocked | 401 | 4.290ms | pass |  |
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 4.043ms | pass |  |
| validation | rejects malformed payload | PUT | /:userId/warehouses | validation or auth rejection | blocked | 401 | 5.955ms | pass |  |
| validation | rejects malformed payload | PATCH | /:userId | validation or auth rejection | blocked | 401 | 4.696ms | pass |  |
| validation | rejects malformed payload | POST | /:userId/roles | validation or auth rejection | blocked | 401 | 4.485ms | pass |  |
| validation | rejects malformed payload | POST | /:userId/activate | validation or auth rejection | blocked | 401 | 4.273ms | pass |  |
| validation | rejects malformed payload | POST | /:userId/suspend | validation or auth rejection | blocked | 401 | 5.317ms | pass |  |
| validation | rejects malformed payload | POST | /:userId/restore | validation or auth rejection | blocked | 401 | 6.281ms | pass |  |
| validation | rejects malformed payload | POST | /:userId/reset-password | validation or auth rejection | blocked | 401 | 7.750ms | pass |  |
| validation | rejects malformed payload | POST | /:userId/reset-mfa | validation or auth rejection | blocked | 401 | 4.060ms | pass |  |
| validation | rejects malformed payload | POST | /:userId/terminate-sessions | validation or auth rejection | blocked | 401 | 5.885ms | pass |  |
| validation | rejects malformed payload | PATCH | /:userId/preferences | validation or auth rejection | blocked | 401 | 3.745ms | pass |  |
| validation | validation source scan |  |  | validators or parsers present | validation-ready |  | 5.624ms | pass |  |
