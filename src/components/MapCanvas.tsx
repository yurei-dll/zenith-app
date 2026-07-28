import L from "leaflet";
import { useEffect, useRef } from "react";
import { continentToLeaflet } from "../domain/coordinates";
import { appEvents } from "../domain/events";
import type { Heart, PlayerSnapshot } from "../domain/types";
import { QUEENSDALE } from "../data/queensdale";

interface MapCanvasProps {
  hearts: Heart[];
  completed: Set<number>;
  suggestedId: number | null;
  player: PlayerSnapshot;
  focusedHeart: Heart | null;
  onToggle: (heart: Heart, anchor: HTMLElement) => void;
}

function heartIcon(complete: boolean, suggested: boolean) {
  return L.divIcon({
    className: "map-icon-shell",
    html: `<button class="map-heart ${complete ? "is-complete" : ""} ${suggested ? "is-suggested" : ""}" aria-label="Heart objective">${complete ? "♥" : "♡"}</button>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export function MapCanvas({
  hearts,
  completed,
  suggestedId,
  player,
  focusedHeart,
  onToggle,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heartMarkersRef = useRef(new Map<number, L.Marker>());
  const playerMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const bounds = L.latLngBounds(
      continentToLeaflet(QUEENSDALE.bounds[0]),
      continentToLeaflet(QUEENSDALE.bounds[1]),
    );
    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: 4,
      maxZoom: 7,
      zoomControl: false,
      attributionControl: true,
      maxBounds: bounds.pad(0.2),
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://tiles.guildwars2.com/1/1/{z}/{x}/{y}.jpg", {
      minZoom: 0,
      maxZoom: 7,
      bounds,
      attribution: "Map tiles © ArenaNet",
    }).addTo(map);
    map.fitBounds(bounds);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const activeIds = new Set(hearts.map((heart) => heart.id));
    for (const [id, marker] of heartMarkersRef.current) {
      if (!activeIds.has(id)) {
        marker.remove();
        heartMarkersRef.current.delete(id);
      }
    }
    for (const heart of hearts) {
      let marker = heartMarkersRef.current.get(heart.id);
      if (!marker) {
        marker = L.marker(continentToLeaflet(heart.coordinate))
          .addTo(map)
          .bindTooltip(`<strong>Level ${heart.level}</strong><br>${heart.name}`, {
            direction: "top",
          });
        marker.on("click", (event) => {
          const element = event.originalEvent?.target as HTMLElement | undefined;
          if (element) onToggle(heart, element);
        });
        heartMarkersRef.current.set(heart.id, marker);
      }
      marker.setIcon(heartIcon(completed.has(heart.id), suggestedId === heart.id));
    }
  }, [completed, hearts, onToggle, suggestedId]);

  useEffect(
    () =>
      appEvents.on("heart:completed", ({ heartId }) => {
        window.setTimeout(() => {
          const element = heartMarkersRef.current
            .get(heartId)
            ?.getElement()
            ?.querySelector<HTMLElement>(".map-heart");
          if (!element) return;
          element.classList.remove("heart-bounce");
          void element.offsetWidth;
          element.classList.add("heart-bounce");
          window.setTimeout(() => element.classList.remove("heart-bounce"), 600);
        });
      }),
    [],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !player.position) return;
    const location = continentToLeaflet(player.position);
    if (!playerMarkerRef.current) {
      playerMarkerRef.current = L.marker(location, {
        zIndexOffset: 1000,
        icon: L.divIcon({
          className: "map-icon-shell",
          html: '<div class="player-marker"><span></span></div>',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        }),
      }).addTo(map);
    } else playerMarkerRef.current.setLatLng(location);
    const element = playerMarkerRef.current.getElement()?.querySelector<HTMLElement>(".player-marker");
    if (element) element.style.setProperty("--heading", `${player.heading ?? 0}rad`);
  }, [player]);

  useEffect(() => {
    if (focusedHeart) {
      mapRef.current?.flyTo(continentToLeaflet(focusedHeart.coordinate), 7, { duration: 0.6 });
      heartMarkersRef.current.get(focusedHeart.id)?.openTooltip();
    }
  }, [focusedHeart]);

  return <div className="map-canvas" ref={containerRef} aria-label="Interactive map of Queensdale" />;
}
