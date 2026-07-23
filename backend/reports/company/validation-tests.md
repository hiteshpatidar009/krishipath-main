# company Validation Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 27.949ms | pass |  |
| validation | rejects malformed payload | POST | /organizations | validation or auth rejection | blocked | 401 | 33.580ms | pass |  |
| validation | rejects malformed payload | PATCH | /settings | validation or auth rejection | blocked | 401 | 27.200ms | pass |  |
| validation | rejects malformed payload | PATCH | /organizations/:organizationId/settings | validation or auth rejection | blocked | 401 | 22.234ms | pass |  |
| validation | rejects malformed payload | POST | /access/organization | validation or auth rejection | blocked | 401 | 13.261ms | pass |  |
| validation | rejects malformed payload | POST | /access/warehouse | validation or auth rejection | blocked | 401 | 12.814ms | pass |  |
| validation | rejects malformed payload | POST | /suspend | validation or auth rejection | blocked | 401 | 16.815ms | pass |  |
| validation | rejects malformed payload | POST | /activate | validation or auth rejection | blocked | 401 | 15.386ms | pass |  |
| validation | rejects malformed payload | POST | /subscription/link | validation or auth rejection | blocked | 401 | 16.476ms | pass |  |
| validation | rejects malformed payload | PATCH | /onboarding | validation or auth rejection | blocked | 401 | 17.186ms | pass |  |
| validation | validation source scan |  |  | validators or parsers present | validation-ready |  | 79.807ms | pass |  |
