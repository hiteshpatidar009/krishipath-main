# warehouse API Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| middleware | blocks unauthenticated access | POST | / | 401/403/400/404 or public status | blocked | 401 | 63.390ms | pass |  |
| validation | rejects malformed payload | POST | / | validation or auth rejection | blocked | 401 | 12.935ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 11.496ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 12.329ms | pass |  |
| performance | records oversized payload behavior | POST | / | bounded response without crash | blocked | 401 | 14.166ms | pass |  |
| middleware | blocks unauthenticated access | GET | / | 401/403/400/404 or public status | blocked | 401 | 10.028ms | pass |  |
| middleware | blocks unauthenticated access | GET | /dashboard | 401/403/400/404 or public status | blocked | 401 | 8.881ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/details | 401/403/400/404 or public status | blocked | 401 | 9.677ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/zones/dashboard | 401/403/400/404 or public status | blocked | 401 | 14.235ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/zones | 401/403/400/404 or public status | blocked | 401 | 9.161ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/zones | 401/403/400/404 or public status | blocked | 401 | 9.461ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/zones | validation or auth rejection | blocked | 401 | 9.090ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/zones | payload blocked before mutation | blocked | 401 | 11.459ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/zones | payload blocked before mutation | blocked | 401 | 9.425ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/zones | bounded response without crash | blocked | 401 | 9.288ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/zones/:zoneId/details | 401/403/400/404 or public status | blocked | 401 | 7.968ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/zones/:zoneId/staff | 401/403/400/404 or public status | blocked | 401 | 11.221ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/zones/:zoneId/staff | 401/403/400/404 or public status | blocked | 401 | 9.662ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/zones/:zoneId/staff | validation or auth rejection | blocked | 401 | 10.365ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/zones/:zoneId/staff | payload blocked before mutation | blocked | 401 | 16.292ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/zones/:zoneId/staff | payload blocked before mutation | blocked | 401 | 8.563ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/zones/:zoneId/staff | bounded response without crash | blocked | 401 | 8.247ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/zones/:zoneId/activity | 401/403/400/404 or public status | blocked | 401 | 8.149ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/zones/:zoneId | 401/403/400/404 or public status | blocked | 401 | 7.866ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:warehouseId/zones/:zoneId | 401/403/400/404 or public status | blocked | 401 | 10.072ms | pass |  |
| validation | rejects malformed payload | PATCH | /:warehouseId/zones/:zoneId | validation or auth rejection | blocked | 401 | 8.446ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/zones/:zoneId | payload blocked before mutation | blocked | 401 | 9.053ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/zones/:zoneId | payload blocked before mutation | blocked | 401 | 8.834ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:warehouseId/zones/:zoneId | bounded response without crash | blocked | 401 | 11.350ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:warehouseId/zones/:zoneId | 401/403/400/404 or public status | blocked | 401 | 7.571ms | pass |  |
| validation | rejects malformed payload | DELETE | /:warehouseId/zones/:zoneId | validation or auth rejection | blocked | 401 | 8.014ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/zones/:zoneId | payload blocked before mutation | blocked | 401 | 8.252ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/zones/:zoneId | payload blocked before mutation | blocked | 401 | 10.301ms | pass |  |
| performance | records oversized payload behavior | DELETE | /:warehouseId/zones/:zoneId | bounded response without crash | blocked | 401 | 7.703ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/bins/dashboard | 401/403/400/404 or public status | blocked | 401 | 7.839ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/bins | 401/403/400/404 or public status | blocked | 401 | 7.714ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/bins | 401/403/400/404 or public status | blocked | 401 | 10.346ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/bins | validation or auth rejection | blocked | 401 | 8.229ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/bins | payload blocked before mutation | blocked | 401 | 8.044ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/bins | payload blocked before mutation | blocked | 401 | 8.118ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/bins | bounded response without crash | blocked | 401 | 11.452ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/bins/:binId/details | 401/403/400/404 or public status | blocked | 401 | 8.170ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/bins/:binId/inventory | 401/403/400/404 or public status | blocked | 401 | 8.345ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/bins/:binId/movements | 401/403/400/404 or public status | blocked | 401 | 8.061ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/bins/:binId/adjacent | 401/403/400/404 or public status | blocked | 401 | 10.435ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/bins/:binId/activity | 401/403/400/404 or public status | blocked | 401 | 8.914ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/bins/:binId/lock | 401/403/400/404 or public status | blocked | 401 | 9.065ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/bins/:binId/lock | validation or auth rejection | blocked | 401 | 8.464ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/bins/:binId/lock | payload blocked before mutation | blocked | 401 | 12.001ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/bins/:binId/lock | payload blocked before mutation | blocked | 401 | 10.815ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/bins/:binId/lock | bounded response without crash | blocked | 401 | 14.920ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/bins/:binId/unlock | 401/403/400/404 or public status | blocked | 401 | 8.722ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/bins/:binId/unlock | validation or auth rejection | blocked | 401 | 8.321ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/bins/:binId/unlock | payload blocked before mutation | blocked | 401 | 8.469ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/bins/:binId/unlock | payload blocked before mutation | blocked | 401 | 7.892ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/bins/:binId/unlock | bounded response without crash | blocked | 401 | 10.655ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/bins/:binId/maintenance | 401/403/400/404 or public status | blocked | 401 | 8.117ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/bins/:binId/maintenance | validation or auth rejection | blocked | 401 | 7.794ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/bins/:binId/maintenance | payload blocked before mutation | blocked | 401 | 8.539ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/bins/:binId/maintenance | payload blocked before mutation | blocked | 401 | 11.914ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/bins/:binId/maintenance | bounded response without crash | blocked | 401 | 8.126ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/bins/:binId/transfer | 401/403/400/404 or public status | blocked | 401 | 8.076ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/bins/:binId/transfer | validation or auth rejection | blocked | 401 | 7.942ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/bins/:binId/transfer | payload blocked before mutation | blocked | 401 | 10.579ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/bins/:binId/transfer | payload blocked before mutation | blocked | 401 | 8.105ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/bins/:binId/transfer | bounded response without crash | blocked | 401 | 8.266ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/bins/:binId/merge | 401/403/400/404 or public status | blocked | 401 | 8.015ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/bins/:binId/merge | validation or auth rejection | blocked | 401 | 10.233ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/bins/:binId/merge | payload blocked before mutation | blocked | 401 | 8.446ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/bins/:binId/merge | payload blocked before mutation | blocked | 401 | 7.823ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/bins/:binId/merge | bounded response without crash | blocked | 401 | 8.756ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/bins/:binId/split | 401/403/400/404 or public status | blocked | 401 | 10.132ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/bins/:binId/split | validation or auth rejection | blocked | 401 | 7.788ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/bins/:binId/split | payload blocked before mutation | blocked | 401 | 7.802ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/bins/:binId/split | payload blocked before mutation | blocked | 401 | 8.566ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/bins/:binId/split | bounded response without crash | blocked | 401 | 10.345ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/bins/:binId | 401/403/400/404 or public status | blocked | 401 | 8.081ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:warehouseId/bins/:binId | 401/403/400/404 or public status | blocked | 401 | 7.612ms | pass |  |
| validation | rejects malformed payload | PATCH | /:warehouseId/bins/:binId | validation or auth rejection | blocked | 401 | 8.178ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/bins/:binId | payload blocked before mutation | blocked | 401 | 10.082ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/bins/:binId | payload blocked before mutation | blocked | 401 | 8.424ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:warehouseId/bins/:binId | bounded response without crash | blocked | 401 | 8.375ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:warehouseId/bins/:binId | 401/403/400/404 or public status | blocked | 401 | 7.541ms | pass |  |
| validation | rejects malformed payload | DELETE | /:warehouseId/bins/:binId | validation or auth rejection | blocked | 401 | 9.995ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/bins/:binId | payload blocked before mutation | blocked | 401 | 7.452ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/bins/:binId | payload blocked before mutation | blocked | 401 | 7.536ms | pass |  |
| performance | records oversized payload behavior | DELETE | /:warehouseId/bins/:binId | bounded response without crash | blocked | 401 | 7.766ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/putaway/rules/dashboard | 401/403/400/404 or public status | blocked | 401 | 9.985ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/putaway/rules | 401/403/400/404 or public status | blocked | 401 | 7.918ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/putaway/rules | 401/403/400/404 or public status | blocked | 401 | 7.976ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/putaway/rules | validation or auth rejection | blocked | 401 | 8.191ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/rules | payload blocked before mutation | blocked | 401 | 10.343ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/rules | payload blocked before mutation | blocked | 401 | 7.784ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/putaway/rules | bounded response without crash | blocked | 401 | 8.574ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/putaway/rules/import | 401/403/400/404 or public status | blocked | 401 | 8.172ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/putaway/rules/import | validation or auth rejection | blocked | 401 | 10.830ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/rules/import | payload blocked before mutation | blocked | 401 | 7.685ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/rules/import | payload blocked before mutation | blocked | 401 | 7.970ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/putaway/rules/import | bounded response without crash | blocked | 401 | 7.818ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/putaway/rules/export | 401/403/400/404 or public status | blocked | 401 | 9.833ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/putaway/rules/:ruleId/details | 401/403/400/404 or public status | blocked | 401 | 8.103ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/putaway/rules/:ruleId/history | 401/403/400/404 or public status | blocked | 401 | 7.170ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/putaway/rules/:ruleId/activity | 401/403/400/404 or public status | blocked | 401 | 7.658ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/putaway/rules/:ruleId/duplicate | 401/403/400/404 or public status | blocked | 401 | 10.096ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/putaway/rules/:ruleId/duplicate | validation or auth rejection | blocked | 401 | 8.132ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/rules/:ruleId/duplicate | payload blocked before mutation | blocked | 401 | 7.600ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/rules/:ruleId/duplicate | payload blocked before mutation | blocked | 401 | 7.481ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/putaway/rules/:ruleId/duplicate | bounded response without crash | blocked | 401 | 10.427ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/putaway/rules/:ruleId/activate | 401/403/400/404 or public status | blocked | 401 | 8.082ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/putaway/rules/:ruleId/activate | validation or auth rejection | blocked | 401 | 8.288ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/rules/:ruleId/activate | payload blocked before mutation | blocked | 401 | 8.353ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/rules/:ruleId/activate | payload blocked before mutation | blocked | 401 | 10.460ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/putaway/rules/:ruleId/activate | bounded response without crash | blocked | 401 | 8.139ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/putaway/rules/:ruleId/deactivate | 401/403/400/404 or public status | blocked | 401 | 8.737ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/putaway/rules/:ruleId/deactivate | validation or auth rejection | blocked | 401 | 8.041ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/rules/:ruleId/deactivate | payload blocked before mutation | blocked | 401 | 10.443ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/rules/:ruleId/deactivate | payload blocked before mutation | blocked | 401 | 8.115ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/putaway/rules/:ruleId/deactivate | bounded response without crash | blocked | 401 | 8.053ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/putaway/rules/:ruleId/test | 401/403/400/404 or public status | blocked | 401 | 8.123ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/putaway/rules/:ruleId/test | validation or auth rejection | blocked | 401 | 10.213ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/rules/:ruleId/test | payload blocked before mutation | blocked | 401 | 8.103ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/rules/:ruleId/test | payload blocked before mutation | blocked | 401 | 8.612ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/putaway/rules/:ruleId/test | bounded response without crash | blocked | 401 | 7.750ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/putaway/rules/:ruleId | 401/403/400/404 or public status | blocked | 401 | 10.150ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:warehouseId/putaway/rules/:ruleId | 401/403/400/404 or public status | blocked | 401 | 7.922ms | pass |  |
| validation | rejects malformed payload | PATCH | /:warehouseId/putaway/rules/:ruleId | validation or auth rejection | blocked | 401 | 7.811ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/putaway/rules/:ruleId | payload blocked before mutation | blocked | 401 | 7.940ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/putaway/rules/:ruleId | payload blocked before mutation | blocked | 401 | 10.382ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:warehouseId/putaway/rules/:ruleId | bounded response without crash | blocked | 401 | 8.269ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:warehouseId/putaway/rules/:ruleId | 401/403/400/404 or public status | blocked | 401 | 7.720ms | pass |  |
| validation | rejects malformed payload | DELETE | /:warehouseId/putaway/rules/:ruleId | validation or auth rejection | blocked | 401 | 7.900ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/putaway/rules/:ruleId | payload blocked before mutation | blocked | 401 | 10.621ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/putaway/rules/:ruleId | payload blocked before mutation | blocked | 401 | 7.536ms | pass |  |
| performance | records oversized payload behavior | DELETE | /:warehouseId/putaway/rules/:ruleId | bounded response without crash | blocked | 401 | 7.257ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/putaway/suggestion | 401/403/400/404 or public status | blocked | 401 | 7.401ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/putaway/suggestion | validation or auth rejection | blocked | 401 | 10.372ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/suggestion | payload blocked before mutation | blocked | 401 | 8.320ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/suggestion | payload blocked before mutation | blocked | 401 | 7.747ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/putaway/suggestion | bounded response without crash | blocked | 401 | 8.101ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/putaway/groups | 401/403/400/404 or public status | blocked | 401 | 10.433ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/putaway/groups | 401/403/400/404 or public status | blocked | 401 | 8.089ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/putaway/groups | validation or auth rejection | blocked | 401 | 7.736ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/groups | payload blocked before mutation | blocked | 401 | 8.287ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/groups | payload blocked before mutation | blocked | 401 | 11.075ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/putaway/groups | bounded response without crash | blocked | 401 | 9.148ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/putaway/groups/:groupId | 401/403/400/404 or public status | blocked | 401 | 7.132ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:warehouseId/putaway/groups/:groupId | 401/403/400/404 or public status | blocked | 401 | 7.555ms | pass |  |
| validation | rejects malformed payload | PATCH | /:warehouseId/putaway/groups/:groupId | validation or auth rejection | blocked | 401 | 10.506ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/putaway/groups/:groupId | payload blocked before mutation | blocked | 401 | 8.867ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/putaway/groups/:groupId | payload blocked before mutation | blocked | 401 | 10.177ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:warehouseId/putaway/groups/:groupId | bounded response without crash | blocked | 401 | 7.652ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:warehouseId/putaway/groups/:groupId | 401/403/400/404 or public status | blocked | 401 | 10.165ms | pass |  |
| validation | rejects malformed payload | DELETE | /:warehouseId/putaway/groups/:groupId | validation or auth rejection | blocked | 401 | 7.357ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/putaway/groups/:groupId | payload blocked before mutation | blocked | 401 | 7.382ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/putaway/groups/:groupId | payload blocked before mutation | blocked | 401 | 7.329ms | pass |  |
| performance | records oversized payload behavior | DELETE | /:warehouseId/putaway/groups/:groupId | bounded response without crash | blocked | 401 | 10.557ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/putaway/groups/:groupId/activate | 401/403/400/404 or public status | blocked | 401 | 7.788ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/putaway/groups/:groupId/activate | validation or auth rejection | blocked | 401 | 7.233ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/groups/:groupId/activate | payload blocked before mutation | blocked | 401 | 8.229ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/groups/:groupId/activate | payload blocked before mutation | blocked | 401 | 10.244ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/putaway/groups/:groupId/activate | bounded response without crash | blocked | 401 | 8.011ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/putaway/groups/:groupId/deactivate | 401/403/400/404 or public status | blocked | 401 | 8.007ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/putaway/groups/:groupId/deactivate | validation or auth rejection | blocked | 401 | 7.947ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/groups/:groupId/deactivate | payload blocked before mutation | blocked | 401 | 10.251ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/groups/:groupId/deactivate | payload blocked before mutation | blocked | 401 | 7.075ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/putaway/groups/:groupId/deactivate | bounded response without crash | blocked | 401 | 6.830ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/putaway/slotting | 401/403/400/404 or public status | blocked | 401 | 7.092ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/putaway/slotting | 401/403/400/404 or public status | blocked | 401 | 10.285ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/putaway/slotting | validation or auth rejection | blocked | 401 | 8.142ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/slotting | payload blocked before mutation | blocked | 401 | 8.042ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/slotting | payload blocked before mutation | blocked | 401 | 7.925ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/putaway/slotting | bounded response without crash | blocked | 401 | 11.016ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/putaway/slotting/:strategyId | 401/403/400/404 or public status | blocked | 401 | 7.753ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:warehouseId/putaway/slotting/:strategyId | 401/403/400/404 or public status | blocked | 401 | 7.828ms | pass |  |
| validation | rejects malformed payload | PATCH | /:warehouseId/putaway/slotting/:strategyId | validation or auth rejection | blocked | 401 | 8.140ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/putaway/slotting/:strategyId | payload blocked before mutation | blocked | 401 | 10.714ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/putaway/slotting/:strategyId | payload blocked before mutation | blocked | 401 | 8.022ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:warehouseId/putaway/slotting/:strategyId | bounded response without crash | blocked | 401 | 8.369ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:warehouseId/putaway/slotting/:strategyId | 401/403/400/404 or public status | blocked | 401 | 8.013ms | pass |  |
| validation | rejects malformed payload | DELETE | /:warehouseId/putaway/slotting/:strategyId | validation or auth rejection | blocked | 401 | 10.137ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/putaway/slotting/:strategyId | payload blocked before mutation | blocked | 401 | 8.147ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/putaway/slotting/:strategyId | payload blocked before mutation | blocked | 401 | 7.939ms | pass |  |
| performance | records oversized payload behavior | DELETE | /:warehouseId/putaway/slotting/:strategyId | bounded response without crash | blocked | 401 | 8.194ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/slotting-optimization/dashboard | 401/403/400/404 or public status | blocked | 401 | 10.562ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/slotting-optimization/layout | 401/403/400/404 or public status | blocked | 401 | 7.420ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/slotting-optimization/recommendations | 401/403/400/404 or public status | blocked | 401 | 7.892ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/slotting-optimization/analytics | 401/403/400/404 or public status | blocked | 401 | 7.763ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/slotting-optimization/tasks | 401/403/400/404 or public status | blocked | 401 | 10.856ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/slotting-optimization/run | 401/403/400/404 or public status | blocked | 401 | 8.093ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/slotting-optimization/run | validation or auth rejection | blocked | 401 | 8.288ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/slotting-optimization/run | payload blocked before mutation | blocked | 401 | 8.781ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/slotting-optimization/run | payload blocked before mutation | blocked | 401 | 10.857ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/slotting-optimization/run | bounded response without crash | blocked | 401 | 8.592ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:warehouseId/slotting-optimization/parameters | 401/403/400/404 or public status | blocked | 401 | 7.901ms | pass |  |
| validation | rejects malformed payload | PATCH | /:warehouseId/slotting-optimization/parameters | validation or auth rejection | blocked | 401 | 8.507ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/slotting-optimization/parameters | payload blocked before mutation | blocked | 401 | 10.713ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/slotting-optimization/parameters | payload blocked before mutation | blocked | 401 | 8.222ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:warehouseId/slotting-optimization/parameters | bounded response without crash | blocked | 401 | 7.735ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/slotting-optimization/profiles | 401/403/400/404 or public status | blocked | 401 | 8.615ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/slotting-optimization/profiles | validation or auth rejection | blocked | 401 | 11.053ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/slotting-optimization/profiles | payload blocked before mutation | blocked | 401 | 8.033ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/slotting-optimization/profiles | payload blocked before mutation | blocked | 401 | 7.572ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/slotting-optimization/profiles | bounded response without crash | blocked | 401 | 7.801ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/slotting-optimization/recommendations/approve | 401/403/400/404 or public status | blocked | 401 | 10.118ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/slotting-optimization/recommendations/approve | validation or auth rejection | blocked | 401 | 7.458ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/slotting-optimization/recommendations/approve | payload blocked before mutation | blocked | 401 | 7.770ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/slotting-optimization/recommendations/approve | payload blocked before mutation | blocked | 401 | 8.255ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/slotting-optimization/recommendations/approve | bounded response without crash | blocked | 401 | 10.055ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/slotting-optimization/recommendations/reject | 401/403/400/404 or public status | blocked | 401 | 8.051ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/slotting-optimization/recommendations/reject | validation or auth rejection | blocked | 401 | 8.082ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/slotting-optimization/recommendations/reject | payload blocked before mutation | blocked | 401 | 7.809ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/slotting-optimization/recommendations/reject | payload blocked before mutation | blocked | 401 | 10.774ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/slotting-optimization/recommendations/reject | bounded response without crash | blocked | 401 | 8.124ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/slotting-optimization/tasks | 401/403/400/404 or public status | blocked | 401 | 7.712ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/slotting-optimization/tasks | validation or auth rejection | blocked | 401 | 8.486ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/slotting-optimization/tasks | payload blocked before mutation | blocked | 401 | 9.938ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/slotting-optimization/tasks | payload blocked before mutation | blocked | 401 | 8.514ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/slotting-optimization/tasks | bounded response without crash | blocked | 401 | 8.431ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/slotting-optimization/export | 401/403/400/404 or public status | blocked | 401 | 8.187ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/slotting-optimization/export | validation or auth rejection | blocked | 401 | 10.439ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/slotting-optimization/export | payload blocked before mutation | blocked | 401 | 7.604ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/slotting-optimization/export | payload blocked before mutation | blocked | 401 | 8.064ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/slotting-optimization/export | bounded response without crash | blocked | 401 | 7.745ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/slotting-optimization/scenarios | 401/403/400/404 or public status | blocked | 401 | 11.333ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/slotting-optimization/scenarios | validation or auth rejection | blocked | 401 | 7.844ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/slotting-optimization/scenarios | payload blocked before mutation | blocked | 401 | 7.977ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/slotting-optimization/scenarios | payload blocked before mutation | blocked | 401 | 7.793ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/slotting-optimization/scenarios | bounded response without crash | blocked | 401 | 10.815ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/tasks | 401/403/400/404 or public status | blocked | 401 | 7.799ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/tasks/board | 401/403/400/404 or public status | blocked | 401 | 8.078ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/tasks/analytics | 401/403/400/404 or public status | blocked | 401 | 7.739ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/tasks/templates | 401/403/400/404 or public status | blocked | 401 | 10.186ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/tasks | 401/403/400/404 or public status | blocked | 401 | 8.214ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/tasks | validation or auth rejection | blocked | 401 | 8.058ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks | payload blocked before mutation | blocked | 401 | 8.011ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks | payload blocked before mutation | blocked | 401 | 10.379ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/tasks | bounded response without crash | blocked | 401 | 7.760ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/tasks/assign | 401/403/400/404 or public status | blocked | 401 | 7.467ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/tasks/assign | validation or auth rejection | blocked | 401 | 7.978ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks/assign | payload blocked before mutation | blocked | 401 | 10.156ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks/assign | payload blocked before mutation | blocked | 401 | 7.908ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/tasks/assign | bounded response without crash | blocked | 401 | 8.349ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/tasks/bulk-update | 401/403/400/404 or public status | blocked | 401 | 7.720ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/tasks/bulk-update | validation or auth rejection | blocked | 401 | 10.988ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks/bulk-update | payload blocked before mutation | blocked | 401 | 7.746ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks/bulk-update | payload blocked before mutation | blocked | 401 | 7.787ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/tasks/bulk-update | bounded response without crash | blocked | 401 | 9.684ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/tasks/import | 401/403/400/404 or public status | blocked | 401 | 9.423ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/tasks/import | validation or auth rejection | blocked | 401 | 7.664ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks/import | payload blocked before mutation | blocked | 401 | 7.379ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks/import | payload blocked before mutation | blocked | 401 | 7.575ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/tasks/import | bounded response without crash | blocked | 401 | 10.713ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/tasks/export | 401/403/400/404 or public status | blocked | 401 | 7.168ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/tasks/:taskId | 401/403/400/404 or public status | blocked | 401 | 8.313ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:warehouseId/tasks/:taskId | 401/403/400/404 or public status | blocked | 401 | 8.088ms | pass |  |
| validation | rejects malformed payload | PATCH | /:warehouseId/tasks/:taskId | validation or auth rejection | blocked | 401 | 9.909ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/tasks/:taskId | payload blocked before mutation | blocked | 401 | 7.894ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/tasks/:taskId | payload blocked before mutation | blocked | 401 | 8.196ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:warehouseId/tasks/:taskId | bounded response without crash | blocked | 401 | 7.919ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:warehouseId/tasks/:taskId/status | 401/403/400/404 or public status | public-health | 401 | 10.869ms | pass |  |
| validation | rejects malformed payload | PATCH | /:warehouseId/tasks/:taskId/status | validation or auth rejection | public-health | 401 | 8.112ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/tasks/:taskId/status | payload blocked before mutation | public-health | 401 | 7.738ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/tasks/:taskId/status | payload blocked before mutation | public-health | 401 | 7.358ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:warehouseId/tasks/:taskId/status | bounded response without crash | public-health | 401 | 10.939ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:warehouseId/tasks/:taskId/priority | 401/403/400/404 or public status | blocked | 401 | 8.142ms | pass |  |
| validation | rejects malformed payload | PATCH | /:warehouseId/tasks/:taskId/priority | validation or auth rejection | blocked | 401 | 8.097ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/tasks/:taskId/priority | payload blocked before mutation | blocked | 401 | 8.417ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/tasks/:taskId/priority | payload blocked before mutation | blocked | 401 | 9.885ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:warehouseId/tasks/:taskId/priority | bounded response without crash | blocked | 401 | 8.027ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:warehouseId/tasks/:taskId/progress | 401/403/400/404 or public status | blocked | 401 | 7.815ms | pass |  |
| validation | rejects malformed payload | PATCH | /:warehouseId/tasks/:taskId/progress | validation or auth rejection | blocked | 401 | 7.319ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/tasks/:taskId/progress | payload blocked before mutation | blocked | 401 | 10.675ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/tasks/:taskId/progress | payload blocked before mutation | blocked | 401 | 7.801ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:warehouseId/tasks/:taskId/progress | bounded response without crash | blocked | 401 | 7.834ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/tasks/:taskId/complete | 401/403/400/404 or public status | blocked | 401 | 7.924ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/tasks/:taskId/complete | validation or auth rejection | blocked | 401 | 10.807ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks/:taskId/complete | payload blocked before mutation | blocked | 401 | 8.455ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks/:taskId/complete | payload blocked before mutation | blocked | 401 | 7.599ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/tasks/:taskId/complete | bounded response without crash | blocked | 401 | 7.887ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/tasks/:taskId/cancel | 401/403/400/404 or public status | blocked | 401 | 10.729ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/tasks/:taskId/cancel | validation or auth rejection | blocked | 401 | 7.843ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks/:taskId/cancel | payload blocked before mutation | blocked | 401 | 7.496ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks/:taskId/cancel | payload blocked before mutation | blocked | 401 | 7.485ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/tasks/:taskId/cancel | bounded response without crash | blocked | 401 | 10.875ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/tasks/:taskId/notes | 401/403/400/404 or public status | blocked | 401 | 7.767ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/tasks/:taskId/notes | validation or auth rejection | blocked | 401 | 8.223ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks/:taskId/notes | payload blocked before mutation | blocked | 401 | 8.062ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks/:taskId/notes | payload blocked before mutation | blocked | 401 | 11.651ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/tasks/:taskId/notes | bounded response without crash | blocked | 401 | 8.407ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/tasks/:taskId/attachments | 401/403/400/404 or public status | blocked | 401 | 7.953ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/tasks/:taskId/attachments | validation or auth rejection | blocked | 401 | 8.034ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks/:taskId/attachments | payload blocked before mutation | blocked | 401 | 10.303ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks/:taskId/attachments | payload blocked before mutation | blocked | 401 | 8.685ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/tasks/:taskId/attachments | bounded response without crash | blocked | 401 | 8.140ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/pick-waves/dashboard | 401/403/400/404 or public status | blocked | 401 | 7.776ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/pick-waves/available-orders | 401/403/400/404 or public status | blocked | 401 | 9.886ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-waves/auto-group | 401/403/400/404 or public status | blocked | 401 | 7.515ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-waves/auto-group | validation or auth rejection | blocked | 401 | 8.079ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/auto-group | payload blocked before mutation | blocked | 401 | 8.537ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/auto-group | payload blocked before mutation | blocked | 401 | 10.909ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-waves/auto-group | bounded response without crash | blocked | 401 | 8.427ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/pick-waves/templates | 401/403/400/404 or public status | blocked | 401 | 7.282ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-waves/templates | 401/403/400/404 or public status | blocked | 401 | 7.493ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-waves/templates | validation or auth rejection | blocked | 401 | 10.616ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/templates | payload blocked before mutation | blocked | 401 | 8.168ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/templates | payload blocked before mutation | blocked | 401 | 7.949ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-waves/templates | bounded response without crash | blocked | 401 | 7.687ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/pick-waves/templates/:templateId | 401/403/400/404 or public status | blocked | 401 | 10.782ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:warehouseId/pick-waves/templates/:templateId | 401/403/400/404 or public status | blocked | 401 | 8.176ms | pass |  |
| validation | rejects malformed payload | PATCH | /:warehouseId/pick-waves/templates/:templateId | validation or auth rejection | blocked | 401 | 7.819ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/pick-waves/templates/:templateId | payload blocked before mutation | blocked | 401 | 7.909ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/pick-waves/templates/:templateId | payload blocked before mutation | blocked | 401 | 10.310ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:warehouseId/pick-waves/templates/:templateId | bounded response without crash | blocked | 401 | 7.994ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:warehouseId/pick-waves/templates/:templateId | 401/403/400/404 or public status | blocked | 401 | 7.319ms | pass |  |
| validation | rejects malformed payload | DELETE | /:warehouseId/pick-waves/templates/:templateId | validation or auth rejection | blocked | 401 | 7.345ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/pick-waves/templates/:templateId | payload blocked before mutation | blocked | 401 | 10.150ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/pick-waves/templates/:templateId | payload blocked before mutation | blocked | 401 | 7.207ms | pass |  |
| performance | records oversized payload behavior | DELETE | /:warehouseId/pick-waves/templates/:templateId | bounded response without crash | blocked | 401 | 6.932ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-waves/templates/:templateId/apply | 401/403/400/404 or public status | blocked | 401 | 7.348ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-waves/templates/:templateId/apply | validation or auth rejection | blocked | 401 | 10.712ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/templates/:templateId/apply | payload blocked before mutation | blocked | 401 | 7.500ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/templates/:templateId/apply | payload blocked before mutation | blocked | 401 | 7.654ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-waves/templates/:templateId/apply | bounded response without crash | blocked | 401 | 7.225ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/pick-waves | 401/403/400/404 or public status | blocked | 401 | 9.922ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-waves | 401/403/400/404 or public status | blocked | 401 | 7.459ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-waves | validation or auth rejection | blocked | 401 | 8.251ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves | payload blocked before mutation | blocked | 401 | 7.616ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves | payload blocked before mutation | blocked | 401 | 11.260ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-waves | bounded response without crash | blocked | 401 | 8.294ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/pick-waves/:waveId/details | 401/403/400/404 or public status | blocked | 401 | 7.931ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-waves/:waveId/release | 401/403/400/404 or public status | blocked | 401 | 7.756ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-waves/:waveId/release | validation or auth rejection | blocked | 401 | 9.937ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/:waveId/release | payload blocked before mutation | blocked | 401 | 7.659ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/:waveId/release | payload blocked before mutation | blocked | 401 | 7.626ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-waves/:waveId/release | bounded response without crash | blocked | 401 | 7.895ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-waves/:waveId/cancel | 401/403/400/404 or public status | blocked | 401 | 10.264ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-waves/:waveId/cancel | validation or auth rejection | blocked | 401 | 7.366ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/:waveId/cancel | payload blocked before mutation | blocked | 401 | 7.606ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/:waveId/cancel | payload blocked before mutation | blocked | 401 | 7.841ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-waves/:waveId/cancel | bounded response without crash | blocked | 401 | 10.094ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-waves/:waveId/duplicate | 401/403/400/404 or public status | blocked | 401 | 7.765ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-waves/:waveId/duplicate | validation or auth rejection | blocked | 401 | 8.075ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/:waveId/duplicate | payload blocked before mutation | blocked | 401 | 8.052ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/:waveId/duplicate | payload blocked before mutation | blocked | 401 | 12.003ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-waves/:waveId/duplicate | bounded response without crash | blocked | 401 | 7.702ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-waves/:waveId/assign-pickers | 401/403/400/404 or public status | blocked | 401 | 7.048ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-waves/:waveId/assign-pickers | validation or auth rejection | blocked | 401 | 7.855ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/:waveId/assign-pickers | payload blocked before mutation | blocked | 401 | 10.376ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/:waveId/assign-pickers | payload blocked before mutation | blocked | 401 | 8.194ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-waves/:waveId/assign-pickers | bounded response without crash | blocked | 401 | 7.368ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-waves/:waveId/recalculate | 401/403/400/404 or public status | blocked | 401 | 7.725ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-waves/:waveId/recalculate | validation or auth rejection | blocked | 401 | 10.279ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/:waveId/recalculate | payload blocked before mutation | blocked | 401 | 7.644ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/:waveId/recalculate | payload blocked before mutation | blocked | 401 | 7.750ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-waves/:waveId/recalculate | bounded response without crash | blocked | 401 | 7.224ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/pick-waves/:waveId | 401/403/400/404 or public status | blocked | 401 | 9.821ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:warehouseId/pick-waves/:waveId | 401/403/400/404 or public status | blocked | 401 | 7.625ms | pass |  |
| validation | rejects malformed payload | PATCH | /:warehouseId/pick-waves/:waveId | validation or auth rejection | blocked | 401 | 7.593ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/pick-waves/:waveId | payload blocked before mutation | blocked | 401 | 7.814ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/pick-waves/:waveId | payload blocked before mutation | blocked | 401 | 11.758ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:warehouseId/pick-waves/:waveId | bounded response without crash | blocked | 401 | 7.924ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:warehouseId/pick-waves/:waveId | 401/403/400/404 or public status | blocked | 401 | 7.368ms | pass |  |
| validation | rejects malformed payload | DELETE | /:warehouseId/pick-waves/:waveId | validation or auth rejection | blocked | 401 | 7.112ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/pick-waves/:waveId | payload blocked before mutation | blocked | 401 | 9.897ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/pick-waves/:waveId | payload blocked before mutation | blocked | 401 | 6.843ms | pass |  |
| performance | records oversized payload behavior | DELETE | /:warehouseId/pick-waves/:waveId | bounded response without crash | blocked | 401 | 8.024ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/pick-lists/dashboard | 401/403/400/404 or public status | blocked | 401 | 7.532ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/pick-lists/picker-performance | 401/403/400/404 or public status | blocked | 401 | 10.010ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/pick-lists/picker-workloads | 401/403/400/404 or public status | blocked | 401 | 7.832ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/pick-lists | 401/403/400/404 or public status | blocked | 401 | 7.750ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-lists | 401/403/400/404 or public status | blocked | 401 | 8.023ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-lists | validation or auth rejection | blocked | 401 | 11.128ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists | payload blocked before mutation | blocked | 401 | 7.678ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists | payload blocked before mutation | blocked | 401 | 7.721ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-lists | bounded response without crash | blocked | 401 | 7.981ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/pick-lists/:pickListId/details | 401/403/400/404 or public status | blocked | 401 | 10.440ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-lists/:pickListId/assign | 401/403/400/404 or public status | blocked | 401 | 7.740ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-lists/:pickListId/assign | validation or auth rejection | blocked | 401 | 7.589ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/assign | payload blocked before mutation | blocked | 401 | 8.170ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/assign | payload blocked before mutation | blocked | 401 | 11.967ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-lists/:pickListId/assign | bounded response without crash | blocked | 401 | 8.968ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-lists/:pickListId/priority | 401/403/400/404 or public status | blocked | 401 | 8.152ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-lists/:pickListId/priority | validation or auth rejection | blocked | 401 | 8.498ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/priority | payload blocked before mutation | blocked | 401 | 11.534ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/priority | payload blocked before mutation | blocked | 401 | 8.661ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-lists/:pickListId/priority | bounded response without crash | blocked | 401 | 7.984ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-lists/:pickListId/status | 401/403/400/404 or public status | public-health | 401 | 7.599ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-lists/:pickListId/status | validation or auth rejection | public-health | 401 | 10.593ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/status | payload blocked before mutation | public-health | 401 | 7.647ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/status | payload blocked before mutation | public-health | 401 | 7.746ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-lists/:pickListId/status | bounded response without crash | public-health | 401 | 8.213ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-lists/:pickListId/scan | 401/403/400/404 or public status | blocked | 401 | 9.827ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-lists/:pickListId/scan | validation or auth rejection | blocked | 401 | 7.987ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/scan | payload blocked before mutation | blocked | 401 | 8.106ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/scan | payload blocked before mutation | blocked | 401 | 8.293ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-lists/:pickListId/scan | bounded response without crash | blocked | 401 | 10.532ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-lists/:pickListId/short-pick | 401/403/400/404 or public status | blocked | 401 | 7.611ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-lists/:pickListId/short-pick | validation or auth rejection | blocked | 401 | 7.606ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/short-pick | payload blocked before mutation | blocked | 401 | 7.966ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/short-pick | payload blocked before mutation | blocked | 401 | 11.099ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-lists/:pickListId/short-pick | bounded response without crash | blocked | 401 | 8.344ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-lists/:pickListId/items/:itemId/confirm | 401/403/400/404 or public status | blocked | 401 | 8.359ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-lists/:pickListId/items/:itemId/confirm | validation or auth rejection | blocked | 401 | 8.288ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/items/:itemId/confirm | payload blocked before mutation | blocked | 401 | 10.692ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/items/:itemId/confirm | payload blocked before mutation | blocked | 401 | 7.666ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-lists/:pickListId/items/:itemId/confirm | bounded response without crash | blocked | 401 | 7.744ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-lists/:pickListId/skip | 401/403/400/404 or public status | blocked | 401 | 7.895ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-lists/:pickListId/skip | validation or auth rejection | blocked | 401 | 10.019ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/skip | payload blocked before mutation | blocked | 401 | 7.893ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/skip | payload blocked before mutation | blocked | 401 | 7.833ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-lists/:pickListId/skip | bounded response without crash | blocked | 401 | 7.781ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-lists/:pickListId/issue | 401/403/400/404 or public status | blocked | 401 | 9.955ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-lists/:pickListId/issue | validation or auth rejection | blocked | 401 | 8.090ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/issue | payload blocked before mutation | blocked | 401 | 8.182ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/issue | payload blocked before mutation | blocked | 401 | 7.636ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-lists/:pickListId/issue | bounded response without crash | blocked | 401 | 10.177ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/pick-lists/:pickListId/note | 401/403/400/404 or public status | blocked | 401 | 7.669ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/pick-lists/:pickListId/note | validation or auth rejection | blocked | 401 | 8.203ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/note | payload blocked before mutation | blocked | 401 | 8.322ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/note | payload blocked before mutation | blocked | 401 | 10.786ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/pick-lists/:pickListId/note | bounded response without crash | blocked | 401 | 8.118ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/pick-lists/:pickListId | 401/403/400/404 or public status | blocked | 401 | 8.435ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:warehouseId/pick-lists/:pickListId | 401/403/400/404 or public status | blocked | 401 | 8.109ms | pass |  |
| validation | rejects malformed payload | PATCH | /:warehouseId/pick-lists/:pickListId | validation or auth rejection | blocked | 401 | 10.193ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/pick-lists/:pickListId | payload blocked before mutation | blocked | 401 | 7.068ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/pick-lists/:pickListId | payload blocked before mutation | blocked | 401 | 7.405ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:warehouseId/pick-lists/:pickListId | bounded response without crash | blocked | 401 | 7.427ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:warehouseId/pick-lists/:pickListId | 401/403/400/404 or public status | blocked | 401 | 10.207ms | pass |  |
| validation | rejects malformed payload | DELETE | /:warehouseId/pick-lists/:pickListId | validation or auth rejection | blocked | 401 | 7.469ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/pick-lists/:pickListId | payload blocked before mutation | blocked | 401 | 7.981ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/pick-lists/:pickListId | payload blocked before mutation | blocked | 401 | 8.157ms | pass |  |
| performance | records oversized payload behavior | DELETE | /:warehouseId/pick-lists/:pickListId | bounded response without crash | blocked | 401 | 10.241ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId | 401/403/400/404 or public status | blocked | 401 | 7.423ms | pass |  |
| middleware | blocks unauthenticated access | PATCH | /:warehouseId | 401/403/400/404 or public status | blocked | 401 | 7.644ms | pass |  |
| validation | rejects malformed payload | PATCH | /:warehouseId | validation or auth rejection | blocked | 401 | 7.748ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId | payload blocked before mutation | blocked | 401 | 10.765ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId | payload blocked before mutation | blocked | 401 | 8.410ms | pass |  |
| performance | records oversized payload behavior | PATCH | /:warehouseId | bounded response without crash | blocked | 401 | 8.232ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/default | 401/403/400/404 or public status | blocked | 401 | 9.039ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/default | validation or auth rejection | blocked | 401 | 11.371ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/default | payload blocked before mutation | blocked | 401 | 9.362ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/default | payload blocked before mutation | blocked | 401 | 9.370ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/default | bounded response without crash | blocked | 401 | 8.075ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/summary | 401/403/400/404 or public status | blocked | 401 | 10.636ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/configuration | 401/403/400/404 or public status | blocked | 401 | 7.679ms | pass |  |
| middleware | blocks unauthenticated access | PUT | /:warehouseId/configuration | 401/403/400/404 or public status | blocked | 401 | 7.667ms | pass |  |
| validation | rejects malformed payload | PUT | /:warehouseId/configuration | validation or auth rejection | blocked | 401 | 7.917ms | pass |  |
| security | blocks SQL injection payload | PUT | /:warehouseId/configuration | payload blocked before mutation | blocked | 401 | 11.354ms | pass |  |
| security | blocks XSS payload | PUT | /:warehouseId/configuration | payload blocked before mutation | blocked | 401 | 7.815ms | pass |  |
| performance | records oversized payload behavior | PUT | /:warehouseId/configuration | bounded response without crash | blocked | 401 | 8.077ms | pass |  |
| middleware | blocks unauthenticated access | GET | /:warehouseId/staff | 401/403/400/404 or public status | blocked | 401 | 7.794ms | pass |  |
| middleware | blocks unauthenticated access | POST | /:warehouseId/staff | 401/403/400/404 or public status | blocked | 401 | 10.259ms | pass |  |
| validation | rejects malformed payload | POST | /:warehouseId/staff | validation or auth rejection | blocked | 401 | 8.621ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/staff | payload blocked before mutation | blocked | 401 | 7.934ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/staff | payload blocked before mutation | blocked | 401 | 8.216ms | pass |  |
| performance | records oversized payload behavior | POST | /:warehouseId/staff | bounded response without crash | blocked | 401 | 10.195ms | pass |  |
| middleware | blocks unauthenticated access | DELETE | /:warehouseId | 401/403/400/404 or public status | blocked | 401 | 7.777ms | pass |  |
| validation | rejects malformed payload | DELETE | /:warehouseId | validation or auth rejection | blocked | 401 | 8.009ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId | payload blocked before mutation | blocked | 401 | 7.944ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId | payload blocked before mutation | blocked | 401 | 10.671ms | pass |  |
| performance | records oversized payload behavior | DELETE | /:warehouseId | bounded response without crash | blocked | 401 | 7.605ms | pass |  |
