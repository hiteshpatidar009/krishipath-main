# workflow-approval Validation Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| validation | rejects malformed payload | POST | /definitions | validation or auth rejection | blocked | 401 | 15.885ms | pass |  |
| validation | rejects malformed payload | POST | /start | validation or auth rejection | blocked | 401 | 16.500ms | pass |  |
| validation | rejects malformed payload | POST | /:approvalRequestId/approve | validation or auth rejection | blocked | 401 | 11.570ms | pass |  |
| validation | rejects malformed payload | POST | /:approvalRequestId/reject | validation or auth rejection | blocked | 401 | 8.664ms | pass |  |
| validation | rejects malformed payload | POST | /:approvalRequestId/escalate | validation or auth rejection | blocked | 401 | 7.919ms | pass |  |
| validation | rejects malformed payload | POST | /:approvalRequestId/reassign | validation or auth rejection | blocked | 401 | 15.144ms | pass |  |
| validation | rejects malformed payload | POST | /:approvalRequestId/complete | validation or auth rejection | blocked | 401 | 19.235ms | pass |  |
| validation | rejects malformed payload | POST | /:approvalRequestId/transition | validation or auth rejection | blocked | 401 | 13.168ms | pass |  |
| validation | validation source scan |  |  | validators or parsers present | validation-ready |  | 44.843ms | pass |  |
