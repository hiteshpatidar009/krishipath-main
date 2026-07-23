# purchase-procurement Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=10 |  | 46.458ms | pass |  |
| security | blocks SQL injection payload | POST | /suppliers | payload blocked before mutation | blocked | 401 | 29.043ms | pass |  |
| security | blocks XSS payload | POST | /suppliers | payload blocked before mutation | blocked | 401 | 26.166ms | pass |  |
| security | blocks SQL injection payload | POST | /purchase-orders | payload blocked before mutation | blocked | 401 | 22.418ms | pass |  |
| security | blocks XSS payload | POST | /purchase-orders | payload blocked before mutation | blocked | 401 | 25.541ms | pass |  |
| security | blocks SQL injection payload | POST | /purchase-orders/:purchaseOrderId/approve | payload blocked before mutation | blocked | 401 | 19.815ms | pass |  |
| security | blocks XSS payload | POST | /purchase-orders/:purchaseOrderId/approve | payload blocked before mutation | blocked | 401 | 24.423ms | pass |  |
| security | blocks SQL injection payload | POST | /purchase-orders/:purchaseOrderId/reject | payload blocked before mutation | blocked | 401 | 27.009ms | pass |  |
| security | blocks XSS payload | POST | /purchase-orders/:purchaseOrderId/reject | payload blocked before mutation | blocked | 401 | 15.785ms | pass |  |
| security | blocks SQL injection payload | POST | /purchase-orders/:purchaseOrderId/cancel | payload blocked before mutation | blocked | 401 | 28.483ms | pass |  |
| security | blocks XSS payload | POST | /purchase-orders/:purchaseOrderId/cancel | payload blocked before mutation | blocked | 401 | 58.373ms | pass |  |
| security | blocks SQL injection payload | POST | /purchase-orders/:purchaseOrderId/receive | payload blocked before mutation | blocked | 401 | 58.334ms | pass |  |
| security | blocks XSS payload | POST | /purchase-orders/:purchaseOrderId/receive | payload blocked before mutation | blocked | 401 | 22.073ms | pass |  |
