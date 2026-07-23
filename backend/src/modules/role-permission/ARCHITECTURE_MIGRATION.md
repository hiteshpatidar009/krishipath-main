# Role Permission Module Migration

Current MVC files remain active.

Migration TODO:
- Move permission checks behind `RolePermissionContract`.
- Keep role creation in application use cases.
- Keep DB access only in infrastructure repositories.
- Prevent direct repository imports from auth after contract adapter exists.
