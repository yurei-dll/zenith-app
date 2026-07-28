import { useCallback, useMemo, useState } from "react";
import { CompletionEffects } from "./components/CompletionEffects";
import { HeartList } from "./components/HeartList";
import { MapCanvas } from "./components/MapCanvas";
import {
  QUEENSDALE,
  QUEENSDALE_HEARTS,
  QUEENSDALE_POIS,
} from "./data/queensdale";
import { appEvents } from "./domain/events";
import type { Heart, PointOfInterest } from "./domain/types";
import { useCompletion } from "./hooks/useCompletion";
import { usePlayerSocket } from "./hooks/usePlayerSocket";

function nearestIncompleteHeart(
  completed: Set<number>,
  position: readonly [number, number] | null,
) {
  const remaining = QUEENSDALE_HEARTS.filter((heart) => !completed.has(heart.id));
  if (!remaining.length) return null;
  if (!position) return remaining.sort((a, b) => a.level - b.level)[0];
  return remaining.reduce((nearest, heart) => {
    const distance = Math.hypot(heart.coordinate[0] - position[0], heart.coordinate[1] - position[1]);
    const nearestDistance = Math.hypot(nearest.coordinate[0] - position[0], nearest.coordinate[1] - position[1]);
    return distance < nearestDistance ? heart : nearest;
  });
}

export default function App() {
  const player = usePlayerSocket();
  const {
    completedHearts,
    completedPois,
    toggleHeart: persistHeart,
    togglePoi: persistPoi,
  } = useCompletion();
  const [focusedHeart, setFocusedHeart] = useState<Heart | null>(null);
  const suggested = useMemo(
    () => nearestIncompleteHeart(completedHearts, player.position),
    [completedHearts, player.position],
  );

  const toggleHeart = useCallback(
    (heart: Heart, anchor: HTMLElement) => {
      const becameCompleted = !completedHearts.has(heart.id);
      persistHeart(heart.id);
      if (becameCompleted) {
        const rect = anchor.getBoundingClientRect();
        anchor.classList.remove("heart-bounce");
        void anchor.offsetWidth;
        anchor.classList.add("heart-bounce");
        window.setTimeout(() => anchor.classList.remove("heart-bounce"), 600);
        appEvents.emit("heart:completed", {
          heartId: heart.id,
          markerPoint: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        });
      }
    },
    [completedHearts, persistHeart],
  );

  const togglePoi = useCallback(
    (poi: PointOfInterest) => persistPoi(poi.id),
    [persistPoi],
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Zenith home">
          <span className="brand-mark">Z</span>
          <span><strong>ZENITH</strong><small>Map completion companion</small></span>
        </a>
        <div className={`bridge-status ${player.connected ? "is-connected" : ""}`}>
          <i />
          <span>{player.connected ? `${player.source === "mock" ? "Demo trail" : "MumbleLink"} connected` : "Waiting for local bridge"}</span>
        </div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <div className="zone-heading">
            <span className="eyebrow">TYRIA · KRYTA</span>
            <h1>{QUEENSDALE.name}</h1>
            <p>A gentle path through every good deed.</p>
          </div>
          <div className="progress-card">
            <div>
              <span>HEARTS</span>
              <strong>{completedHearts.size}<small> / {QUEENSDALE_HEARTS.length}</small></strong>
            </div>
            <div className="progress-track">
              <i style={{ width: `${(completedHearts.size / QUEENSDALE_HEARTS.length) * 100}%` }} />
            </div>
          </div>
          <div className="list-heading">
            <h2>Renown hearts</h2>
            <span>{QUEENSDALE_HEARTS.length - completedHearts.size} remaining</span>
          </div>
          <HeartList
            hearts={QUEENSDALE_HEARTS}
            completed={completedHearts}
            suggestedId={suggested?.id ?? null}
            onSelect={setFocusedHeart}
            onToggle={toggleHeart}
          />
        </aside>

        <section className="map-panel">
          <MapCanvas
            hearts={QUEENSDALE_HEARTS}
            pois={QUEENSDALE_POIS}
            completedHearts={completedHearts}
            completedPois={completedPois}
            suggestedId={suggested?.id ?? null}
            player={player}
            focusedHeart={focusedHeart}
            onToggleHeart={toggleHeart}
            onTogglePoi={togglePoi}
          />
          <div className="map-wash" aria-hidden="true" />
          {suggested && (
            <button className="next-objective" onClick={() => setFocusedHeart(suggested)}>
              <span className="next-icon">♡</span>
              <span><small>SUGGESTED NEXT · LEVEL {suggested.level}</small><strong>{suggested.name}</strong></span>
              <span className="next-arrow">→</span>
            </button>
          )}
        </section>
      </section>
      <CompletionEffects />
    </main>
  );
}
