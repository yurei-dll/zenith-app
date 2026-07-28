import { useEffect, useState } from "react";
import { appEvents } from "../domain/events";

interface Burst {
  id: number;
  x: number;
  y: number;
}

const colors = ["#ffcf55", "#f171a3", "#7be0c3", "#e8f5a8", "#9d8cff"];

export function CompletionEffects() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(
    () =>
      appEvents.on("heart:completed", ({ heartId, markerPoint }) => {
        const id = Date.now() + heartId;
        setBursts((current) => [...current, { id, x: markerPoint.x, y: markerPoint.y }]);
        setToast("Heart complete — beautifully done.");
        window.setTimeout(
          () => setBursts((current) => current.filter((burst) => burst.id !== id)),
          900,
        );
        window.setTimeout(() => setToast(null), 2400);
      }),
    [],
  );

  return (
    <>
      {bursts.map((burst) => (
        <div
          className="confetti-burst"
          key={burst.id}
          style={{ left: burst.x, top: burst.y }}
          aria-hidden="true"
        >
          {colors.map((color, index) => (
            <i
              key={color}
              style={
                {
                  "--confetti-color": color,
                  "--confetti-angle": `${index * 72}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ))}
      <div className={`completion-toast ${toast ? "is-visible" : ""}`} role="status">
        <span>♥</span> {toast}
      </div>
    </>
  );
}
