#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
relay_exe="$repo_dir/bridge/proton/bin/zenith-mumble-relay.exe"

if [[ ! -f "$relay_exe" ]]; then
  echo "Zenith Proton relay is not built: $relay_exe" >&2
  echo "Run scripts/build-proton-relay.sh with Zig 0.15+ installed." >&2
  exit 1
fi

gw2_pid=""
waiting_reported=0
while [[ -z "$gw2_pid" ]]; do
  for process_dir in /proc/[0-9]*; do
    command_line="$(tr '\0' ' ' < "$process_dir/cmdline" 2>/dev/null || true)"
    if [[ "$command_line" == *"Gw2-64.exe"* ]] &&
      tr '\0' '\n' < "$process_dir/environ" 2>/dev/null |
        grep -q '^WINEPREFIX='; then
        gw2_pid="${process_dir##*/}"
        break
    fi
  done
  if [[ -z "$gw2_pid" ]]; then
    if [[ "$waiting_reported" -eq 0 ]]; then
      echo "Zenith Proton relay is waiting for Guild Wars 2 to start." >&2
      waiting_reported=1
    fi
    sleep 2
  fi
done

read_process_var() {
  local name="$1"
  tr '\0' '\n' < "/proc/$gw2_pid/environ" |
    sed -n "s/^${name}=//p" |
    head -n 1
}

wine_prefix="$(read_process_var WINEPREFIX)"
wine_loader="$(read_process_var WINELOADER)"
wine_esync="$(read_process_var WINEESYNC)"
wine_fsync="$(read_process_var WINEFSYNC)"

if [[ -z "$wine_prefix" || -z "$wine_loader" || ! -x "$wine_loader" ]]; then
  echo "Could not resolve WINEPREFIX/WINELOADER from GW2 process $gw2_pid." >&2
  exit 1
fi

echo "Launching Zenith MumbleLink relay in GW2 Proton prefix: $wine_prefix" >&2
exec env \
  WINEPREFIX="$wine_prefix" \
  WINELOADER="$wine_loader" \
  WINEESYNC="${wine_esync:-0}" \
  WINEFSYNC="${wine_fsync:-0}" \
  WINEDEBUG="${WINEDEBUG:--all}" \
  "$wine_loader" "$relay_exe"
