# document Validation Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 25.013ms | pass |  |
| validation | validation source scan |  |  | validators or parsers present | validation-ready |  | 13.451ms | pass |  |
