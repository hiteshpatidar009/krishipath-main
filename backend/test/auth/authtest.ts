import axios from "axios";
import dotenv from "dotenv";
import readline from "node:readline/promises";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { stdin as input, stdout as output } from "node:process";

dotenv.config();

const color = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  api: "\x1b[36m",
  ok: "\x1b[32m",
  error: "\x1b[31m",
  warn: "\x1b[33m",
  info: "\x1b[34m",
  input: "\x1b[35m",
  response: "\x1b[90m",
};

const rl = readline.createInterface({ input, output });

const state = {
  baseUrl: normalizeBaseUrl(process.env.BASE_URL || "http://localhost:58231"),
  apiPrefix: normalizeApiPrefix(process.env.API_PREFIX || "/api/v1"),
  email: process.env.AUTH_EMAIL || "tushargour004@gmail.com",
  password: process.env.AUTH_PASSWORD || "12345678",
  firstName: process.env.AUTH_FIRST_NAME || "Tushar",
  lastName: process.env.AUTH_LAST_NAME || "Gour",
  phone: process.env.AUTH_PHONE || "+1234567890",
  captchaToken: "",
  captchaCode: "",
  accessToken: "",
  refreshToken: "",
  userId: "",
  emailChallengeId: "",
  authAppSetupToken: "",
  mfaSecret: "",
  loginMfaChallengeId: "",
  loginMfaMethod: "auth_app_otp",
  resetToken: "",
  loginFailed: false,
  passwordResetDone: false,
  decisions: [],
  testResults: [],
};

const client = axios.create({
  timeout: Number(process.env.AUTH_TEST_TIMEOUT_MS || 30000),
  validateStatus: () => true,
});

function normalizeBaseUrl(value) {
  return String(value || "").replace(/\/+$/, "");
}

function normalizeApiPrefix(value) {
  const prefix = String(value || "").trim();
  if (!prefix) return "";
  return `/${prefix.replace(/^\/+|\/+$/g, "")}`;
}

function endpoint(path) {
  return `${state.baseUrl}${state.apiPrefix}${path}`;
}

function paint(kind, value) {
  return `${color[kind] || ""}${value}${color.reset}`;
}

function logInfo(message) {
  console.log(paint("info", `[INFO] ${message}`));
}

function logWarn(message) {
  console.log(paint("warn", `[WARN] ${message}`));
}

function logError(message) {
  console.log(paint("error", `[ERROR] ${message}`));
}

function decide(step, result, reason, next) {
  state.decisions.push({ step, result, reason, next });
  const line = `[DECISION] ${step} => ${result} | ${reason} | next: ${next}`;
  const kind =
    result === "ok" ? "ok"
    : result === "skip" ? "warn"
    : "error";
  console.log(paint(kind, line));
}

function printDecisionTree() {
  console.log(`\n${paint("info", "[DECISION TREE]")}`);
  for (const [index, item] of state.decisions.entries()) {
    const prefix = index === state.decisions.length - 1 ? "└─" : "├─";
    const kind =
      item.result === "ok" ? "ok"
      : item.result === "skip" ? "warn"
      : "error";
    console.log(paint(kind, `${prefix} ${item.step}`));
    console.log(paint("dim", `   result: ${item.result}`));
    console.log(paint("dim", `   reason: ${item.reason}`));
    console.log(paint("dim", `   next: ${item.next}`));
  }
}

function logStep(message) {
  console.log(`\n${paint("info", `[AUTH] ${message}`)}`);
}

function isOk(response) {
  return response.status >= 200 && response.status < 300;
}

function extractData(body) {
  return body?.data ?? body;
}

function compact(inputObject) {
  return Object.fromEntries(
    Object.entries(inputObject).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  );
}

function authHeaders() {
  return state.accessToken ?
      { Authorization: `Bearer ${state.accessToken}` }
    : {};
}

function saveTokens(data) {
  const tokens = data?.tokens || data?.data?.tokens;
  if (!tokens) return;
  state.accessToken = tokens.accessToken || state.accessToken;
  state.refreshToken = tokens.refreshToken || state.refreshToken;
}

function applyAuthData(data) {
  if (!data) return;

  state.userId = data.userId || state.userId;
  state.emailChallengeId =
    data.emailVerification?.challengeId ||
    (data.method === "email_otp" || data.purpose === "email_verify" ?
      data.challengeId
    : "") ||
    state.emailChallengeId;
  state.authAppSetupToken =
    data.authAppSetupToken || data.setupToken || state.authAppSetupToken;
  state.mfaSecret = data.secret || state.mfaSecret;

  if (data.mfaRequired) {
    state.loginMfaChallengeId = data.challengeId || state.loginMfaChallengeId;
    state.loginMfaMethod = data.method || state.loginMfaMethod;
  }

  saveTokens(data);
}

function printResponse(method, path, response) {
  const statusColor = isOk(response) ? "ok" : "error";
  const statusText = `[${isOk(response) ? "OK" : "FAIL"}] ${method.toUpperCase()} ${path} -> ${response.status}`;

  console.log(paint(statusColor, `${statusText} (${response.responseTimeMs ?? 0} ms)`));
  console.log(paint("response", JSON.stringify(response.data, null, 2)));
}

async function ask(label, defaultValue = "") {
  const suffix = defaultValue ? ` (${defaultValue})` : "";
  const answer = await rl.question(paint("input", `${label}${suffix}: `));
  return answer.trim() || defaultValue;
}

async function askRequired(label) {
  let value = "";
  while (!value) {
    value = (await ask(label)).trim();
  }
  return value;
}

async function askYesNo(label, defaultYes = true) {
  const fallback = defaultYes ? "Y" : "n";
  const answer = (await ask(`${label} [Y/n]`, fallback)).toLowerCase();
  return answer === "y" || answer === "yes";
}

async function request(method, path, body = undefined, headers = {}, testCase = undefined) {
  console.log(paint("api", `[API] ${method.toUpperCase()} ${endpoint(path)}`));
  if (body && Object.keys(body).length > 0) {
    console.log(paint("dim", `[REQ] ${JSON.stringify(body, null, 2)}`));
  }

  const startedAt = performance.now();
  const response = await client.request({
    method,
    url: endpoint(path),
    data: body,
    headers: compact({
      "Content-Type": "application/json",
      "X-Request-Id": randomUUID(),
      ...headers,
    }),
  });
  const responseTimeMs = Math.round((performance.now() - startedAt) * 100) / 100;
  response.responseTimeMs = responseTimeMs;

  printResponse(method, path, response);
  applyAuthData(extractData(response.data));
  if (testCase) recordTest(testCase, method, path, response);
  return response;
}

function recordTest(testCase, method, path, response, notes = "") {
  const passed =
    typeof testCase.expect === "function" ?
      testCase.expect(response) :
      response.status === testCase.expectedStatus;

  state.testResults.push({
    name: testCase.name,
    category: testCase.category,
    method: method.toUpperCase(),
    path,
    expected: testCase.expectedStatus || testCase.expected,
    actual: response.status,
    passed,
    responseTimeMs: response.responseTimeMs ?? 0,
    message: response.data?.message || response.data?.status || "",
    notes,
  });

  const kind = passed ? "ok" : "error";
  console.log(
    paint(
      kind,
      `[TEST] ${passed ? "PASS" : "FAIL"} | ${testCase.category} | ${testCase.name}`,
    ),
  );
}

function percentile(values, percentileValue) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

function printTestReport() {
  const total = state.testResults.length;
  const passed = state.testResults.filter((test) => test.passed).length;
  const failed = total - passed;
  const times = state.testResults.map((test) => test.responseTimeMs);
  const avg = times.length ? Math.round((times.reduce((sum, item) => sum + item, 0) / times.length) * 100) / 100 : 0;

  console.log(`\n${paint("info", "[ADVANCED TEST REPORT]")}`);
  console.log(paint("response", JSON.stringify({
    total,
    passed,
    failed,
    avgMs: avg,
    p50Ms: percentile(times, 50),
    p95Ms: percentile(times, 95),
    slowestMs: Math.max(0, ...times),
  }, null, 2)));

  for (const result of state.testResults) {
    const kind = result.passed ? "ok" : "error";
    console.log(
      paint(
        kind,
        `${result.passed ? "PASS" : "FAIL"} | ${result.category} | ${result.method} ${result.path} | ${result.responseTimeMs} ms | ${result.name}`,
      ),
    );
    if (!result.passed) {
      console.log(paint("warn", `  expected: ${result.expected}; actual: ${result.actual}; message: ${result.message}`));
    }
  }
}

async function runValidationTests() {
  logStep("ADV validation tests");

  const cases = [
    {
      name: "signup rejects empty payload",
      category: "validation",
      method: "post",
      path: "/auth/signup",
      body: {},
      expectedStatus: 422,
    },
    {
      name: "signup rejects invalid email",
      category: "validation",
      method: "post",
      path: "/auth/signup",
      body: { firstName: "A", email: "bad-email", password: "short" },
      expectedStatus: 422,
    },
    {
      name: "email verify rejects invalid UUID",
      category: "validation",
      method: "post",
      path: "/auth/signup/email/verify",
      body: { email: state.email, challengeId: "bad-id", code: "123456" },
      expectedStatus: 422,
    },
    {
      name: "login rejects empty payload",
      category: "validation",
      method: "post",
      path: "/auth/login",
      body: {},
      expectedStatus: 422,
    },
    {
      name: "refresh rejects missing token",
      category: "validation",
      method: "post",
      path: "/auth/refresh",
      body: {},
      expectedStatus: 401,
    },
    {
      name: "password reset rejects weak token",
      category: "validation",
      method: "post",
      path: "/auth/password/reset",
      body: { token: "short", password: "123" },
      expectedStatus: 422,
    },
  ];

  for (const testCase of cases) {
    await request(testCase.method, testCase.path, testCase.body, {}, testCase);
  }
}

async function runSpamTests() {
  logStep("ADV spam tests");
  const spamCount = Number(process.env.AUTH_SPAM_COUNT || 8);

  const statusTests = Array.from({ length: spamCount }, (_, index) =>
    request("get", "/auth/status", undefined, {}, {
      name: `status spam ${index + 1}/${spamCount}`,
      category: "spam",
      expectedStatus: 200,
    }),
  );
  await Promise.all(statusTests);

  for (let index = 0; index < spamCount; index += 1) {
    await request("post", "/auth/login", {
      email: `invalid-${index}-${Date.now()}@example.com`,
      password: "invalid-password",
    }, {}, {
      name: `invalid login spam ${index + 1}/${spamCount}`,
      category: "spam-security",
      expectedStatus: 401,
    });
  }
}
async function requestWithRetry(name, method, path, buildBody, headers = {}) {
  while (true) {
    logStep(name);
    const response = await request(
      method,
      path,
      compact(await buildBody()),
      headers,
    );
    if (isOk(response)) return response;

    const retry = await askYesNo(`${name} failed. Retry?`, true);
    if (!retry) return response;
  }
}

async function runStatus() {
  logStep("GET status");
  await request("get", "/auth/status");
}

async function runCaptchaStart() {
  logStep("GET captcha start");
  const response = await request("get", "/auth/captcha/start");
  const data = extractData(response.data);

  if (!isOk(response)) {
    decide(
      "captcha.start",
      "skip",
      "Redis/captcha unavailable; signup validator accepts optional captcha",
      "signup without captcha",
    );
    return;
  }

  state.captchaToken = data?.captchaToken || state.captchaToken;
  state.captchaCode = data?.captchaText || state.captchaCode;

  if (state.captchaToken && state.captchaCode) {
    logInfo(`Captcha auto-filled: ${state.captchaCode}`);
    decide(
      "captcha.start",
      "ok",
      "captchaToken and captchaText received",
      "signup with captcha",
    );
  }
}

async function runSignup() {
  logStep("POST signup");
  const body = compact({
    firstName: state.firstName,
    lastName: state.lastName,
    email: state.email,
    password: state.password,
    phone: state.phone,
    captchaToken: state.captchaToken,
    captchaCode: state.captchaCode,
  });

  const response = await request("post", "/auth/signup", body);

  if (isOk(response)) {
    decide("signup", "ok", "new account created", "email verification");
    return;
  }

  if (response.status === 409) {
    decide(
      "signup",
      "skip",
      "account already exists",
      "existing-user email status check",
    );
    return;
  }

  decide(
    "signup",
    "fail",
    response.data?.message || "signup failed",
    "continue for diagnosis",
  );
}

async function runEmailStart() {
  logStep("POST email start");
  const response = await request("post", "/auth/signup/email/start", {
    email: state.email,
  });
  const data = extractData(response.data);

  if (data?.alreadyVerified) {
    decide(
      "email.start",
      "skip",
      "email already verified",
      "auth app setup or login",
    );
    return false;
  }

  if (data?.challengeId) {
    decide(
      "email.start",
      "ok",
      "email OTP challenge received",
      "manual email OTP verify",
    );
    return true;
  }

  decide(
    "email.start",
    "fail",
    response.data?.message || "email challenge missing",
    "continue for diagnosis",
  );
  return false;
}

async function runEmailVerify() {
  if (!state.emailChallengeId) {
    decide(
      "email.verify",
      "skip",
      "no email challenge available",
      "auth app setup or login",
    );
    return;
  }

  await requestWithRetry(
    "POST email verify",
    "post",
    "/auth/signup/email/verify",
    async () => ({
      email: state.email,
      challengeId: state.emailChallengeId,
      code: await askRequired("Enter email OTP"),
    }),
  );
}

async function runSignupAuthAppStart() {
  logStep("POST auth app start");
  const response = await request(
    "post",
    "/auth/signup/auth-app/start",
    compact({
      email: state.email,
      password: state.password,
    }),
  );

  const data = extractData(response.data);

  if (data?.otpauthUri) {
    logInfo("Authenticator URI auto-filled from response:");
    console.log(paint("api", data.otpauthUri));
  }

  if (state.mfaSecret) {
    logInfo(`Authenticator secret auto-filled: ${state.mfaSecret}`);
  }

  if (isOk(response)) {
    decide(
      "auth-app.start",
      "ok",
      "secret and otpauth URI received",
      "manual authenticator code verify",
    );
  } else {
    decide(
      "auth-app.start",
      "skip",
      response.data?.message || "auth app setup unavailable",
      "login existing account",
    );
  }
}

async function runSignupAuthAppVerify() {
  if (!state.mfaSecret) {
    decide(
      "auth-app.verify",
      "skip",
      "no authenticator secret from previous response",
      "login existing account",
    );
    return;
  }

  await requestWithRetry(
    "POST auth app verify",
    "post",
    "/auth/signup/auth-app/verify",
    async () => ({
      email: state.email,
      password: state.password,
      secret: state.mfaSecret,
      code: await askRequired("Enter authenticator setup code"),
    }),
  );
}

async function runLogin() {
  logStep("POST login");
  const response = await request("post", "/auth/login", {
    email: state.email,
    password: state.password,
    method: "auth_app_otp",
    deviceId: "auth-test-device",
    deviceName: "Auth Test CLI",
    deviceType: "cli",
    operatingSystem: process.platform,
    browser: "node",
  });

  const data = extractData(response.data);
  if (isOk(response) && data?.mfaRequired) {
    decide(
      "login",
      "ok",
      "credentials accepted; MFA required",
      "manual login MFA verify",
    );
  } else if (isOk(response)) {
    decide("login", "ok", "login completed; tokens issued", "refresh token");
  } else {
    state.loginFailed = true;
    decide(
      "login",
      "fail",
      response.data?.message || "login failed",
      "skip MFA and refresh if no tokens",
    );
  }
}

async function runLoginMfaVerify() {
  if (!state.loginMfaChallengeId) {
    decide(
      "login.mfa.verify",
      "skip",
      "no login MFA challenge available",
      "refresh if token exists",
    );
    return;
  }

  await requestWithRetry(
    "POST login MFA verify",
    "post",
    "/auth/login/mfa/verify",
    async () => ({
      challengeId: state.loginMfaChallengeId,
      method: state.loginMfaMethod,
      code: await askRequired("Enter login MFA code"),
      deviceId: "auth-test-device",
      deviceName: "Auth Test CLI",
      deviceType: "cli",
      operatingSystem: process.platform,
      browser: "node",
    }),
  );
}

async function runRefresh() {
  if (!state.refreshToken) {
    decide(
      "refresh",
      "skip",
      "no refresh token from login/MFA",
      "password forgot",
    );
    return;
  }

  logStep("POST refresh");
  const response = await request("post", "/auth/refresh", {
    refreshToken: state.refreshToken,
  });
  decide(
    "refresh",
    isOk(response) ? "ok" : "fail",
    isOk(response) ?
      "refresh token rotated"
    : response.data?.message || "refresh failed",
    "password forgot",
  );
}

async function runPasswordForgot() {
  logStep("POST password forgot");
  const response = await request("post", "/auth/password/forgot", {
    email: state.email,
  });
  const data = extractData(response.data);
  state.resetToken = data?.resetToken || state.resetToken;
  decide(
    "password.forgot",
    isOk(response) ? "ok" : "fail",
    isOk(response) ? "reset accepted" : (
      response.data?.message || "password forgot failed"
    ),
    state.resetToken ?
      "password reset can auto-fill token"
    : "manual reset token needed",
  );
  if (state.resetToken) logInfo(`Reset token auto-filled: ${state.resetToken}`);
}

async function runPasswordReset() {
  const defaultRunReset = Boolean(state.loginFailed && state.resetToken);
  const runReset = await askYesNo(
    "Run password reset API? Token auto-filled when available",
    defaultRunReset,
  );
  if (!runReset) {
    decide("password.reset", "skip", "user skipped password reset", "finish");
    return false;
  }

  const response = await requestWithRetry(
    "POST password reset",
    "post",
    "/auth/password/reset",
    async () => ({
      token:
        state.resetToken || (await askRequired("Enter password reset token")),
      password: await ask("Enter new password", state.password),
    }),
  );
  state.passwordResetDone = isOk(response);
  decide(
    "password.reset",
    isOk(response) ? "ok" : "fail",
    isOk(response) ? "password reset completed" : response.data?.message || "password reset failed",
    isOk(response) && state.loginFailed ? "retry login" : "finish",
  );
  return isOk(response);
}

async function run() {
  state.baseUrl = normalizeBaseUrl(await ask("Base URL", state.baseUrl));
  state.apiPrefix = normalizeApiPrefix(
    await ask("API prefix", state.apiPrefix),
  );
  state.email = await ask("Auth email", state.email);
  state.password = await ask("Auth password", state.password);

  await runStatus();
  await runCaptchaStart();
  await runSignup();
  const needsEmailOtp = await runEmailStart();
  if (needsEmailOtp) await runEmailVerify();
  await runSignupAuthAppStart();
  await runSignupAuthAppVerify();
  await runLogin();
  await runLoginMfaVerify();
  await runRefresh();
  await runPasswordForgot();
  const resetDone = await runPasswordReset();

  if (resetDone && state.loginFailed) {
    decide("retry.login", "ok", "password reset completed after invalid credentials", "login again");
    state.loginFailed = false;
    state.loginMfaChallengeId = "";
    await runLogin();
    await runLoginMfaVerify();
    await runRefresh();
  }

  await runValidationTests();
  await runSpamTests();
  printDecisionTree();
  printTestReport();
  console.log(`\n${paint("ok", "[AUTH] Public auth flow complete")}`);
  console.log(
    paint(
      "response",
      JSON.stringify(
        {
          userId: state.userId,
          hasAccessToken: Boolean(state.accessToken),
          hasRefreshToken: Boolean(state.refreshToken),
          emailChallengeId: state.emailChallengeId || null,
          loginMfaChallengeId: state.loginMfaChallengeId || null,
        },
        null,
        2,
      ),
    ),
  );
}

run()
  .catch((error) => {
    const response = error?.response;
    if (response) {
      logError(JSON.stringify(response.data, null, 2));
    } else {
      logError(error?.stack || error?.message || String(error));
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
  });

