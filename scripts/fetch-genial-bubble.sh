#!/usr/bin/env bash
set -euo pipefail

release_url="https://github.com/Genial-Inc/Genial-Bubble/releases/download/0.1/web-build.zip"
target_dir="static/play/genial-bubble"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

curl --fail --location --retry 3 --output "$tmp_dir/web-build.zip" "$release_url"
unzip -q "$tmp_dir/web-build.zip" -d "$tmp_dir/extracted"

source_dir="$tmp_dir/extracted/web-build"
if [[ ! -d "$source_dir" ]]; then
    printf 'Expected directory not found in the Genial Bubble release archive: %s\n' "$source_dir" >&2
    exit 1
fi

mkdir -p "$target_dir"
cp -a "$source_dir"/. "$target_dir"/
printf 'Genial Bubble web build installed in %s\n' "$target_dir"
