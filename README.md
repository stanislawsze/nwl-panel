# NWL Panel

React admin panel for the NWL API. It is built with Vite, TypeScript, React Router, and a small typed API client for the Laravel `/api/v1` contract.

## Requirements

- Node.js 20+
- npm 10+
- NWL API running locally or in an accessible environment

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

The default API URL is `http://localhost/api/v1`. Change `VITE_API_BASE_URL` when the backend runs elsewhere.

## Scripts

```bash
npm run lint
npm run format
npm test
npm run build
```

## Included Flows

- Email/password sign in and registration
- Invitation preview, invited-user registration, and existing-user acceptance
- Tenant creation and tenant switching
- Member listing, role updates, and removal
- Tenant invitations
- Discord integration settings

## CI

GitHub Actions runs on pushes to `main` and pull requests:

- `npm ci`
- `npm run lint`
- `npm run format`
- `npm test`
- `npm run build`
