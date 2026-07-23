# purchase-procurement Validation Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| validation | rejects malformed payload | POST | /suppliers | validation or auth rejection | blocked | 401 | 26.721ms | pass |  |
| validation | rejects malformed payload | POST | /purchase-orders | validation or auth rejection | blocked | 401 | 24.367ms | pass |  |
| validation | rejects malformed payload | POST | /purchase-orders/:purchaseOrderId/approve | validation or auth rejection | blocked | 401 | 29.956ms | pass |  |
| validation | rejects malformed payload | POST | /purchase-orders/:purchaseOrderId/reject | validation or auth rejection | blocked | 401 | 22.550ms | pass |  |
| validation | rejects malformed payload | POST | /purchase-orders/:purchaseOrderId/cancel | validation or auth rejection | blocked | 401 | 55.742ms | pass |  |
| validation | rejects malformed payload | POST | /purchase-orders/:purchaseOrderId/receive | validation or auth rejection | blocked | 401 | 45.795ms | pass |  |
| validation | validation source scan |  |  | validators or parsers present | validation-ready |  | 85.564ms | pass |  |
