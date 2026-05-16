# Application Tracker

<!-- Live Site: https:// -->

Application Tracker is a full-stack web application for organizing and tracking applications in one place. It combines a React frontend with an Express API and a PostgreSQL database managed through Prisma.

## Features

- Create, update, and delete application entries
- Dashboard with statistics
- Track application status changes and follow-ups
- Manage related contacts for each application
- Log communication history for every application

## Tech Stack

- Frontend: React, TypeScript, Vite, Mantine, React Router, Tailwind CSS
- Backend: Node.js, Express, TypeScript, Zod
- Database: PostgreSQL, Prisma
- Tooling: npm workspaces, Vitest, Testing Library, Docker Compose

## Installation

### Prerequisites

- Node.js
- npm
- PostgreSQL
- Docker (optional, if you want to run PostgreSQL locally via Docker Compose)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/Dudeldups/application-tracker.git
cd application-tracker
```

2. Install dependencies:

```bash
npm install
```

3. Configure the environment variables (see `.env.example`)

4. Start PostgreSQL.

If you want to use the Dockerized local database, run:

```bash
npm run db:up
```

If you already have PostgreSQL running elsewhere, skip this step and make sure `DATABASE_URL` points to that database.

5. Run the Prisma migration:

```bash
npm run db:migrate
```

6. Start the development servers:

```bash
npm run dev
```

The frontend runs from `apps/web` and the API runs from `apps/api`.

## License

This project is licensed under the MIT License.
