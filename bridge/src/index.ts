import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";

interface PlayerSnapshot {
  type: "player";
  sequence: number;
  connected: boolean;
  mapId: number;
  position: readonly [number, number];
  heading: number;
  characterName: string;
  timestamp: string;
  source: "mock";
}

const HOST = "127.0.0.1";
const PORT = 38421;
const MOCK_ROUTE = [
  [43728.4, 28589.9],
  [43244.7, 28723.5],
  [42822.6, 28780],
  [44087.8, 29386.4],
  [43550.7, 30028],
  [44063.9, 29886.6],
] as const;

function interpolateRoute(elapsedSeconds: number) {
  const legDuration = 8;
  const leg = Math.floor(elapsedSeconds / legDuration) % MOCK_ROUTE.length;
  const nextLeg = (leg + 1) % MOCK_ROUTE.length;
  const progress = (elapsedSeconds % legDuration) / legDuration;
  const from = MOCK_ROUTE[leg];
  const to = MOCK_ROUTE[nextLeg];
  const x = from[0] + (to[0] - from[0]) * progress;
  const y = from[1] + (to[1] - from[1]) * progress;
  return { position: [x, y] as const, heading: Math.atan2(to[0] - from[0], -(to[1] - from[1])) };
}

const server = new WebSocketServer({ host: HOST, port: PORT });
const startedAt = Date.now();
let sequence = 0;

function broadcast(socket?: WebSocket) {
  const elapsedSeconds = (Date.now() - startedAt) / 1000;
  const route = interpolateRoute(elapsedSeconds);
  const message: PlayerSnapshot = {
    type: "player",
    sequence: sequence++,
    connected: true,
    mapId: 15,
    position: route.position,
    heading: route.heading,
    characterName: "Demo Wayfinder",
    timestamp: new Date().toISOString(),
    source: "mock",
  };
  const payload = JSON.stringify(message);
  if (socket) socket.send(payload);
  else {
    for (const client of server.clients) {
      if (client.readyState === client.OPEN) client.send(payload);
    }
  }
}

server.on("connection", (socket, request) => {
  if (request.headers.origin && !/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(request.headers.origin)) {
    socket.close(1008, "Local origins only");
    return;
  }
  broadcast(socket);
});

const timer = setInterval(() => broadcast(), 100);

function shutdown() {
  clearInterval(timer);
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(`Zenith bridge demo listening on ws://${HOST}:${PORT}`);
