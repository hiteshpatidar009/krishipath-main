# workflow-approval Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=12 |  | 23.401ms | pass |  |
| security | blocks SQL injection payload | POST | /definitions | payload blocked before mutation | blocked | 401 | 13.990ms | pass |  |
| security | blocks XSS payload | POST | /definitions | payload blocked before mutation | blocked | 401 | 14.294ms | pass |  |
| security | blocks SQL injection payload | POST | /start | payload blocked before mutation | blocked | 401 | 10.991ms | pass |  |
| security | blocks XSS payload | POST | /start | payload blocked before mutation | blocked | 401 | 8.824ms | pass |  |
| security | blocks SQL injection payload | POST | /:approvalRequestId/approve | payload blocked before mutation | blocked | 401 | 10.632ms | pass |  |
| security | blocks XSS payload | POST | /:approvalRequestId/approve | payload blocked before mutation | blocked | 401 | 9.248ms | pass |  |
| security | blocks SQL injection payload | POST | /:approvalRequestId/reject | payload blocked before mutation | blocked | 401 | 10.609ms | pass |  |
| security | blocks XSS payload | POST | /:approvalRequestId/reject | payload blocked before mutation | blocked | 401 | 7.988ms | pass |  |
| security | blocks SQL injection payload | POST | /:approvalRequestId/escalate | payload blocked before mutation | blocked | 401 | 7.447ms | pass |  |
| security | blocks XSS payload | POST | /:approvalRequestId/escalate | payload blocked before mutation | blocked | 401 | 6.369ms | pass |  |
| security | blocks SQL injection payload | POST | /:approvalRequestId/reassign | payload blocked before mutation | blocked | 401 | 8.314ms | pass |  |
| security | blocks XSS payload | POST | /:approvalRequestId/reassign | payload blocked before mutation | blocked | 401 | 8.606ms | pass |  |
| security | blocks SQL injection payload | POST | /:approvalRequestId/complete | payload blocked before mutation | blocked | 401 | 23.154ms | pass |  |
| security | blocks XSS payload | POST | /:approvalRequestId/complete | payload blocked before mutation | blocked | 401 | 14.761ms | pass |  |
| security | blocks SQL injection payload | POST | /:approvalRequestId/transition | payload blocked before mutation | blocked | 401 | 13.721ms | pass |  |
| security | blocks XSS payload | POST | /:approvalRequestId/transition | payload blocked before mutation | blocked | 401 | 15.775ms | pass |  |
