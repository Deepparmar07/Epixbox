# EpixBox Environment Setup

This guide covers local development and the variables used by the hosted
Vercel/Render deployment. Optional integrations can be left unconfigured until
you need them.

## Requirements

- Node.js 20 or newer and npm
- PostgreSQL 14+ locally or a development PostgreSQL-compatible database
- Git

Optional tools:

- Docker Desktop for container workflows
- Docker Desktop Kubernetes and `kubectl` for local manifest validation
- Terraform for formatting, initialization, and validation only

Redis is not a required application dependency in the current package
manifests.

## Install

From the repository root:

```sh
npm install
```

The root package uses npm workspaces for `client` and `server`.

## Configure the API

The API loads `server/.env`. The root [`.env.example`](../.env.example) is a
reference template containing both server and client settings; copy only the
variables needed for the API into `server/.env`.

Required server settings:

```env
NODE_ENV=development
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=photoapp_dev
DB_USER=postgres
DB_PASSWORD=your-local-password
DB_SSL=false
JWT_ACCESS_SECRET=generate-a-unique-secret
JWT_REFRESH_SECRET=generate-a-different-secret
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

You can use `DATABASE_URL` in place of the individual `DB_*` variables. Set
`DB_SSL=true` when your database requires SSL. Generate distinct random JWT
secrets for local use; never reuse production credentials.

For a hosted or local S3 bucket, add:

```env
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-restricted-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-private-bucket
```

Use a dedicated IAM identity with only the permissions required by the
application, and keep AWS credentials server-side. Add SMTP, Razorpay, PayPal,
Google OAuth, or Sentry variables only when configuring those integrations.
The full variable-name reference is in [`.env.example`](../.env.example).

## Configure the client

Vite loads client environment variables from the `client` directory. Create
`client/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

Optional client integrations include:

```env
VITE_GOOGLE_CLIENT_ID=
VITE_SENTRY_DSN=
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_LOGROCKET_APP_ID=
```

Any `VITE_*` value is bundled into the public client. Do not put server-side
secrets, AWS credentials, payment secrets, database credentials, or JWT secrets
in client variables.

## Initialize PostgreSQL

Create a development database, then run migrations from the repository root:

```sh
npm run db:migrate --workspace=server
```

Review the target database before running migrations. Never point local
development commands at production unintentionally.

## Run locally

Start the API and frontend together:

```sh
npm run dev
```

- Frontend: `http://localhost:5173`
- API health: `http://localhost:4000/health`
- Swagger UI: `http://localhost:4000/api/docs`

On Windows, `npm run oneclick` runs the PowerShell development launcher.

## Hosted configuration

### Vercel frontend

Set the required client build variables in the Vercel project:

- `VITE_API_BASE_URL` (normally `/api/v1` when using the configured Vercel
  rewrite)
- Any optional `VITE_*` integrations in use

The variables are embedded at build time; redeploy after changing them.

### Render API

Set server-side values in the Render environment:

- Database connection (`DATABASE_URL` or `DB_*`)
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- AWS, SMTP, payment, OAuth, and Sentry values for enabled features

Production startup is configured with `AUTO_MIGRATE=false` and
`ALLOW_PENDING_MIGRATIONS=true`, so migrations are deliberately not applied
automatically. Review and apply migrations through a controlled deployment
process with a verified backup.

## Optional local tooling

Docker Compose runs the API and Nginx frontend; it does not provision
PostgreSQL. Configure a development database and API `server/.env` first, then:

```sh
docker compose up --build
```

For Docker Desktop Kubernetes and Terraform commands, see the corresponding
sections in the [root README](../README.md). The Kubernetes manifests are a
local learning/validation setup; Terraform is not connected to production.

## Troubleshooting

- **Database connection failure:** check PostgreSQL availability and verify
  the `DATABASE_URL` or `DB_*` values.
- **Migration validation failure:** run the migration command against the
  intended development database.
- **CORS error:** check `CLIENT_URL`, `FRONTEND_URL`, and `CORS_ORIGINS` on the
  API, then verify the request's actual origin.
- **S3 access failure:** confirm bucket, region, IAM permissions, and that
  credentials are configured only on the API. Do not share signed URLs or
  credentials.
- **Missing optional feature:** verify the provider credentials and client
  build variables required by that feature.
