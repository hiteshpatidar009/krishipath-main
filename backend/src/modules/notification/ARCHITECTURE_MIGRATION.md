# Notification Module Migration

Current MVC files remain active.

Migration TODO:
- Move dispatch orchestration into application layer.
- Treat email, SMS, push as infrastructure providers.
- Consume integration events instead of direct module calls.
- Add idempotent notification command handling.
