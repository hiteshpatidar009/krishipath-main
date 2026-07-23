# workflow-approval API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | /definitions | 401/403/400/404 or public status | blocked | 401 | 174.458ms | pass |  |
| validation | rejects malformed payload | POST | /definitions | validation or auth rejection | blocked | 401 | 15.885ms | pass |  |
| security | blocks SQL injection payload | POST | /definitions | payload blocked before mutation | blocked | 401 | 13.990ms | pass |  |
| security | blocks XSS payload | POST | /definitions | payload blocked before mutation | blocked | 401 | 14.294ms | pass |  |
| performance | records oversized payload behavior | POST | /definitions | bounded response without crash | blocked | 401 | 31.508ms | pass |  |
| middleware | blocks unauthenticated access | GET | /definitions | 401/403/400/404 or public status | blocked | 401 | 16.362ms | pass |  |
| middleware | blocks unauthenticated access | GET | /definitions/:workflowDefinitionId | 401/403/400/404 or public status | blocked | 401 | 14.157ms | pass |  |
| middleware | blocks unauthenticated access | POST | /start | 401/403/400/404 or public status | blocked | 401 | 8.441ms | pass |  |
| validation | rejects malformed payload | POST | /start | validation or auth rejection | blocked | 401 | 16.500ms | pass |  |
| security | blocks SQL injection payload | POST | /start | payload blocked before mutation | blocked | 401 | 10.991ms | pass |  |
| security | blocks XSS payload | POST | /start | payload blocked before mutation | blocked | 401 | 8.824ms | pass |  |
| performance | records oversized payload behavior | POST | /start | bounded response without crash | blocked | 401 | 11.900ms | pass |  |
| middleware | blocks unauthenticated access | GET | /requests | 401/403/400/404 or public status | blocked | 401 | 9.376ms | pass |  |
| middleware | blocks unauthenticated access | GET | /requests/:approvalRequestId | 401/403/400/404 or public status | blocked | 401 | 11.674ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:approvalRequestId/approve | 401/403/400/404 or public status | blocked | 401 | 12.582ms | pass |  |
| validation | rejects malformed payload | POST | /:approvalRequestId/approve | validation or auth rejection | blocked | 401 | 11.570ms | pass |  |
| security | blocks SQL injection payload | POST | /:approvalRequestId/approve | payload blocked before mutation | blocked | 401 | 10.632ms | pass |  |
| security | blocks XSS payload | POST | /:approvalRequestId/approve | payload blocked before mutation | blocked | 401 | 9.248ms | pass |  |
| performance | records oversized payload behavior | POST | /:approvalRequestId/approve | bounded response without crash | blocked | 401 | 8.932ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:approvalRequestId/reject | 401/403/400/404 or public status | blocked | 401 | 9.243ms | pass |  |
| validation | rejects malformed payload | POST | /:approvalRequestId/reject | validation or auth rejection | blocked | 401 | 8.664ms | pass |  |
| security | blocks SQL injection payload | POST | /:approvalRequestId/reject | payload blocked before mutation | blocked | 401 | 10.609ms | pass |  |
| security | blocks XSS payload | POST | /:approvalRequestId/reject | payload blocked before mutation | blocked | 401 | 7.988ms | pass |  |
| performance | records oversized payload behavior | POST | /:approvalRequestId/reject | bounded response without crash | blocked | 401 | 9.143ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:approvalRequestId/escalate | 401/403/400/404 or public status | blocked | 401 | 8.000ms | pass |  |
| validation | rejects malformed payload | POST | /:approvalRequestId/escalate | validation or auth rejection | blocked | 401 | 7.919ms | pass |  |
| security | blocks SQL injection payload | POST | /:approvalRequestId/escalate | payload blocked before mutation | blocked | 401 | 7.447ms | pass |  |
| security | blocks XSS payload | POST | /:approvalRequestId/escalate | payload blocked before mutation | blocked | 401 | 6.369ms | pass |  |
| performance | records oversized payload behavior | POST | /:approvalRequestId/escalate | bounded response without crash | blocked | 401 | 7.260ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:approvalRequestId/reassign | 401/403/400/404 or public status | blocked | 401 | 7.235ms | pass |  |
| validation | rejects malformed payload | POST | /:approvalRequestId/reassign | validation or auth rejection | blocked | 401 | 15.144ms | pass |  |
| security | blocks SQL injection payload | POST | /:approvalRequestId/reassign | payload blocked before mutation | blocked | 401 | 8.314ms | pass |  |
| security | blocks XSS payload | POST | /:approvalRequestId/reassign | payload blocked before mutation | blocked | 401 | 8.606ms | pass |  |
| performance | records oversized payload behavior | POST | /:approvalRequestId/reassign | bounded response without crash | blocked | 401 | 19.866ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:approvalRequestId/complete | 401/403/400/404 or public status | blocked | 401 | 29.059ms | pass |  |
| validation | rejects malformed payload | POST | /:approvalRequestId/complete | validation or auth rejection | blocked | 401 | 19.235ms | pass |  |
| security | blocks SQL injection payload | POST | /:approvalRequestId/complete | payload blocked before mutation | blocked | 401 | 23.154ms | pass |  |
| security | blocks XSS payload | POST | /:approvalRequestId/complete | payload blocked before mutation | blocked | 401 | 14.761ms | pass |  |
| performance | records oversized payload behavior | POST | /:approvalRequestId/complete | bounded response without crash | blocked | 401 | 23.453ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:approvalRequestId/transition | 401/403/400/404 or public status | blocked | 401 | 12.364ms | pass |  |
| validation | rejects malformed payload | POST | /:approvalRequestId/transition | validation or auth rejection | blocked | 401 | 13.168ms | pass |  |
| security | blocks SQL injection payload | POST | /:approvalRequestId/transition | payload blocked before mutation | blocked | 401 | 13.721ms | pass |  |
| security | blocks XSS payload | POST | /:approvalRequestId/transition | payload blocked before mutation | blocked | 401 | 15.775ms | pass |  |
| performance | records oversized payload behavior | POST | /:approvalRequestId/transition | bounded response without crash | blocked | 401 | 13.926ms | pass |  |
