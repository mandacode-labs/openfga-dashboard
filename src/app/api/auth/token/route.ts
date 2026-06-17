import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenUrl, clientId, clientSecret, audience, scope } = body;

    if (!tokenUrl || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const params = new URLSearchParams();
    params.set("grant_type", "client_credentials");

    if (audience) {
      params.set("audience", audience);
    }
    if (scope) {
      params.set("scope", scope);
    }

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64",
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authHeader}`,
      },
      body: params.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await response.text();

    if (!response.ok) {
      console.error(
        `OIDC token request failed: ${response.status} — ${text.slice(0, 500)}`,
      );
      return NextResponse.json(
        {
          error: `Token endpoint returned ${response.status}: ${text.slice(0, 200)}`,
        },
        { status: 502 },
      );
    }

    if (text.startsWith("<") || text.startsWith("<!DOCTYPE")) {
      console.error(
        `OIDC token endpoint returned HTML instead of JSON. Check the Token URL. First 200 chars: ${text.slice(0, 200)}`,
      );
      return NextResponse.json(
        {
          error:
            "Token URL returned HTML instead of JSON. Make sure the Token URL points to an OAuth2 token endpoint, not a web page or the OpenFGA server.",
        },
        { status: 502 },
      );
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        {
          error: `Token endpoint returned non-JSON response. First 200 chars: ${text.slice(0, 200)}`,
        },
        { status: 502 },
      );
    }
  } catch (err) {
    const isTimeout =
      err instanceof Error &&
      (err.name === "AbortError" || err.name === "TimeoutError");

    if (isTimeout) {
      return NextResponse.json(
        { error: "Token request timed out" },
        { status: 504 },
      );
    }

    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("OIDC token proxy error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
