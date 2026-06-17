# OpenFGA Dashboard

A web-based dashboard for managing [OpenFGA](https://openfga.dev) authorization servers. Connect to any OpenFGA instance and manage authorization models, relationship tuples, and run queries — all from your browser.

**[openfga.mandacode.com](https://openfga.mandacode.com)**

## Features

- **Connect to any OpenFGA server** — No installation needed. Point to your server URL and go.
- **Multiple authentication methods** — None, API Key (bearer token), or OIDC Client Credentials.
- **Store management** — List, create, and delete stores.
- **Authorization model editor** — Write and edit models using OpenFGA DSL with a live type definitions viewer.
- **Import/export** — Load and save `.fga` model files.
- **Relationship tuples** — Add, search, filter, and delete tuples with pagination.
- **Query operations** — 8 built-in query types:
  - Check, Batch Check, Expand
  - List Objects, List Users, List Relations
  - Read Changes (audit trail), Assertions (model testing)
- **Dark mode** — Toggle between light and dark themes.
- **No data stored** — All connection credentials stay in your browser's memory. Export configs as `.json` files for reuse.

## Getting Started

### Prerequisites

- Node.js 20+
- An OpenFGA server (or [run one locally](https://openfga.dev/docs/getting-started/setup-openfga))

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production

```bash
npm run build
npm start
```

The dashboard connects to your OpenFGA server directly from the browser. OIDC token exchange is proxied through the Next.js server to avoid CORS issues.

## Authentication

| Method | Use when |
|--------|----------|
| **None** | OpenFGA server has no authentication configured |
| **API Key** | Pre-shared key (bearer token) |
| **OIDC** | OAuth2 Client Credentials flow (supports audience and scope) |

## Connecting to Zitadel

1. Select **OIDC Client Credentials** as authentication
2. Enter your Zitadel Token URL (e.g., `https://your-domain.zitadel.cloud/oauth/v2/token`)
3. Enter Client ID and Client Secret
4. Set Scope to include your project ID: `openid profile urn:zitadel:iam:org:project:id:{PROJECT_ID}:aud`

## Tech Stack

- [Next.js](https://nextjs.org) 16 — App Router
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com) (Base UI)
- [OpenFGA SDK](https://www.npmjs.com/package/@openfga/sdk)
- [Zustand](https://zustand.docs.pmnd.rs) — state management
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — DSL editing

## License

Apache 2.0
