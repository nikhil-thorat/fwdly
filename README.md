# fwdly

A high-performance, microservice-based URL shortening service engineered for high throughput, low-latency redirection, and asynchronous analytics.

## The Origin

After spending time engineering low-level software from first principles such as custom in-memory databases and version control systems, I wanted to apply those performance-critical concepts to a distributed systems context.

**fwdly** was built to be more than just a standard URL shortener; it serves as a robust sandbox for exploring microservice architecture, high-availability caching, event-driven data pipelines, and container orchestration. The goal was to design a system capable of handling thousands of concurrent redirects while seamlessly offloading clickstream data to a decoupled analytics engine.

The frontend dashboard strictly adheres to a minimalist design ensuring a professional and uncluttered user experience.

## Features & User Tiers

fwdly uses Google OAuth for seamless authentication and offers structured access tiers:

* **Guest (Unauthenticated):** Can generate a limited number of short links. Strict API-gateway rate limiting is applied via Redis to prevent abuse. No analytics provided.
* **Basic (Free):** Authenticated users who can create and manage their links via a dashboard. Includes basic click analytics.
* **Pro ($5/mo):** Premium tier offering unlimited link creation, custom URL aliases (e.g., `fwdly.link/my-brand`), and a detailed real-time analytics dashboard. Subscriptions handled via Stripe.

## Architecture & Tech Stack

The platform is designed as a decoupled monorepo leveraging **Go Workspaces (`go.work`)** for the backend and **Next.js** for the frontend, orchestrated via **Docker** and **Kubernetes**.

### Core Services (Golang)
* **API Gateway:** The single entry point routing traffic, validating JWT sessions, and enforcing token-bucket rate limits for guest users.
* **Management Service:** Handles CRUD operations for URLs, user tier management, and subscription webhook processing.
* **Redirect Service:** A hyper-optimized, low-latency service. It queries Redis for cached URL mappings; on a cache miss, it falls back to PostgreSQL, updates the cache, and executes the 301/302 redirect.
* **Analytics Service:** A decoupled Kafka consumer that aggregates clickstream events and writes them to the database for dashboard visualization.

### Data & Infrastructure
* **PostgreSQL:** Primary source of truth. Handles strict ACID transactions for users/subscriptions and utilizes native `BIGSERIAL` sequences to generate unique IDs, which the Go backend seamlessly encodes into Base62 for collision-free short codes.
* **Redis:** Caches hot URL mappings to minimize database read pressure and manages distributed rate limiting.
* **Kafka:** Acts as the central message broker. The Redirect Service fires asynchronous, fire-and-forget click events to Kafka, ensuring zero added latency to the user's redirect experience.

## Project Setup

### Prerequisites
* [Go 1.21+](https://go.dev/)
* [Node.js & npm](https://nodejs.org/)
* [Docker & Docker Compose](https://www.docker.com/)

### Local Development

1. **Clone the repository:**
```bash
   git clone https://github.com/nikhil-thorat/fwdly.git
   cd fwdly
```

2. **Start the infrastructure:**
Spin up PostgreSQL, Redis, and Kafka using Docker Compose (manifests in the root directory).
```bash
   docker-compose up -d
```

3. **Run the Go microservices:**
The backend uses a Go workspace. You can run individual services from the root:
```bash
   go run ./services/api-gateway
   go run ./services/redirect
```

4. **Run the Nextjs UI:**
```bash
   cd ui
   npm install
   npm run dev
```
