# notification Validation Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 34.523ms | pass |  |
| validation | rejects malformed payload | POST | /templates | validation or auth rejection | blocked | 401 | 58.416ms | pass |  |
| validation | validation source scan |  |  | validators or parsers present | validation-ready |  | 19.608ms | pass |  |
