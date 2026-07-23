```powershell
~/auth   node authtest.ts
◇ injected env (0) from .env // tip: ◈ encrypted .env [www.dotenvx.com]
Base URL (http://localhost:58231):
API prefix (/api/v1):
Auth email (tushargour004@gmail.com):
Auth password (12345678):

[AUTH] GET status
[API] GET http://localhost:58231/api/v1/auth/status
[OK] GET /auth/status -> 200 (73.14 ms)
{
  "success": true,
  "module": "auth",
  "status": "auth-module-ready",
  "timestamp": "2026-05-19T11:48:58.390Z"
}

[AUTH] GET captcha start
[API] GET http://localhost:58231/api/v1/auth/captcha/start
[OK] GET /auth/captcha/start -> 200 (80.82 ms)
{
  "success": true,
  "data": {
    "captchaToken": "060d444d-b69c-4223-9dee-5bcdfa23ec63",
    "captchaText": "787DA9",
    "expiresAt": 1779191638434
  }
}
[INFO] Captcha auto-filled: 787DA9
[DECISION] captcha.start => ok | captchaToken and captchaText received | next: signup with captcha

[AUTH] POST signup
[API] POST http://localhost:58231/api/v1/auth/signup
[REQ] {
  "firstName": "Tushar",
  "lastName": "Gour",
  "email": "tushargour004@gmail.com",
  "password": "12345678",
  "phone": "+1234567890",
  "captchaToken": "060d444d-b69c-4223-9dee-5bcdfa23ec63",
  "captchaCode": "787DA9"
}
[FAIL] POST /auth/signup -> 409 (93.59 ms)
{
  "success": false,
  "message": "Email already registered",
  "details": {
    "name": "Error",
    "stack": "Error: Email already registered\n    at <anonymous> (D:\\Projects\\flutter_projects\\ROYAL\\RSBC\\rsbc\\backend\\src\\modules\\auth\\services\\auth.service.ts:145:15)\n    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)\n    at async AuthService.withLogs (D:\\Projects\\flutter_projects\\ROYAL\\RSBC\\rsbc\\backend\\src\\modules\\auth\\services\\auth.service.ts:1881:22)\n    at async AuthController.execute (D:\\Projects\\flutter_projects\\ROYAL\\RSBC\\rsbc\\backend\\src\\modules\\auth\\controllers\\auth.controller.ts:299:20)\n    at async signUp (D:\\Projects\\flutter_projects\\ROYAL\\RSBC\\rsbc\\backend\\src\\modules\\auth\\controllers\\auth.controller.ts:24:5)",
    "database": {},
    "cause": {}
  }
}
[DECISION] signup => skip | account already exists | next: existing-user email status check

[AUTH] POST email start
[API] POST http://localhost:58231/api/v1/auth/signup/email/start
[REQ] {
  "email": "tushargour004@gmail.com"
}
[OK] POST /auth/signup/email/start -> 200 (97.92 ms)
{
  "success": true,
  "data": {
    "alreadyVerified": true
  }
}
[DECISION] email.start => skip | email already verified | next: auth app setup or login

[AUTH] POST auth app start
[API] POST http://localhost:58231/api/v1/auth/signup/auth-app/start
[REQ] {
  "email": "tushargour004@gmail.com",
  "password": "12345678"
}
[OK] POST /auth/signup/auth-app/start -> 200 (188.09 ms)
{
  "success": true,
  "data": {
    "secret": "FJXTIJRFHQ4UCSBQKR2EUUSAONMHSTSP",
    "otpauthUri": "otpauth://totp/RSBC:tushargour004@gmail.com?secret=FJXTIJRFHQ4UCSBQKR2EUUSAONMHSTSP&issuer=RSBC"
  }
}
[INFO] Authenticator URI auto-filled from response:
otpauth://totp/RSBC:tushargour004@gmail.com?secret=FJXTIJRFHQ4UCSBQKR2EUUSAONMHSTSP&issuer=RSBC
[INFO] Authenticator secret auto-filled: FJXTIJRFHQ4UCSBQKR2EUUSAONMHSTSP
[DECISION] auth-app.start => ok | secret and otpauth URI received | next: manual authenticator code verify

[AUTH] POST auth app verify
Enter authenticator setup code:
```
