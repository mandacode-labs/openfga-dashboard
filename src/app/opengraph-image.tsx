import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "OpenFGA Dashboard";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
        padding: "80px",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 463 463"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="OpenFGA logo"
        >
          <path
            d="M369.462 0H93.1716C41.8055 0 0.165039 41.6405 0.165039 93.0066V369.297C0.165039 420.663 41.8055 462.303 93.1716 462.303H369.462C420.828 462.303 462.468 420.663 462.468 369.297V93.0066C462.468 41.6405 420.828 0 369.462 0Z"
            fill="white"
          />
          <path
            d="M274.938 114.762C274.943 120.497 277.232 125.996 281.301 130.052C285.37 134.108 290.887 136.397 296.622 136.402C302.357 136.397 307.874 134.108 311.943 130.052C316.012 125.996 318.301 120.497 318.306 114.762C318.301 109.027 316.012 103.528 311.943 99.4721C307.874 95.4163 302.357 93.1273 296.622 93.1223C290.887 93.1273 285.37 95.4163 281.301 99.4721C277.232 103.528 274.943 109.027 274.938 114.762ZM144.287 347.407C144.293 353.142 146.581 358.642 150.65 362.697C154.719 366.753 160.237 369.042 165.972 369.047C171.707 369.042 177.225 366.753 181.294 362.697C185.363 358.642 187.651 353.142 187.657 347.407C187.651 341.672 185.363 336.172 181.294 332.117C177.225 328.061 171.707 325.772 165.972 325.767C160.237 325.772 154.719 328.061 150.65 332.117C146.581 336.172 144.293 341.672 144.287 347.407Z"
            fill="black"
          />
        </svg>
        <div
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            letterSpacing: "-0.02em",
          }}
        >
          OpenFGA Dashboard
        </div>
      </div>
      <div
        style={{
          fontSize: "24px",
          color: "#a1a1aa",
          lineHeight: 1.5,
          maxWidth: "800px",
        }}
      >
        A web-based dashboard for managing OpenFGA authorization servers. Manage
        stores, authorization models, relationship tuples, and run queries.
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "60px",
          right: "80px",
          fontSize: "18px",
          color: "#52525b",
        }}
      >
        openfga.mandacode.com
      </div>
    </div>,
    { ...size },
  );
}
