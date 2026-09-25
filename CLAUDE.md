# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Configuration

- **Language**: TypeScript (strict mode)
- **Package Manager**: yarn (v4 — use `yarn`, never `npm` or `pnpm`)
- **Framework**: SvelteKit 2 + Svelte 5 with runes mode enabled globally
- **Deployment**: Cloudflare Pages (`@sveltejs/adapter-cloudflare`)

---

## Commands

```bash
yarn dev           # Start dev server (localhost:5173)
yarn build         # Production build
yarn preview       # Preview production build

yarn check         # Type-check with svelte-check
yarn check:watch   # Watch mode type checking
yarn lint          # prettier --check
yarn format        # prettier --write
```

There are no test commands configured yet.

---

## Architecture

Standard SvelteKit file-based routing under `src/routes/`. Shared code lives in `src/lib/` and is importable via the `$lib` alias.

**Key conventions:**

- Svelte 5 runes are enabled globally (`$state`, `$derived`, `$effect`, `$props`, etc.) — use rune syntax, not the legacy Options API
- 2-space indentation, single quotes, trailing commas (ES5), semicolons, 100-char line width (enforced by Prettier)

---

## Svelte MCP Tools

You have access to the Svelte MCP server with comprehensive Svelte 5 and SvelteKit documentation.

### Usage workflow (required):

1. **`list-sections`** — Call this FIRST when working on any Svelte/SvelteKit topic to discover relevant documentation sections
2. **`get-documentation`** — After listing sections, fetch ALL sections relevant to the task (analyze the `use_cases` field to decide)
3. **`svelte-autofixer`** — Run on ALL Svelte code before sending to the user; keep calling until no issues remain
4. **`playground-link`** — Only generate after explicit user confirmation; NEVER call if code was written to project files
