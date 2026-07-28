#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
zig_bin="${ZIG:-zig}"
source_file="$repo_dir/bridge/proton/relay.c"
output_dir="$repo_dir/bridge/proton/bin"
output_file="$output_dir/zenith-mumble-relay.exe"

if ! command -v "$zig_bin" >/dev/null 2>&1 && [[ ! -x "$zig_bin" ]]; then
  echo "Zig 0.15 or newer is required. Set ZIG=/path/to/zig if needed." >&2
  exit 1
fi

mkdir -p "$output_dir"
"$zig_bin" cc \
  -target x86_64-windows-gnu \
  -Os \
  -s \
  "$source_file" \
  -o "$output_file" \
  -lws2_32

echo "Built $output_file"
