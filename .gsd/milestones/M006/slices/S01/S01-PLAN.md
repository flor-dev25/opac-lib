# M006-S01-PLAN: Semantic Infrastructure & AI UI

## Vision
Set up the foundational vector search capabilities and the AI entry point (Floating Badge).

## Tasks

### 1. Database & Vector DB (Postgres)
- [ ] **T01: Enable pgvector**
  - Run `CREATE EXTENSION IF NOT EXISTS vector;`
- [ ] **T02: Vector Columns**
  - Add `embedding` column (vector(768)) to `tblCat`.
- [ ] **T03: Initial Indexing**
  - Create a migration script to generate embeddings for existing records using `nomic-embed-text`.

### 2. Frontend UI (React)
- [ ] **T04: Floating AI Badge**
  - Create `AIChatBadge.tsx` in bottom-right.
  - Implement opacity logic: 30% idle, 100% hover.
- [ ] **T05: Chat Interface**
  - Design a beveled, high-density chat window.
  - Support "User" vs "AI" message bubbles in classic grey/blue theme.

### 3. Backend (Rust)
- [ ] **T06: Ollama Client**
  - Implement a basic HTTP client in `lib.rs` to talk to Ollama.
- [ ] **T07: Semantic Search Command**
  - Create `search_catalog_semantic` command using vector similarity (operator `<=>`).

## Logical Decisions
- **D038**: Floating badge will use a distinct "AI Purple" glow to contrast with the standard grey/blue UI.
- **D039**: Semantic search will be an "Advanced" option in the main SearchBar.
