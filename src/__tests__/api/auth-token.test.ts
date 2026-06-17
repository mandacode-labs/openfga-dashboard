import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/auth/token/route";

// Mock fetch globally
const originalFetch = global.fetch;

describe("/api/auth/token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns 400 when required fields are missing", async () => {
    const request = new NextRequest("http://localhost/api/auth/token", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing required fields");
  });

  it("returns 400 when tokenUrl is missing", async () => {
    const request = new NextRequest("http://localhost/api/auth/token", {
      method: "POST",
      body: JSON.stringify({ clientId: "id", clientSecret: "secret" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("successfully proxies token request", async () => {
    const mockTokenResponse = {
      access_token: "test-token",
      token_type: "Bearer",
      expires_in: 3600,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockTokenResponse)),
    });

    const request = new NextRequest("http://localhost/api/auth/token", {
      method: "POST",
      body: JSON.stringify({
        tokenUrl: "https://auth.example.com/token",
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.access_token).toBe("test-token");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://auth.example.com/token",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      }),
    );
  });

  it("includes audience and scope when provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ access_token: "token" })),
    });

    const request = new NextRequest("http://localhost/api/auth/token", {
      method: "POST",
      body: JSON.stringify({
        tokenUrl: "https://auth.example.com/token",
        clientId: "id",
        clientSecret: "secret",
        audience: "https://api.example.com",
        scope: "openid profile",
      }),
    });

    await POST(request);

    const callArgs = (global.fetch as any).mock.calls[0];
    const body = callArgs[1].body;
    expect(body).toContain("audience=https%3A%2F%2Fapi.example.com");
    expect(body).toContain("scope=openid+profile");
  });

  it("returns 502 when token endpoint returns error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });

    const request = new NextRequest("http://localhost/api/auth/token", {
      method: "POST",
      body: JSON.stringify({
        tokenUrl: "https://auth.example.com/token",
        clientId: "id",
        clientSecret: "secret",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toContain("401");
  });

  it("returns 502 when endpoint returns HTML", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve("<!DOCTYPE html><html><body>Error</body></html>"),
    });

    const request = new NextRequest("http://localhost/api/auth/token", {
      method: "POST",
      body: JSON.stringify({
        tokenUrl: "https://auth.example.com/token",
        clientId: "id",
        clientSecret: "secret",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toContain("HTML instead of JSON");
  });

  it("returns 504 on timeout", async () => {
    global.fetch = vi.fn().mockRejectedValue(
      Object.assign(new Error("The operation was aborted"), {
        name: "AbortError",
      }),
    );

    const request = new NextRequest("http://localhost/api/auth/token", {
      method: "POST",
      body: JSON.stringify({
        tokenUrl: "https://auth.example.com/token",
        clientId: "id",
        clientSecret: "secret",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(504);
    expect(data.error).toBe("Token request timed out");
  });
});
