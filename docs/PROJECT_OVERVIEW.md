# EpixBox Project Overview

EpixBox is a full-stack photography platform for photographers to organize
portfolios and galleries, collaborate with clients through proofing workflows,
and manage media commerce.

## What it does

- Organizes photographer profiles, portfolios, galleries, and photo assets.
- Supports private gallery access and client proofing workflows.
- Processes images and supports metadata, watermark, and download operations.
- Provides product, inventory, order, shipping, coupon, and subscription
  workflows.
- Includes account, admin, analytics, and API documentation surfaces.

## How it is built

The repository is an npm-workspaces monorepo:

- **Client:** React 19, TypeScript/JavaScript, Vite, React Router, Zustand, and
  Tailwind CSS.
- **API:** Node.js 20 and Express, organized into routes, middleware, models,
  migrations, and service modules.
- **Data:** PostgreSQL accessed with Sequelize; schema changes are recorded as
  migrations.
- **Media:** AWS S3 object storage, with CloudFront configured independently
  for image delivery.
- **Integrations:** Razorpay and PayPal payment flows; SMTP email; Socket.IO;
  optional Sentry and LogRocket monitoring.

## Configured hosted topology

```text
Vercel (frontend) -> Render (Express API) -> Neon PostgreSQL
                                      -> AWS S3 -> CloudFront (image delivery)
```

The repository also contains Docker and Docker Compose files, local Kubernetes
manifests, a Terraform AWS foundation, and GitHub Actions checks. Docker Compose
and Kubernetes support local development/validation. Terraform is a
plan/validation starting point and is not the deployed production stack.

## Engineering concerns

- JWT authentication, bcrypt password hashing, and role checks.
- Express security middleware, CORS configuration, rate limits, request
  validation, and structured logs.
- Ordered database migrations and explicit production migration controls.
- Optional error/performance monitoring through Sentry and client-session
  monitoring through LogRocket.

This overview summarizes repository implementation and checked-in deployment
configuration; it is not a security audit, uptime guarantee, or proof that all
optional third-party integrations are enabled in production.

## Documentation map

- [Architecture](./ARCHITECTURE.md)
- [Features](./FEATURES.md)
- [Environment setup](./ENVIRONMENT_SETUP.md)
- [Infrastructure diagram](./infrastructure-diagram.md)
- [Backup and recovery planning](./backup-recovery.md)
- [Load-test result notes](./load-test-results.md)
