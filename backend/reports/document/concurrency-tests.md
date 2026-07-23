# document Concurrency Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| concurrency | parallel metadata scan |  |  | all concurrent scans return same count | consistent-count=12 |  | 400.047ms | pass |  |
