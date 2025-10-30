### PokéDex AI – Interactive Pokémon Knowledge Chat

An AI-assisted Pokédex built with Next.js 16 and React 19. Ask about any Pokémon—stats, evolutions, types, abilities, moves—and get concise, well-formatted answers. Includes fast typeahead search, keyboard shortcuts, and a modern chat UI.

### Highlights
- **Chat-first UX**: Clean docked/floating prompt with submit-on-select suggestions and results.
- **Fast search**: Edge runtime API for fuzzy, cached lookups over 1300+ Pokémon questions.
- **Rich UI kit**: Accessible components (Radix + custom `components/ui`) with Tailwind CSS v4.
- **React Query**: Data caching, devtools, and sensible defaults via `app/providers.tsx`.
- **Comments (client-side)**: Threaded comments stored in `localStorage` (API stubbed server-side).

### Tech Stack
- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS v4
- **UI/UX**: Radix Primitives, Lucide icons, custom components in `components/ui`
- **Animation**: `motion`
- **Data**: PokéAPI (`https://pokeapi.co/`), fetched and formatted in `lib/questions.ts`
- **State/Data**: @tanstack/react-query

### Project Structure
- `app/page.tsx`: Landing page (`Hero`, `UnderTheHood`)
- `app/chat/page.tsx`: Chat page (SSR fetch of initial questions)
- `app/api/search/route.ts`: Edge search endpoint with fuzzy ranking and caching
- `app/api/comments/route.ts`: Stub API (returns 501; comments are client-only)
- `components/chat/*`: Chat UI (prompt, conversation, results, shortcuts)
- `components/ai-elements/*`: Rendering for AI/message primitives (code blocks, images, sources, etc.)
- `components/comments/*`: LocalStorage-backed comments UI
- `lib/questions.ts`: Efficient PokéAPI fetching, caching, formatting, and evolution chain rendering

### Requirements
- Node 18+ (recommended 20+)
- Bun (preferred)

### Getting Started (Bun)
```bash
# install deps
bun install

# run dev server
bun run dev

# build for production
bun run build

# start production server
bun run start

# lint
bun run lint
```

Open `http://localhost:3000` in your browser.

### Features in Detail
- **Search as you type**: `app/api/search/route.ts` runs on the Edge, returns top matches based on exact/contains/word-start scoring. Titles are generated and cached via `fetchServerQuestionTitles` in `lib/questions.ts`.
- **Prompt experience**: `components/chat/prompt-section.tsx` supports suggestions, keyboard shortcuts hint (`Ctrl + /`), screen-reader text, and auto-submit when selecting a suggestion/result.
- **Initial data hydration**: `app/chat/page.tsx` calls `fetchServerQuestions(1300)` once server-side to hydrate the chat with precomputed Q&A from PokéAPI.
- **Comments**: Implemented entirely client-side (see `components/comments/*`); server endpoints are explicit stubs with 501 responses.

### Environment Variables
None required for local development. External data is fetched from PokéAPI.

### Accessibility & Performance
- Semantic UI patterns, focus management, and ARIA labels in chat input/results
- Edge runtime for low-latency search; React Query caching and long `staleTime` defaults

### Notes
- This is an assessment project; APIs under `app/api/comments` are intentionally not persistent.
- If PokéAPI rate limits, wait and retry; data fetching is cached with `force-cache` and `revalidate` hints.

### License
MIT
