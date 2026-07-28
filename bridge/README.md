# Zenith local bridge

The bridge is deliberately loopback-only and emits a small, normalized WebSocket
contract. The current milestone ships a moving Queensdale simulator so the UI and
reconnect behavior can be developed without Guild Wars 2 running.

The native MumbleLink reader is the next bridge adapter. It will replace the
simulator as a snapshot source without changing the browser contract:

```json
{
  "type": "player",
  "sequence": 42,
  "connected": true,
  "mapId": 15,
  "position": [43728.4, 28589.9],
  "heading": 1.2,
  "characterName": "Example",
  "timestamp": "2026-07-27T00:00:00.000Z",
  "source": "mumblelink"
}
```

Security boundaries:

- bind only to `127.0.0.1`;
- accept browser clients only from localhost origins;
- expose normalized telemetry, never raw shared-memory buffers;
- never send input to the game.
