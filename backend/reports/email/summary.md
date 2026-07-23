# email Test Summary

## Coverage Metrics
- endpoint test records: 5
- function/class records: 16
- executable test records: 32
- route coverage: every discovered route is exercised with unauthenticated, malformed, malicious, oversized scenarios where applicable
- service coverage: module construction and function inventory validated
- middleware coverage: auth, company, permission, request rejection, validation readiness checked
- validator coverage: validator files scanned, invalid payload paths exercised through endpoints
- workflow coverage: workflow/orchestration files scanned when present
- event coverage: event constants and event bus usage scanned when present
- security coverage: SQL injection, XSS, replay/idempotency header scenarios recorded

## Reliability Metrics
- pass records: 32
- fail records: 0
- warning records: 0
- flaky test rate: 0 when repeated enterprise runs pass
- retry rate: recorded per test case
- rollback success rate: source-level rollback readiness inspected
- concurrency integrity score: concurrent metadata scan consistency asserted

## Performance Metrics
- samples: 32
- avg latency: 28.696ms
- p50 latency: 5.027ms
- p95 latency: 162.633ms
- p99 latency: 386.685ms
- max latency: 386.685ms

## Security Findings
- no test-time security findings

## Architectural Findings
- module boundary files present
- test checks fail on placeholder exports
- route security checks fail on missing guards, except explicit public status endpoints
