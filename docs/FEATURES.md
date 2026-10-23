# EpixBox Features

This guide summarizes product areas represented in the current application
code. Payment providers, email, monitoring, and some account features require
their corresponding service credentials. A feature in the codebase is not
proof that its external provider is configured in every deployment.

## Photographer workspace

- Create and manage portfolios and galleries.
- Upload, organize, tag, search, edit, and download photos.
- Configure gallery visibility, passwords, expiry, themes, and download
  behavior where supported by the selected feature.
- Extract photo metadata and generate optimized or watermarked image outputs.
- Manage profile and account settings from the dashboard.

## Client proofing and sharing

- Create token-based proofing links for selected galleries.
- Let clients review galleries, comment, rate or select photos, and submit
  feedback without requiring a full photographer account.
- Track proofing activity and download approved or watermarked deliverables.
- Support public/private gallery access and share workflows.

## Store and subscriptions

- Manage products, variants, inventory, coupons, shipping, and orders.
- Offer subscription plans and track plan-related usage.
- Integrate Razorpay checkout/subscriptions and PayPal checkout flows where
  credentials and payment configuration are enabled.
- Process payment webhooks through server routes.

## Accounts, administration, and operations

- JWT-based registration, login, refresh, logout, and password recovery.
- Optional Google sign-in when OAuth client IDs are configured.
- TOTP setup/verification and backup-code management screens and API routes
  are present, but the current login route does not enforce a second-factor
  step. Treat this as a setup workflow, not login-enforced MFA.
- Role-based admin areas for user, product, plan, and operational management.
- API request validation, rate limits, CORS restrictions, and structured
  request/error logging.
- Swagger UI for interactive API documentation.
- Socket.IO channels for real-time communication.
- Optional Sentry client/API monitoring and LogRocket client session monitoring.

## Storage and media

- AWS S3 is the media object store used by the configured hosted application.
- Short-lived signed URLs support object access; PostgreSQL keeps application
  records and media metadata.
- CloudFront is configured independently for S3 image delivery.
- The repository supports local media workflows through its S3 service; local
  development must be configured with an appropriate test bucket or mocked
  environment.

## Deployment and DevOps workflows

- Vercel hosts the frontend; Render hosts the Express API.
- Neon PostgreSQL is the hosted relational database.
- Dockerfiles and Docker Compose support local container builds and runs.
- Kubernetes manifests are provided for local Docker Desktop validation.
- GitHub Actions builds the client and container images and validates selected
  Kubernetes/Terraform files.
- Terraform describes a possible AWS foundation; it is not the source of
  production infrastructure and CI does not apply it.

## Configuration-dependent integrations

The following require credentials or provider-side configuration before they
are available:

| Integration | Configuration |
| --- | --- |
| AWS S3 | `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| PayPal | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` |
| SMTP email | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` |
| Google sign-in | Google OAuth client ID variables |
| Sentry | `SENTRY_DSN`, `VITE_SENTRY_DSN` |
| LogRocket | `VITE_LOGROCKET_APP_ID` |

See the [environment setup guide](./ENVIRONMENT_SETUP.md) and root
[`.env.example`](../.env.example). Do not put server secrets in frontend
`VITE_*` variables.

## Current limitations to keep in mind

- The Google Pay client component is experimental; its server payment endpoint
  currently returns HTTP 501, so it is not a working end-to-end payment flow.
- The TOTP setup workflow is not enforced during login; do not present it as
  login-enforced multi-factor authentication.
- Optional providers are not necessarily enabled in the hosted environment
  just because their integration code exists.
