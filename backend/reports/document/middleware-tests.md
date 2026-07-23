# document Middleware Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 190.674ms | pass |  |
| middleware | blocks unauthenticated access | GET | / | 401/403/400/404 or public status | blocked | 401 | 21.112ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:id | 401/403/400/404 or public status | blocked | 401 | 26.382ms | pass |  |
