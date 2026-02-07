<!--
  Sync Impact Report
  Version change: 0.0.0 → 1.0.0 (initial constitution creation)
  Added principles:
    - I. User-First Simplicity
    - II. Test-First Development
    - III. Data Integrity & Privacy
    - IV. Progressive Enhancement
  Added sections:
    - Technology Stack
    - Development Workflow
    - Governance
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ compatible (Constitution Check section aligns)
    - .specify/templates/spec-template.md ✅ compatible (user stories + requirements align)
    - .specify/templates/tasks-template.md ✅ compatible (phase structure aligns)
  Follow-up TODOs: none
-->

# Szafat Constitution

## Core Principles

### I. User-First Simplicity

Every feature MUST serve a clear household use case. The primary user is a non-technical person managing everyday items at home. Interfaces MUST be intuitive enough to use without documentation. Adding an item to the catalog MUST take fewer than 3 taps/clicks. Search MUST return results in under 1 second for collections up to 10,000 items. No feature ships without answering: "Would my family actually use this daily?"

### II. Test-First Development

All new features MUST have tests written before implementation code. The Red-Green-Refactor cycle is strictly enforced: write a failing test, make it pass with minimal code, then refactor. Unit tests cover models and services. Integration tests cover API endpoints and database operations. End-to-end tests cover critical user journeys (add item, find item, move item). Test coverage for business logic MUST remain above 80%.

### III. Data Integrity & Privacy

All household inventory data MUST be stored locally-first — the user's data belongs to the user. No telemetry or analytics without explicit opt-in consent. Database operations MUST be atomic: partial writes are never acceptable (e.g., moving an item between locations MUST not lose the item). All item locations MUST be consistent — an item cannot exist in two places simultaneously unless explicitly marked as "split quantity." Backups MUST be exportable in a standard format (JSON or CSV).

### IV. Progressive Enhancement

The application MUST work as a basic inventory list with zero configuration. Advanced features (barcode scanning, expiry tracking, sharing between household members) MUST be additive — disabling them MUST NOT break core functionality. The tech stack MUST support offline-first usage for common operations (search, browse, add items). New features MUST NOT increase initial page load time by more than 200ms.

## Technology Stack

**Frontend**: React with TypeScript — component-based UI with type safety.
**Backend**: Node.js with Express or Next.js API routes — JavaScript/TypeScript end-to-end for reduced context switching.
**Database**: SQLite (local-first) or PostgreSQL (if multi-user sync is needed) — lightweight for single-household, scalable if needed later.
**Testing**: Vitest for unit/integration tests, Playwright for E2E tests.
**Target Platform**: Progressive Web App (PWA) — works on mobile browsers and desktops without app store dependency.
**Language**: TypeScript throughout — strict mode enabled, no `any` types in production code.

## Development Workflow

All work follows the Specify workflow: Constitution → Specification → Plan → Tasks → Implementation.
Every feature starts as a specification document before any code is written.
Feature branches follow the naming convention `###-feature-name` (e.g., `001-item-catalog`).
Commits MUST be atomic and descriptive — one logical change per commit.
Pull requests MUST reference the corresponding specification and pass all CI checks before merge.
Code reviews MUST verify compliance with this constitution's principles.
The `main` branch MUST always be deployable.

## Governance

This constitution is the highest authority for project decisions. When a proposed feature or implementation conflicts with these principles, the principles win. Amendments to this constitution require: a written proposal documenting the change and rationale, a version bump following semantic versioning (MAJOR for principle removal/redefinition, MINOR for additions, PATCH for clarifications), and an update to all dependent templates and documentation. Compliance with these principles MUST be verified during code review. Complexity beyond what the principles allow MUST be justified in writing (see Complexity Tracking in plan template).

**Version**: 1.0.0 | **Ratified**: 2026-02-07 | **Last Amended**: 2026-02-07
