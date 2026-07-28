import Map from "ol/Map";
import Overlay from "ol/Overlay";
import View from "ol/View";
import { defaults as defaultControls } from "ol/control/defaults";
import TileLayer from "ol/layer/Tile";
import Projection from "ol/proj/Projection";
import XYZ from "ol/source/XYZ";
import TileGrid from "ol/tilegrid/TileGrid";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  continentBoundsToTileRange,
  TYRIA_MAX_ZOOM,
} from "../domain/coordinates";
import { appEvents } from "../domain/events";
import type { ContinentPoint, Heart, PlayerSnapshot } from "../domain/types";
import { QUEENSDALE } from "../data/queensdale";

interface MapCanvasProps {
  hearts: Heart[];
  completed: Set<number>;
  suggestedId: number | null;
  player: PlayerSnapshot;
  focusedHeart: Heart | null;
  onToggle: (heart: Heart, anchor: HTMLElement) => void;
}

interface HeartOverlay {
  overlay: Overlay;
  element: HTMLButtonElement;
}

const TYRIA_SIZE: ContinentPoint = [81920, 114688];
const TYRIA_EXTENT = [0, -TYRIA_SIZE[1], TYRIA_SIZE[0], 0];
const QUEENSDALE_EXTENT = [
  QUEENSDALE.bounds[0][0],
  -QUEENSDALE.bounds[1][1],
  QUEENSDALE.bounds[1][0],
  -QUEENSDALE.bounds[0][1],
];
const RESOLUTIONS = Array.from(
  { length: TYRIA_MAX_ZOOM + 1 },
  (_, zoom) => 2 ** (TYRIA_MAX_ZOOM - zoom),
);

const projection = new Projection({
  code: "GW2:CONTINENT",
  units: "pixels",
  extent: TYRIA_EXTENT,
});

const tileGrid = new TileGrid({
  extent: TYRIA_EXTENT,
  origin: [0, 0],
  resolutions: RESOLUTIONS,
  tileSize: 256,
});

function toMapCoordinate(point: ContinentPoint): [number, number] {
  return [point[0], -point[1]];
}

function queensdaleTileUrl(tileCoordinate: number[] | null | undefined) {
  if (!tileCoordinate) return undefined;
  const [zoom, x, y] = tileCoordinate;
  const allowed = continentBoundsToTileRange(QUEENSDALE.bounds, zoom);
  if (
    x < allowed.minX ||
    x > allowed.maxX ||
    y < allowed.minY ||
    y > allowed.maxY
  ) {
    return undefined;
  }
  return `https://tiles.guildwars2.com/1/1/${zoom}/${x}/${y}.jpg`;
}

function updateHeartElement(
  element: HTMLButtonElement,
  complete: boolean,
  suggested: boolean,
) {
  element.className = `map-heart ${complete ? "is-complete" : ""} ${suggested ? "is-suggested" : ""}`;
  element.textContent = complete ? "♥" : "♡";
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
  const mapRef = useRef<Map | null>(null);
  const heartOverlaysRef = useRef(new globalThis.Map<number, HeartOverlay>());
  const playerOverlayRef = useRef<Overlay | null>(null);
  const playerElementRef = useRef<HTMLDivElement | null>(null);
  const [following, setFollowing] = useState(false);
  const [headingUp, setHeadingUp] = useState(false);
  const playerAvailable = player.connected && player.position !== null;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const tileSource = new XYZ({
      projection,
      tileGrid,
      tileUrlFunction: queensdaleTileUrl,
      wrapX: false,
      transition: 180,
      attributions: "Map tiles © ArenaNet",
    });
    const map = new Map({
      target: containerRef.current,
      controls: defaultControls({ rotate: false }),
      layers: [new TileLayer({ source: tileSource, preload: 0 })],
      view: new View({
        projection,
        center: toMapCoordinate(QUEENSDALE.center),
        extent: QUEENSDALE_EXTENT,
        resolutions: RESOLUTIONS,
        zoom: 4,
        minZoom: 4,
        maxZoom: TYRIA_MAX_ZOOM,
        constrainResolution: true,
      }),
    });
    map.getView().fit(QUEENSDALE_EXTENT, {
      padding: [28, 28, 108, 28],
      nearest: true,
    });
    map.on("pointerdrag", () => {
      setFollowing(false);
      setHeadingUp(false);
      map.getView().setRotation(0);
    });
    mapRef.current = map;

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const activeIds = new Set(hearts.map((heart) => heart.id));

    for (const [id, heartOverlay] of heartOverlaysRef.current) {
      if (!activeIds.has(id)) {
        map.removeOverlay(heartOverlay.overlay);
        heartOverlaysRef.current.delete(id);
      }
    }

    for (const heart of hearts) {
      let heartOverlay = heartOverlaysRef.current.get(heart.id);
      if (!heartOverlay) {
        const shell = document.createElement("div");
        shell.className = "map-icon-shell";
        const element = document.createElement("button");
        element.type = "button";
        element.title = `Level ${heart.level} · ${heart.name}`;
        element.ariaLabel = `${heart.name}, level ${heart.level}`;
        element.addEventListener("click", () => onToggle(heart, element));
        shell.append(element);
        const overlay = new Overlay({
          element: shell,
          positioning: "center-center",
          position: toMapCoordinate(heart.coordinate),
          stopEvent: true,
        });
        map.addOverlay(overlay);
        heartOverlay = { element, overlay };
        heartOverlaysRef.current.set(heart.id, heartOverlay);
      }
      updateHeartElement(
        heartOverlay.element,
        completed.has(heart.id),
        suggestedId === heart.id,
      );
    }
  }, [completed, hearts, onToggle, suggestedId]);

  useEffect(
    () =>
      appEvents.on("heart:completed", ({ heartId }) => {
        window.setTimeout(() => {
          const element = heartOverlaysRef.current.get(heartId)?.element;
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
    const location = toMapCoordinate(player.position);

    if (!playerOverlayRef.current) {
      const shell = document.createElement("div");
      shell.className = "map-icon-shell";
      const element = document.createElement("div");
      element.className = "player-marker";
      element.innerHTML = "<span></span>";
      shell.append(element);
      playerElementRef.current = element;
      playerOverlayRef.current = new Overlay({
        element: shell,
        position: location,
        positioning: "center-center",
        stopEvent: false,
      });
      map.addOverlay(playerOverlayRef.current);
    } else {
      playerOverlayRef.current.setPosition(location);
    }

    if (following) map.getView().setCenter(location);
    if (headingUp) map.getView().setRotation(-(player.heading ?? 0));
    playerElementRef.current?.style.setProperty(
      "--heading",
      `${headingUp ? 0 : (player.heading ?? 0)}rad`,
    );
  }, [following, headingUp, player]);

  useEffect(() => {
    if (!focusedHeart) return;
    const map = mapRef.current;
    if (!map) return;
    setFollowing(false);
    setHeadingUp(false);
    map.getView().animate({
      center: toMapCoordinate(focusedHeart.coordinate),
      rotation: 0,
      zoom: TYRIA_MAX_ZOOM,
      duration: 550,
    });
  }, [focusedHeart]);

  const toggleFollowing = useCallback(() => {
    if (!player.position) return;
    const next = !following;
    setFollowing(next);
    if (!next) {
      setHeadingUp(false);
      mapRef.current?.getView().animate({ rotation: 0, duration: 250 });
      return;
    }
    mapRef.current?.getView().animate({
      center: toMapCoordinate(player.position),
      duration: 300,
    });
  }, [following, player.position]);

  const toggleHeadingUp = useCallback(() => {
    if (!player.position) return;
    const next = !headingUp;
    setHeadingUp(next);
    if (next) {
      setFollowing(true);
      mapRef.current?.getView().animate({
        center: toMapCoordinate(player.position),
        rotation: -(player.heading ?? 0),
        duration: 300,
      });
    } else {
      mapRef.current?.getView().animate({ rotation: 0, duration: 300 });
    }
  }, [headingUp, player.heading, player.position]);

  return (
    <>
      <div
        className="map-canvas"
        ref={containerRef}
        aria-label="Interactive map of Queensdale"
      />
      <div className="player-controls" aria-label="Player tracking controls">
        <button
          className={following ? "is-active" : ""}
          disabled={!playerAvailable}
          onClick={toggleFollowing}
          aria-pressed={following}
          title={following ? "Stop following player" : "Focus and follow player"}
        >
          <span aria-hidden="true">⌖</span>
          <small>{following ? "Following" : "Follow"}</small>
        </button>
        <button
          className={headingUp ? "is-active" : ""}
          disabled={!playerAvailable}
          onClick={toggleHeadingUp}
          aria-pressed={headingUp}
          title={headingUp ? "Keep north up" : "Keep player direction up"}
        >
          <span className="heading-icon" aria-hidden="true">↑</span>
          <small>{headingUp ? "Heading up" : "North up"}</small>
        </button>
      </div>
    </>
  );
}
