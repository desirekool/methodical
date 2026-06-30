# Helm — Customer Service / Ticketing System

## Origin

Spun off from **methodical** (the reusable kanban board) into its own project. Methodical stays as a general-purpose project-management tool. Helm is purpose-built for LLM-augmented customer service.

## Name

**Helm** — suggests guidance, control, direction. Fits a system where human agents steer customer outcomes with LLM co-piloting.

Alternative candidates: Relay, Resolve, Brief, Dock, Pulse, Clarify.

## Architecture Decisions (inherited from methodical session)

| Decision | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Database ORM | Drizzle ORM |
| Dev DB | SQLite (`better-sqlite3`) |
| Prod DB | PostgreSQL (Docker) |
| Client state | TanStack Query (server-driven) |
| Schema evolution | Drizzle Kit migrations |

## LLM / Customer Ticket Roadmap

- `metadata` JSON column on the tasks/tickets table from day one (flexible schema for LLM fields: sentiment, confidence, intent classification, suggested response).
- Future: vector embeddings column (`FTS5` / `pgvector`) for semantic search over tickets.
- Future: LLM-judge eval dimensions per ticket (response quality, resolution time, escalation accuracy).

## Key Differences from Methodical

- Ticket-centric schema (customer info, priority SLA, conversation history) instead of generic kanban tasks.
- Built-in LLM integration layer (response generation, summarization, triage).
- Agent workspace (inbox, queue, handoff) vs. board view.
