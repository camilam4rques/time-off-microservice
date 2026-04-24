# Time-Off Microservice

A specialized microservice designed to manage employee time-off requests and balances, featuring mocked integration for Human Capital Management (HCM) systems.

## Prerequisites

Before starting, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/installation) (Recommended package manager)

## Setup Instructions

1.  **Extract the project** to your desired directory.
2.  **Open a terminal** inside the `time-off-microservice` folder.
3.  **Install all dependencies** by running:
    ```bash
    pnpm install
    ```
    *(Note: This will create the `node_modules` folder and install NestJS, TypeORM, and SQLite drivers).*

## Running the Solution

### Development Mode
To start the server with automatic reloads (hot-reload):
```bash
pnpm run start:dev
```
The server will be running at: `http://localhost:3000`
The root route (/) returns a simple "Hello World" response.
This endpoint is intentionally minimal and acts only as a health check, confirming that the service is up and running.

### Main API Routes

The core business logic of the application is exposed through the following routes:

- /employees → Employee management and data
- /time-off → Time-off request lifecycle (create, approve, reject)
- /hcm → Mocked HCM integration for balance synchronization

These routes contain the actual application logic and should be used for all functional interactions with the system.

### Production Build
To build and run the production version:
```bash
pnpm run build
pnpm run start:prod
```

## Testing the Solution

### End-to-End (E2E) Tests
To run the automated test suite that validates the entire lifecycle:
```bash
pnpm run test:e2e
```

## Key API Endpoints

-   `POST /employees`: Register a new employee.
-   `POST /hcm/sync-balance`: Sync employee balance from HCM.
-   `POST /time-off/requests`: Submit a new time-off request.
-   `PUT /time-off/requests/:id/approve`: Approve a request (Implements **Database Transactions** and **Idempotency**).
-   `GET /time-off/employees/:id/balances`: Retrieve current balances for an employee.

## Architectural & Design Decisions

-   **Concurrency Control**: Uses **Database Transactions** during the approval process to ensure balance integrity and atomicity.
-   **Idempotency**: Approval operations are idempotent to prevent duplicate balance deductions from retried requests.
-   **Consistency**: Adopts an eventual consistency model with defensive local validation against the "Source of Truth" (HCM).
-   **Resilience**: Designed with modular services to easily implement circuit breakers or retry logic in a production environment.
-   **Security**: Implements input validation via DTOs and NestJS ValidationPipes.

This implementation prioritizes simplicity and clarity, while outlining how a production-ready system would handle distributed consistency
