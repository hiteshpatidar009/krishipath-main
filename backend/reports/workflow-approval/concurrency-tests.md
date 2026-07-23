# workflow-approval Concurrency Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| concurrency | parallel metadata scan |  |  | all concurrent scans return same count | consistent-count=19 |  | 732.710ms | pass |  |
