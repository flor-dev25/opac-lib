# Library Management Infrastructure

Infrastructure and connection verification for the Library Management project.

## Available Providers

- [Supabase](./providers/supabase/README.md) - PostgreSQL connection via shared pooler.
- [Firebase](./providers/firebase/README.md) - (Documentation-only placeholder)

## Commands

| Command | Description |
| --- | --- |
| `npm run health` | Default health check (currently Supabase) |
| `npm run health:supabase` | Explicit Supabase connection check |
| `npm run typecheck` | Run TypeScript type checking |

## Setup

See the individual provider directories for setup instructions.
