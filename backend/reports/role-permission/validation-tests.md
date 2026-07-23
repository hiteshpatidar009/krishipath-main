# role-permission Validation Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| validation | rejects malformed payload | POST | /roles | validation or auth rejection | blocked | 401 | 27.041ms | pass |  |
| validation | rejects malformed payload | PATCH | /roles/:roleId | validation or auth rejection | blocked | 401 | 26.137ms | pass |  |
| validation | rejects malformed payload | DELETE | /roles/:roleId | validation or auth rejection | blocked | 401 | 32.248ms | pass |  |
| validation | rejects malformed payload | POST | /roles/:roleId/permissions | validation or auth rejection | blocked | 401 | 27.876ms | pass |  |
| validation | rejects malformed payload | POST | /roles/:roleId/clone | validation or auth rejection | blocked | 401 | 14.464ms | pass |  |
| validation | rejects malformed payload | POST | /roles/:roleId/retire | validation or auth rejection | blocked | 401 | 43.282ms | pass |  |
| validation | rejects malformed payload | POST | /roles/:roleId/restore | validation or auth rejection | blocked | 401 | 19.127ms | pass |  |
| validation | rejects malformed payload | PUT | /permissions/matrix | validation or auth rejection | blocked | 401 | 14.473ms | pass |  |
| validation | rejects malformed payload | POST | /permissions/publish | validation or auth rejection | blocked | 401 | 20.181ms | pass |  |
| validation | rejects malformed payload | POST | /permissions/compare | validation or auth rejection | blocked | 401 | 20.942ms | pass |  |
| validation | validation source scan |  |  | validators or parsers present | validation-ready |  | 37.850ms | pass |  |
