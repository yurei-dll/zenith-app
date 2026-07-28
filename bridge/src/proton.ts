import { spawn, type ChildProcess } from "node:child_process";
import { createSocket } from "node:dgram";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  parseProtonPacket,
  protonPacketToSnapshot,
} from "./proton-packet.js";
import type { TelemetrySource } from "./types.js";

const RELAY_PORT = 38423;
const RELAY_TIMEOUT_MS = 1_000;
const launcherPath = fileURLToPath(
  new URL("../../scripts/launch-proton-relay.sh", import.meta.url),
);

export async function createProtonSource(): Promise<TelemetrySource> {
  const socket = createSocket("udp4");
  let launcher: ChildProcess | null = null;
  let lastPacketAt = 0;
  let latest: ReturnType<TelemetrySource["read"]> = {
    connected: false,
    mapId: null,
    position: null,
    heading: null,
    characterName: null,
  };

  socket.on("message", (message, remote) => {
    if (remote.address !== "127.0.0.1" && remote.address !== "::ffff:127.0.0.1") return;
    try {
      latest = protonPacketToSnapshot(parseProtonPacket(message));
      lastPacketAt = Date.now();
    } catch {
      // Ignore malformed or mismatched protocol packets.
    }
  });
  await new Promise<void>((resolve, reject) => {
    socket.once("error", reject);
    socket.bind(RELAY_PORT, "127.0.0.1", () => {
      socket.off("error", reject);
      resolve();
    });
  });

  if (existsSync(launcherPath)) {
    launcher = spawn(launcherPath, [], {
      stdio: ["ignore", "inherit", "inherit"],
      detached: false,
    });
    launcher.on("error", (error) => {
      console.warn(`Could not launch Proton relay: ${error.message}`);
    });
  }

  return {
    kind: "mumblelink",
    read() {
      if (Date.now() - lastPacketAt > RELAY_TIMEOUT_MS) {
        return { ...latest, connected: false };
      }
      return latest;
    },
    close() {
      launcher?.kill("SIGTERM");
      socket.close();
    },
  };
}
