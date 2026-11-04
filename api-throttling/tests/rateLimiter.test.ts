import request from "supertest";
import app from "../src/app";

describe("API Rate Limiter Tests", () => {
  it("should allow requests within limit and reject when limit exceeded on /foo", async () => {
    const client = "client-tier-basic"; // Max 3 requests

    for (let i = 0; i < 3; i++) {
      const res = await request(app)
        .get("/foo")
        .set("Authorization", `bearer ${client}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ succes: true });
    }

    // 4e request moet 429 geven
    const resOverLimit = await request(app)
      .get("/foo")
      .set("Authorization", `bearer ${client}`);
    expect(resOverLimit.status).toBe(429);
    expect(resOverLimit.body).toEqual({ error: "rate limit exceeded" });
  });

  it("should return 401 if Authorization header is missing", async () => {
    const res = await request(app).get("/foo");
    expect(res.status).toBe(401);
  });
});