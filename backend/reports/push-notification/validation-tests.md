# push-notification Validation Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| validation | rejects malformed payload | POST | /send | validation or auth rejection | blocked | 401 | 30.948ms | pass |  |
| validation | validation source scan |  |  | validators or parsers present | validation-ready |  | 19.095ms | pass |  |
