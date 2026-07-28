# Proton MumbleLink relay

Wine named file mappings live inside a wineserver namespace and are not
ordinary files a Linux process can safely discover under `/dev/shm`. Zenith
therefore uses a tiny Windows relay in the same Proton prefix as Guild Wars 2:

```text
Gw2-64.exe ── MumbleLink mapping ── zenith-mumble-relay.exe
                                          │
                                  UDP 127.0.0.1:38423
                                          │
                                          ▼
                                  native Zenith backend
```

The relay creates-or-opens the standard `MumbleLink` mapping, maps its own view
read-only, copies stable fields, and emits a fixed-size versioned packet over
loopback. It does not open the GW2 process, inject a DLL, install anything into
the prefix, write game memory, or accept inbound network traffic.

`scripts/launch-proton-relay.sh` discovers the running GW2 process through
`/proc`, inherits its exact `WINEPREFIX`, `WINELOADER`, `WINEFSYNC`, and
`WINEESYNC` settings, then starts the helper in the same wineserver. It supports
the official Steam AppID as well as non-Steam shortcuts because discovery is
process-based rather than hard-coded to one compatdata directory.

The checked-in x86-64 executable is built from `relay.c` with:

```bash
npm run build:proton-relay
```

This requires Zig 0.15 or newer. Set `ZIG=/absolute/path/to/zig` when it is not
on `PATH`.

Current binary SHA-256:

```text
2b36ee49ad05e9a3e5dff0671b4f86a11ac1bc3735c7091d983a937a83039ccd
```
