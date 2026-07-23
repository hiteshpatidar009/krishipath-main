# sms Validation Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| validation | rejects malformed payload | POST | /send | validation or auth rejection | blocked | 401 | 14.170ms | pass |  |
| validation | validation source scan |  |  | validators or parsers present | validation-ready |  | 7.605ms | pass |  |
