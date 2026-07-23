# audit-log Validation Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 30.697ms | pass |  |
| validation | validation source scan |  |  | validators or parsers present | validation-ready |  | 22.144ms | pass |  |
