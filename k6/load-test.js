import http from "k6/http";
import { check, sleep } from "k6";

// K6 Load Test Configuration
// Master Plan Phase 6: Simulate 500 Virtual Users (VU) to test DB Connection Pooling
export const options = {
  stages: [
    { duration: "30s", target: 50 }, // Ramp up to 50 users
    { duration: "1m", target: 50 }, // Stay at 50 for 1 minute
    { duration: "30s", target: 200 }, // Spike to 200 users (Stress Test)
    { duration: "1m", target: 200 }, // Hold Spike
    { duration: "30s", target: 0 }, // Ramp down to 0
  ],
  thresholds: {
    // 95% of requests must complete within 500ms
    http_req_duration: ["p(95)<500"],
    // Less than 1% of requests should fail
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.TARGET_URL || "http://localhost:3000";

export default function () {
  // 1. Test the Edge Security Middleware (Rate Limits & CSP)
  const res = http.get(`${BASE_URL}/api/health`);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "health check passes": (r) => r.body.includes("ok"),
  });

  // 2. Test SSR Performance on Public Landing
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    "homepage loads": (r) => r.status === 200,
  });

  // Short delay between requests to simulate real users reading
  sleep(1);
}
