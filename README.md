# Zenith

A local-first Guild Wars 2 map-completion companion. Zenith pairs ArenaNet's
official world-map tiles with read-only MumbleLink telemetry, then helps the
player choose and track objectives without automating game input.

## First milestone

- one polished Queensdale map;
- all 17 renown-heart markers from the public GW2 API;
- a moving player marker over a normalized localhost WebSocket contract;
- manual completion toggles with local persistence;
- event-driven confetti, heart bounce, completion toast, and next-objective pulse;
- reduced-motion behavior;
- responsive desktop and compact layouts.

The current bridge uses a simulator so the complete browser experience works on
any development machine. Its normalized contract is ready for a native Windows
MumbleLink adapter.

## Run it

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:5173>. `npm run dev` starts both the Vite app and the
loopback-only demo bridge at `ws://127.0.0.1:38421`.

```bash
npm test
npm run check
npm run build
```

## Architecture

```text
GW2 MumbleLink shared memory
          │ read-only
          ▼
local bridge / snapshot adapter ── ws://127.0.0.1:38421
                                      │ normalized PlayerSnapshot
                                      ▼
React state ── Leaflet map ── completion store (localStorage)
                   │
                   └── explicit domain events ── celebration effects
```

Celebrations subscribe to `heart:completed` domain events. They are not React
render side effects, so Strict Mode, reconnects, and ordinary rerenders cannot
replay confetti.

Coordinate conventions live in `src/domain/coordinates.ts`. The tile layer and
API markers use continent coordinates. Mumble avatar coordinates are meters and
must first become game/event-coordinate inches before applying a map's
`map_rect` → `continent_rect` transform. Recent GW2 Mumble context also exposes
continent `playerX`/`playerY`, which the native adapter can prefer when valid.

The map uses each zone's `continent_rect` as both its movement boundary and tile
layer boundary. World wrapping is disabled and Leaflet keeps only a one-tile
offscreen buffer. At zoom 4 Queensdale intersects 6 tiles; even at maximum zoom
it intersects only 150, while the browser requests just the visible subset.

## Data and attribution

Queensdale metadata is a small checked-in fixture sourced from the unauthenticated
Guild Wars 2 API. Map imagery is loaded at runtime from ArenaNet's official tile
service and attributed in the UI.

Guild Wars 2 and all associated content are © ArenaNet. Zenith is an unofficial
fan project and is not affiliated with or endorsed by ArenaNet.
