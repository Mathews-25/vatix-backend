/**
 * Tests for orders API routes
 */

import { buildApp } from "../../index";

describe("Orders API Routes", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    // Build app with placeholder controller
    app = await buildApp();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe("POST /orders", () => {
    it("should return 401 when user address is missing", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/orders",
        payload: {
          marketId: "market-1",
          side: "buy",
          outcome: "yes",
          price: 0.5,
          quantity: 100,
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("AUTHENTICATION_REQUIRED");
    });

    it("should validate request body schema", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/orders",
        headers: {
          "x-user-address": "0x123456789",
        },
        payload: {
          // Missing required fields
          marketId: "market-1",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should accept valid order request structure", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/orders",
        headers: {
          "x-user-address": "0x123456789",
        },
        payload: {
          marketId: "market-1",
          side: "buy",
          outcome: "yes",
          price: 0.5,
          quantity: 100,
        },
      });

      // Should reach the controller (which will throw since it's not implemented)
      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
    });

    it("should validate side enum values", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/orders",
        headers: {
          "x-user-address": "0x123456789",
        },
        payload: {
          marketId: "market-1",
          side: "invalid",
          outcome: "yes",
          quantity: 100,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should validate positive quantity", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/orders",
        headers: {
          "x-user-address": "0x123456789",
        },
        payload: {
          marketId: "market-1",
          side: "buy",
          outcome: "yes",
          quantity: -10,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
