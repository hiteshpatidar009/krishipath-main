# file-storage Validation Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| validation | rejects malformed payload | POST | /sign | validation or auth rejection | blocked | 401 | 33.356ms | pass |  |
| validation | validation source scan |  |  | validators or parsers present | validation-ready |  | 20.372ms | pass |  |
