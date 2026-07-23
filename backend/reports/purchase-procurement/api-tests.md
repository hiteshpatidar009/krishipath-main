# purchase-procurement API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | /suppliers | 401/403/400/404 or public status | blocked | 401 | 173.142ms | pass |  |
| validation | rejects malformed payload | POST | /suppliers | validation or auth rejection | blocked | 401 | 26.721ms | pass |  |
| security | blocks SQL injection payload | POST | /suppliers | payload blocked before mutation | blocked | 401 | 29.043ms | pass |  |
| security | blocks XSS payload | POST | /suppliers | payload blocked before mutation | blocked | 401 | 26.166ms | pass |  |
| performance | records oversized payload behavior | POST | /suppliers | bounded response without crash | blocked | 401 | 30.492ms | pass |  |
| middleware | blocks unauthenticated access | POST | /purchase-orders | 401/403/400/404 or public status | blocked | 401 | 24.544ms | pass |  |
| validation | rejects malformed payload | POST | /purchase-orders | validation or auth rejection | blocked | 401 | 24.367ms | pass |  |
| security | blocks SQL injection payload | POST | /purchase-orders | payload blocked before mutation | blocked | 401 | 22.418ms | pass |  |
| security | blocks XSS payload | POST | /purchase-orders | payload blocked before mutation | blocked | 401 | 25.541ms | pass |  |
| performance | records oversized payload behavior | POST | /purchase-orders | bounded response without crash | blocked | 401 | 24.583ms | pass |  |
| middleware | blocks unauthenticated access | GET | /purchase-orders | 401/403/400/404 or public status | blocked | 401 | 16.487ms | pass |  |
| middleware | blocks unauthenticated access | GET | /purchase-orders/:purchaseOrderId | 401/403/400/404 or public status | blocked | 401 | 17.492ms | pass |  |
| middleware | blocks unauthenticated access | POST | /purchase-orders/:purchaseOrderId/approve | 401/403/400/404 or public status | blocked | 401 | 24.080ms | pass |  |
| validation | rejects malformed payload | POST | /purchase-orders/:purchaseOrderId/approve | validation or auth rejection | blocked | 401 | 29.956ms | pass |  |
| security | blocks SQL injection payload | POST | /purchase-orders/:purchaseOrderId/approve | payload blocked before mutation | blocked | 401 | 19.815ms | pass |  |
| security | blocks XSS payload | POST | /purchase-orders/:purchaseOrderId/approve | payload blocked before mutation | blocked | 401 | 24.423ms | pass |  |
| performance | records oversized payload behavior | POST | /purchase-orders/:purchaseOrderId/approve | bounded response without crash | blocked | 401 | 17.965ms | pass |  |
| middleware | blocks unauthenticated access | POST | /purchase-orders/:purchaseOrderId/reject | 401/403/400/404 or public status | blocked | 401 | 16.715ms | pass |  |
| validation | rejects malformed payload | POST | /purchase-orders/:purchaseOrderId/reject | validation or auth rejection | blocked | 401 | 22.550ms | pass |  |
| security | blocks SQL injection payload | POST | /purchase-orders/:purchaseOrderId/reject | payload blocked before mutation | blocked | 401 | 27.009ms | pass |  |
| security | blocks XSS payload | POST | /purchase-orders/:purchaseOrderId/reject | payload blocked before mutation | blocked | 401 | 15.785ms | pass |  |
| performance | records oversized payload behavior | POST | /purchase-orders/:purchaseOrderId/reject | bounded response without crash | blocked | 401 | 24.654ms | pass |  |
| middleware | blocks unauthenticated access | POST | /purchase-orders/:purchaseOrderId/cancel | 401/403/400/404 or public status | blocked | 401 | 21.317ms | pass |  |
| validation | rejects malformed payload | POST | /purchase-orders/:purchaseOrderId/cancel | validation or auth rejection | blocked | 401 | 55.742ms | pass |  |
| security | blocks SQL injection payload | POST | /purchase-orders/:purchaseOrderId/cancel | payload blocked before mutation | blocked | 401 | 28.483ms | pass |  |
| security | blocks XSS payload | POST | /purchase-orders/:purchaseOrderId/cancel | payload blocked before mutation | blocked | 401 | 58.373ms | pass |  |
| performance | records oversized payload behavior | POST | /purchase-orders/:purchaseOrderId/cancel | bounded response without crash | blocked | 401 | 16.085ms | pass |  |
| middleware | blocks unauthenticated access | POST | /purchase-orders/:purchaseOrderId/receive | 401/403/400/404 or public status | blocked | 401 | 17.271ms | pass |  |
| validation | rejects malformed payload | POST | /purchase-orders/:purchaseOrderId/receive | validation or auth rejection | blocked | 401 | 45.795ms | pass |  |
| security | blocks SQL injection payload | POST | /purchase-orders/:purchaseOrderId/receive | payload blocked before mutation | blocked | 401 | 58.334ms | pass |  |
| security | blocks XSS payload | POST | /purchase-orders/:purchaseOrderId/receive | payload blocked before mutation | blocked | 401 | 22.073ms | pass |  |
| performance | records oversized payload behavior | POST | /purchase-orders/:purchaseOrderId/receive | bounded response without crash | blocked | 401 | 26.310ms | pass |  |
| middleware | blocks unauthenticated access | GET | /goods-receipts | 401/403/400/404 or public status | blocked | 401 | 28.275ms | pass |  |
| middleware | blocks unauthenticated access | GET | /goods-receipts/:goodsReceiptId | 401/403/400/404 or public status | blocked | 401 | 12.426ms | pass |  |
