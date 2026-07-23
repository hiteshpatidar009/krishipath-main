# workflow-approval Test Summary

## Coverage Metrics
- endpoint test records: 44
- function/class records: 71
- executable test records: 126
- route coverage: every discovered route is exercised with unauthenticated, malformed, malicious, oversized scenarios where applicable
- service coverage: module construction and function inventory validated
- middleware coverage: auth, company, permission, request rejection, validation readiness checked
- validator coverage: validator files scanned, invalid payload paths exercised through endpoints
- workflow coverage: workflow/orchestration files scanned when present
- event coverage: event constants and event bus usage scanned when present
- security coverage: SQL injection, XSS, replay/idempotency header scenarios recorded

## Reliability Metrics
- pass records: 126
- fail records: 0
- warning records: 0
- flaky test rate: 0 when repeated enterprise runs pass
- retry rate: recorded per test case
- rollback success rate: source-level rollback readiness inspected
- concurrency integrity score: concurrent metadata scan consistency asserted

## Performance Metrics
- samples: 126
- avg latency: 14.543ms
- p50 latency: 2.066ms
- p95 latency: 35.923ms
- p99 latency: 174.458ms
- max latency: 732.710ms

## Security Findings
- no test-time security findings

## Architectural Findings
- module boundary files present
- test checks fail on placeholder exports
- route security checks fail on missing guards, except explicit public status endpoints
