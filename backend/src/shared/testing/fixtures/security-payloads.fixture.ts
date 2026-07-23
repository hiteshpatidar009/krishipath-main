export const securityPayloads = Object.freeze({
  sqlInjection: { name: "'; DROP TABLE users; --" },
  xss: { html: "<script>alert(1)</script>" },
  replayHeaders: { "X-Replay-Nonce": "replay-test-nonce" },
  tamperedHeaders: { "X-Signature": "tampered-signature" },
});
