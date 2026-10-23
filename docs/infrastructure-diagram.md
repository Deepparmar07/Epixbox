# EpixBox Infrastructure

## Configured hosted application

```mermaid
flowchart TB
  subgraph Hosted["Production application"]
    direction LR
    Visitor["Photographer or client"] -->|"HTTPS"| Web["Vercel<br/>React + Vite"]
    Web -->|"API proxy: /api/*"| API["Render<br/>Node.js + Express API"]
    API -->|"Sequelize"| Database[("Neon<br/>PostgreSQL")]
    API -->|"private media storage"| Storage[("AWS S3")]
    Storage -->|"image origin"| CDN["CloudFront<br/>image delivery"]
    CDN -->|"images"| Visitor
  end

  subgraph Services["Connected services"]
    direction LR
    Payments["Razorpay / PayPal"]
    Email["SMTP email"]
    Sentry["Sentry<br/>optional errors and traces"]
    LogRocket["LogRocket<br/>optional session monitoring"]
  end
  API -->|"payments and webhooks"| Payments
  API -->|"transactional email"| Email
  Web -.-> Sentry
  API -.-> Sentry
  Web -.-> LogRocket

  subgraph Delivery["Source and continuous integration"]
    direction LR
    Developer["Developer"] --> Repository["GitHub repository"]
    Repository -->|"configured deployment"| Web
    Repository -->|"configured deployment"| API
    Repository --> Actions["GitHub Actions"]
    Actions --> Checks["Client and container builds<br/>Kubernetes and Terraform validation"]
  end

  subgraph Local["Local development"]
    direction LR
    Compose["Docker Compose"]
    Kubernetes["Docker Desktop Kubernetes"]
    Terraform["Terraform foundation<br/>plan and validation only"]
  end
```

Solid arrows show application traffic and configured integrations; dotted
arrows indicate optional monitoring. GitHub Actions runs builds and
configuration checks, while Vercel and Render handle their configured
deployments. Docker Compose and Kubernetes are local workflows. Terraform is a
validation foundation, not the source of production resources.

## Build and validation

```mermaid
flowchart LR
  Dev["Developer"] --> GitHub["GitHub: main"]
  GitHub --> Actions["GitHub Actions"]
  Actions --> Client["Build client"]
  Actions --> API["Build API image"]
  Actions --> Image["Build client image"]
  Actions --> Kube["Validate selected Kubernetes manifests"]
  Actions --> TF["Terraform fmt / validate"]
  Compose["Docker Compose"] -.-> Local["Local development"]
  DockerDesktop["Docker Desktop Kubernetes"] -.-> Local
```

GitHub Actions performs builds and validation; it does not apply Terraform or
deploy the local Kubernetes setup. Vercel and Render have separate hosting
integrations for the hosted frontend and API.

## API details

- Versioned API prefix: `/api/v1`
- Compatibility API prefix: `/api`
- Swagger UI: `/api/docs` and `/api/v1/docs`
- Health check: `/health`
- Vercel proxies `/api/:path*` to the configured Render API.
