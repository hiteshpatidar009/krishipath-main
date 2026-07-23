# auth Validation Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| validation | rejects malformed payload | POST | /signup | validation or auth rejection | blocked | 422 | 27.675ms | pass |  |
| validation | rejects malformed payload | POST | /login | validation or auth rejection | blocked | 422 | 32.085ms | pass |  |
| validation | rejects malformed payload | POST | /mfa/start | validation or auth rejection | blocked | 500 | 30.115ms | pass |  |
| validation | rejects malformed payload | POST | /mfa/verify | validation or auth rejection | blocked | 500 | 430.825ms | pass |  |
| validation | rejects malformed payload | POST | /refresh | validation or auth rejection | blocked | 400 | 531.925ms | pass |  |
| validation | rejects malformed payload | POST | /switch-company | validation or auth rejection | blocked | 400 | 26.354ms | pass |  |
| validation | rejects malformed payload | POST | /password/forgot | validation or auth rejection | blocked | 422 | 28.295ms | pass |  |
| validation | rejects malformed payload | POST | /password/reset | validation or auth rejection | blocked | 422 | 28.669ms | pass |  |
| validation | rejects malformed payload | POST | /password-reset/request | validation or auth rejection | blocked | 422 | 28.037ms | pass |  |
| validation | rejects malformed payload | POST | /password-reset/validate | validation or auth rejection | blocked | 422 | 6.568ms | pass |  |
| validation | rejects malformed payload | POST | /password-reset/complete | validation or auth rejection | blocked | 422 | 30.690ms | pass |  |
| validation | rejects malformed payload | POST | /plan | validation or auth rejection | blocked | 400 | 5.792ms | pass |  |
| validation | rejects malformed payload | POST | /subscription/activate | validation or auth rejection | blocked | 400 | 8.266ms | pass |  |
| validation | rejects malformed payload | DELETE | /mfa/trust-sessions | validation or auth rejection | blocked | 400 | 7.625ms | pass |  |
| validation | rejects malformed payload | DELETE | /mfa/trust-sessions/all | validation or auth rejection | blocked | 400 | 7.328ms | pass |  |
| validation | rejects malformed payload | DELETE | /sessions | validation or auth rejection | blocked | 400 | 5.169ms | pass |  |
| validation | rejects malformed payload | POST | /sessions/revoke-others | validation or auth rejection | blocked | 400 | 5.429ms | pass |  |
| validation | rejects malformed payload | POST | /roles | validation or auth rejection | blocked | 400 | 7.606ms | pass |  |
| validation | rejects malformed payload | POST | /users | validation or auth rejection | blocked | 400 | 6.163ms | pass |  |
| validation | validation source scan |  |  | validators or parsers present | validation-ready |  | 73.218ms | pass |  |
