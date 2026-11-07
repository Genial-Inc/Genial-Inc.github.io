#!/usr/bin/env bash
set -euo pipefail

repository="https://github.com/edemit/lcamapp.git"
branch="ergonomie"
target_dir="static/contact"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

printf 'Fetching contact form from %s (branch: %s)\n' "$repository" "$branch"
git clone --depth 1 --single-branch --branch "$branch" "$repository" "$tmp_dir/source"

# This branch is expected to contain the deployable static page at its root.
for file in index.html styles.css script.js; do
    if [[ ! -f "$tmp_dir/source/$file" ]]; then
        printf 'Expected %s at the root of %s (%s).\n' "$file" "$repository" "$branch" >&2
        printf 'Update this script if the upstream project changes its output structure.\n' >&2
        exit 1
    fi
done

rm -rf "$target_dir"
mkdir -p "$target_dir"
# Do not copy Git metadata into the Hugo static directory.
tar --exclude='.git' -C "$tmp_dir/source" -cf - . | tar -C "$target_dir" -xf -
printf 'Contact form installed in %s\n' "$target_dir"
