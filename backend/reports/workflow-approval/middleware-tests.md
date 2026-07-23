# workflow-approval Middleware Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | /definitions | 401/403/400/404 or public status | blocked | 401 | 174.458ms | pass |  |
| middleware | blocks unauthenticated access | GET | /definitions | 401/403/400/404 or public status | blocked | 401 | 16.362ms | pass |  |
| middleware | blocks unauthenticated access | GET | /definitions/:workflowDefinitionId | 401/403/400/404 or public status | blocked | 401 | 14.157ms | pass |  |
| middleware | blocks unauthenticated access | POST | /start | 401/403/400/404 or public status | blocked | 401 | 8.441ms | pass |  |
| middleware | blocks unauthenticated access | GET | /requests | 401/403/400/404 or public status | blocked | 401 | 9.376ms | pass |  |
| middleware | blocks unauthenticated access | GET | /requests/:approvalRequestId | 401/403/400/404 or public status | blocked | 401 | 11.674ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:approvalRequestId/approve | 401/403/400/404 or public status | blocked | 401 | 12.582ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:approvalRequestId/reject | 401/403/400/404 or public status | blocked | 401 | 9.243ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:approvalRequestId/escalate | 401/403/400/404 or public status | blocked | 401 | 8.000ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:approvalRequestId/reassign | 401/403/400/404 or public status | blocked | 401 | 7.235ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:approvalRequestId/complete | 401/403/400/404 or public status | blocked | 401 | 29.059ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:approvalRequestId/transition | 401/403/400/404 or public status | blocked | 401 | 12.364ms | pass |  |
