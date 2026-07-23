# purchase-procurement Middleware Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | /suppliers | 401/403/400/404 or public status | blocked | 401 | 173.142ms | pass |  |
| middleware | blocks unauthenticated access | POST | /purchase-orders | 401/403/400/404 or public status | blocked | 401 | 24.544ms | pass |  |
| middleware | blocks unauthenticated access | GET | /purchase-orders | 401/403/400/404 or public status | blocked | 401 | 16.487ms | pass |  |
| middleware | blocks unauthenticated access | GET | /purchase-orders/:purchaseOrderId | 401/403/400/404 or public status | blocked | 401 | 17.492ms | pass |  |
| middleware | blocks unauthenticated access | POST | /purchase-orders/:purchaseOrderId/approve | 401/403/400/404 or public status | blocked | 401 | 24.080ms | pass |  |
| middleware | blocks unauthenticated access | POST | /purchase-orders/:purchaseOrderId/reject | 401/403/400/404 or public status | blocked | 401 | 16.715ms | pass |  |
| middleware | blocks unauthenticated access | POST | /purchase-orders/:purchaseOrderId/cancel | 401/403/400/404 or public status | blocked | 401 | 21.317ms | pass |  |
| middleware | blocks unauthenticated access | POST | /purchase-orders/:purchaseOrderId/receive | 401/403/400/404 or public status | blocked | 401 | 17.271ms | pass |  |
| middleware | blocks unauthenticated access | GET | /goods-receipts | 401/403/400/404 or public status | blocked | 401 | 28.275ms | pass |  |
| middleware | blocks unauthenticated access | GET | /goods-receipts/:goodsReceiptId | 401/403/400/404 or public status | blocked | 401 | 12.426ms | pass |  |
