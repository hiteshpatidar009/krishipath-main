# organization Validation Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 13.584ms | pass |  |
| validation | rejects malformed payload | PATCH | /:organizationId | validation or auth rejection | blocked | 401 | 36.757ms | pass |  |
| validation | rejects malformed payload | POST | /:organizationId/invitations | validation or auth rejection | blocked | 401 | 37.655ms | pass |  |
| validation | rejects malformed payload | POST | /:organizationId/roles | validation or auth rejection | blocked | 401 | 16.526ms | pass |  |
| validation | rejects malformed payload | POST | /:organizationId/activate | validation or auth rejection | blocked | 401 | 45.387ms | pass |  |
| validation | rejects malformed payload | POST | /:organizationId/suspend | validation or auth rejection | blocked | 401 | 17.035ms | pass |  |
| validation | rejects malformed payload | POST | /:organizationId/warehouses | validation or auth rejection | blocked | 401 | 17.650ms | pass |  |
| validation | validation source scan |  |  | validators or parsers present | validation-ready |  | 76.776ms | pass |  |
