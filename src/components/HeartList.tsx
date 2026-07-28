import type { Heart } from "../domain/types";

interface HeartListProps {
  hearts: Heart[];
  completed: Set<number>;
  suggestedId: number | null;
  onSelect: (heart: Heart) => void;
  onToggle: (heart: Heart, anchor: HTMLElement) => void;
}

export function HeartList({
  hearts,
  completed,
  suggestedId,
  onSelect,
  onToggle,
}: HeartListProps) {
  return (
    <ol className="heart-list">
      {hearts.map((heart) => {
        const isComplete = completed.has(heart.id);
        return (
          <li
            className={`${isComplete ? "is-complete" : ""} ${suggestedId === heart.id ? "is-suggested" : ""}`}
            key={heart.id}
          >
            <button className="heart-copy" onClick={() => onSelect(heart)}>
              <span className="heart-level">{heart.level}</span>
              <span>
                <strong>{heart.name}</strong>
                <small>{isComplete ? "Complete" : suggestedId === heart.id ? "Suggested next" : "Queensdale"}</small>
              </span>
            </button>
            <button
              className="heart-toggle"
              aria-label={`${isComplete ? "Mark incomplete" : "Mark complete"}: ${heart.name}`}
              aria-pressed={isComplete}
              onClick={(event) => onToggle(heart, event.currentTarget)}
            >
              {isComplete ? "✓" : "♡"}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
