# warehouse Security Tests

| Category | Scenario | Method | Endpoint | Expected | Actual | Status | Response Time | Result | Errors |
|---|---|---|---|---|---|---:|---:|---|---|
| security | route guard source scan |  |  | auth/authorization guards present | routes=167 |  | 6.365ms | pass |  |
| security | blocks SQL injection payload | POST | / | payload blocked before mutation | blocked | 401 | 11.496ms | pass |  |
| security | blocks XSS payload | POST | / | payload blocked before mutation | blocked | 401 | 12.329ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/zones | payload blocked before mutation | blocked | 401 | 11.459ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/zones | payload blocked before mutation | blocked | 401 | 9.425ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/zones/:zoneId/staff | payload blocked before mutation | blocked | 401 | 16.292ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/zones/:zoneId/staff | payload blocked before mutation | blocked | 401 | 8.563ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/zones/:zoneId | payload blocked before mutation | blocked | 401 | 9.053ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/zones/:zoneId | payload blocked before mutation | blocked | 401 | 8.834ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/zones/:zoneId | payload blocked before mutation | blocked | 401 | 8.252ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/zones/:zoneId | payload blocked before mutation | blocked | 401 | 10.301ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/bins | payload blocked before mutation | blocked | 401 | 8.044ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/bins | payload blocked before mutation | blocked | 401 | 8.118ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/bins/:binId/lock | payload blocked before mutation | blocked | 401 | 12.001ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/bins/:binId/lock | payload blocked before mutation | blocked | 401 | 10.815ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/bins/:binId/unlock | payload blocked before mutation | blocked | 401 | 8.469ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/bins/:binId/unlock | payload blocked before mutation | blocked | 401 | 7.892ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/bins/:binId/maintenance | payload blocked before mutation | blocked | 401 | 8.539ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/bins/:binId/maintenance | payload blocked before mutation | blocked | 401 | 11.914ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/bins/:binId/transfer | payload blocked before mutation | blocked | 401 | 10.579ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/bins/:binId/transfer | payload blocked before mutation | blocked | 401 | 8.105ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/bins/:binId/merge | payload blocked before mutation | blocked | 401 | 8.446ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/bins/:binId/merge | payload blocked before mutation | blocked | 401 | 7.823ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/bins/:binId/split | payload blocked before mutation | blocked | 401 | 7.802ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/bins/:binId/split | payload blocked before mutation | blocked | 401 | 8.566ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/bins/:binId | payload blocked before mutation | blocked | 401 | 10.082ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/bins/:binId | payload blocked before mutation | blocked | 401 | 8.424ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/bins/:binId | payload blocked before mutation | blocked | 401 | 7.452ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/bins/:binId | payload blocked before mutation | blocked | 401 | 7.536ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/rules | payload blocked before mutation | blocked | 401 | 10.343ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/rules | payload blocked before mutation | blocked | 401 | 7.784ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/rules/import | payload blocked before mutation | blocked | 401 | 7.685ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/rules/import | payload blocked before mutation | blocked | 401 | 7.970ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/rules/:ruleId/duplicate | payload blocked before mutation | blocked | 401 | 7.600ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/rules/:ruleId/duplicate | payload blocked before mutation | blocked | 401 | 7.481ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/rules/:ruleId/activate | payload blocked before mutation | blocked | 401 | 8.353ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/rules/:ruleId/activate | payload blocked before mutation | blocked | 401 | 10.460ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/rules/:ruleId/deactivate | payload blocked before mutation | blocked | 401 | 10.443ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/rules/:ruleId/deactivate | payload blocked before mutation | blocked | 401 | 8.115ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/rules/:ruleId/test | payload blocked before mutation | blocked | 401 | 8.103ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/rules/:ruleId/test | payload blocked before mutation | blocked | 401 | 8.612ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/putaway/rules/:ruleId | payload blocked before mutation | blocked | 401 | 7.940ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/putaway/rules/:ruleId | payload blocked before mutation | blocked | 401 | 10.382ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/putaway/rules/:ruleId | payload blocked before mutation | blocked | 401 | 10.621ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/putaway/rules/:ruleId | payload blocked before mutation | blocked | 401 | 7.536ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/suggestion | payload blocked before mutation | blocked | 401 | 8.320ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/suggestion | payload blocked before mutation | blocked | 401 | 7.747ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/groups | payload blocked before mutation | blocked | 401 | 8.287ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/groups | payload blocked before mutation | blocked | 401 | 11.075ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/putaway/groups/:groupId | payload blocked before mutation | blocked | 401 | 8.867ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/putaway/groups/:groupId | payload blocked before mutation | blocked | 401 | 10.177ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/putaway/groups/:groupId | payload blocked before mutation | blocked | 401 | 7.382ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/putaway/groups/:groupId | payload blocked before mutation | blocked | 401 | 7.329ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/groups/:groupId/activate | payload blocked before mutation | blocked | 401 | 8.229ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/groups/:groupId/activate | payload blocked before mutation | blocked | 401 | 10.244ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/groups/:groupId/deactivate | payload blocked before mutation | blocked | 401 | 10.251ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/groups/:groupId/deactivate | payload blocked before mutation | blocked | 401 | 7.075ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/putaway/slotting | payload blocked before mutation | blocked | 401 | 8.042ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/putaway/slotting | payload blocked before mutation | blocked | 401 | 7.925ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/putaway/slotting/:strategyId | payload blocked before mutation | blocked | 401 | 10.714ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/putaway/slotting/:strategyId | payload blocked before mutation | blocked | 401 | 8.022ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/putaway/slotting/:strategyId | payload blocked before mutation | blocked | 401 | 8.147ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/putaway/slotting/:strategyId | payload blocked before mutation | blocked | 401 | 7.939ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/slotting-optimization/run | payload blocked before mutation | blocked | 401 | 8.781ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/slotting-optimization/run | payload blocked before mutation | blocked | 401 | 10.857ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/slotting-optimization/parameters | payload blocked before mutation | blocked | 401 | 10.713ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/slotting-optimization/parameters | payload blocked before mutation | blocked | 401 | 8.222ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/slotting-optimization/profiles | payload blocked before mutation | blocked | 401 | 8.033ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/slotting-optimization/profiles | payload blocked before mutation | blocked | 401 | 7.572ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/slotting-optimization/recommendations/approve | payload blocked before mutation | blocked | 401 | 7.770ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/slotting-optimization/recommendations/approve | payload blocked before mutation | blocked | 401 | 8.255ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/slotting-optimization/recommendations/reject | payload blocked before mutation | blocked | 401 | 7.809ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/slotting-optimization/recommendations/reject | payload blocked before mutation | blocked | 401 | 10.774ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/slotting-optimization/tasks | payload blocked before mutation | blocked | 401 | 9.938ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/slotting-optimization/tasks | payload blocked before mutation | blocked | 401 | 8.514ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/slotting-optimization/export | payload blocked before mutation | blocked | 401 | 7.604ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/slotting-optimization/export | payload blocked before mutation | blocked | 401 | 8.064ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/slotting-optimization/scenarios | payload blocked before mutation | blocked | 401 | 7.977ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/slotting-optimization/scenarios | payload blocked before mutation | blocked | 401 | 7.793ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks | payload blocked before mutation | blocked | 401 | 8.011ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks | payload blocked before mutation | blocked | 401 | 10.379ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks/assign | payload blocked before mutation | blocked | 401 | 10.156ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks/assign | payload blocked before mutation | blocked | 401 | 7.908ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks/bulk-update | payload blocked before mutation | blocked | 401 | 7.746ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks/bulk-update | payload blocked before mutation | blocked | 401 | 7.787ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks/import | payload blocked before mutation | blocked | 401 | 7.379ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks/import | payload blocked before mutation | blocked | 401 | 7.575ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/tasks/:taskId | payload blocked before mutation | blocked | 401 | 7.894ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/tasks/:taskId | payload blocked before mutation | blocked | 401 | 8.196ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/tasks/:taskId/status | payload blocked before mutation | public-health | 401 | 7.738ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/tasks/:taskId/status | payload blocked before mutation | public-health | 401 | 7.358ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/tasks/:taskId/priority | payload blocked before mutation | blocked | 401 | 8.417ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/tasks/:taskId/priority | payload blocked before mutation | blocked | 401 | 9.885ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/tasks/:taskId/progress | payload blocked before mutation | blocked | 401 | 10.675ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/tasks/:taskId/progress | payload blocked before mutation | blocked | 401 | 7.801ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks/:taskId/complete | payload blocked before mutation | blocked | 401 | 8.455ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks/:taskId/complete | payload blocked before mutation | blocked | 401 | 7.599ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks/:taskId/cancel | payload blocked before mutation | blocked | 401 | 7.496ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks/:taskId/cancel | payload blocked before mutation | blocked | 401 | 7.485ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks/:taskId/notes | payload blocked before mutation | blocked | 401 | 8.062ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks/:taskId/notes | payload blocked before mutation | blocked | 401 | 11.651ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/tasks/:taskId/attachments | payload blocked before mutation | blocked | 401 | 10.303ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/tasks/:taskId/attachments | payload blocked before mutation | blocked | 401 | 8.685ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/auto-group | payload blocked before mutation | blocked | 401 | 8.537ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/auto-group | payload blocked before mutation | blocked | 401 | 10.909ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/templates | payload blocked before mutation | blocked | 401 | 8.168ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/templates | payload blocked before mutation | blocked | 401 | 7.949ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/pick-waves/templates/:templateId | payload blocked before mutation | blocked | 401 | 7.909ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/pick-waves/templates/:templateId | payload blocked before mutation | blocked | 401 | 10.310ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/pick-waves/templates/:templateId | payload blocked before mutation | blocked | 401 | 10.150ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/pick-waves/templates/:templateId | payload blocked before mutation | blocked | 401 | 7.207ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/templates/:templateId/apply | payload blocked before mutation | blocked | 401 | 7.500ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/templates/:templateId/apply | payload blocked before mutation | blocked | 401 | 7.654ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves | payload blocked before mutation | blocked | 401 | 7.616ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves | payload blocked before mutation | blocked | 401 | 11.260ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/:waveId/release | payload blocked before mutation | blocked | 401 | 7.659ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/:waveId/release | payload blocked before mutation | blocked | 401 | 7.626ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/:waveId/cancel | payload blocked before mutation | blocked | 401 | 7.606ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/:waveId/cancel | payload blocked before mutation | blocked | 401 | 7.841ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/:waveId/duplicate | payload blocked before mutation | blocked | 401 | 8.052ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/:waveId/duplicate | payload blocked before mutation | blocked | 401 | 12.003ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/:waveId/assign-pickers | payload blocked before mutation | blocked | 401 | 10.376ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/:waveId/assign-pickers | payload blocked before mutation | blocked | 401 | 8.194ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-waves/:waveId/recalculate | payload blocked before mutation | blocked | 401 | 7.644ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-waves/:waveId/recalculate | payload blocked before mutation | blocked | 401 | 7.750ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/pick-waves/:waveId | payload blocked before mutation | blocked | 401 | 7.814ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/pick-waves/:waveId | payload blocked before mutation | blocked | 401 | 11.758ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/pick-waves/:waveId | payload blocked before mutation | blocked | 401 | 9.897ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/pick-waves/:waveId | payload blocked before mutation | blocked | 401 | 6.843ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists | payload blocked before mutation | blocked | 401 | 7.678ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists | payload blocked before mutation | blocked | 401 | 7.721ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/assign | payload blocked before mutation | blocked | 401 | 8.170ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/assign | payload blocked before mutation | blocked | 401 | 11.967ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/priority | payload blocked before mutation | blocked | 401 | 11.534ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/priority | payload blocked before mutation | blocked | 401 | 8.661ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/status | payload blocked before mutation | public-health | 401 | 7.647ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/status | payload blocked before mutation | public-health | 401 | 7.746ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/scan | payload blocked before mutation | blocked | 401 | 8.106ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/scan | payload blocked before mutation | blocked | 401 | 8.293ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/short-pick | payload blocked before mutation | blocked | 401 | 7.966ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/short-pick | payload blocked before mutation | blocked | 401 | 11.099ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/items/:itemId/confirm | payload blocked before mutation | blocked | 401 | 10.692ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/items/:itemId/confirm | payload blocked before mutation | blocked | 401 | 7.666ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/skip | payload blocked before mutation | blocked | 401 | 7.893ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/skip | payload blocked before mutation | blocked | 401 | 7.833ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/issue | payload blocked before mutation | blocked | 401 | 8.182ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/issue | payload blocked before mutation | blocked | 401 | 7.636ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/pick-lists/:pickListId/note | payload blocked before mutation | blocked | 401 | 8.322ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/pick-lists/:pickListId/note | payload blocked before mutation | blocked | 401 | 10.786ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId/pick-lists/:pickListId | payload blocked before mutation | blocked | 401 | 7.068ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId/pick-lists/:pickListId | payload blocked before mutation | blocked | 401 | 7.405ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId/pick-lists/:pickListId | payload blocked before mutation | blocked | 401 | 7.981ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId/pick-lists/:pickListId | payload blocked before mutation | blocked | 401 | 8.157ms | pass |  |
| security | blocks SQL injection payload | PATCH | /:warehouseId | payload blocked before mutation | blocked | 401 | 10.765ms | pass |  |
| security | blocks XSS payload | PATCH | /:warehouseId | payload blocked before mutation | blocked | 401 | 8.410ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/default | payload blocked before mutation | blocked | 401 | 9.362ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/default | payload blocked before mutation | blocked | 401 | 9.370ms | pass |  |
| security | blocks SQL injection payload | PUT | /:warehouseId/configuration | payload blocked before mutation | blocked | 401 | 11.354ms | pass |  |
| security | blocks XSS payload | PUT | /:warehouseId/configuration | payload blocked before mutation | blocked | 401 | 7.815ms | pass |  |
| security | blocks SQL injection payload | POST | /:warehouseId/staff | payload blocked before mutation | blocked | 401 | 7.934ms | pass |  |
| security | blocks XSS payload | POST | /:warehouseId/staff | payload blocked before mutation | blocked | 401 | 8.216ms | pass |  |
| security | blocks SQL injection payload | DELETE | /:warehouseId | payload blocked before mutation | blocked | 401 | 7.944ms | pass |  |
| security | blocks XSS payload | DELETE | /:warehouseId | payload blocked before mutation | blocked | 401 | 10.671ms | pass |  |
