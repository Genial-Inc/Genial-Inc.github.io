#!/usr/bin/env bash
# Fetches the parts of the website that live in other repositories and are NOT committed here:
#
#   contact  the contact form, from edemit/lcamapp (branch "ergonomie") -> static/contact/
#   bubble   the Genial Bubble web build (GitHub release asset)         -> static/play/genial-bubble/
#
# The GitHub Actions workflow runs it before building. Run it locally before `hugo server`
# if you want to preview these pages:
#
#   ./scripts/fetch-external.sh            # everything
#   ./scripts/fetch-external.sh contact    # only the contact form
#
# Sources can be overridden with environment variables (see below).
set -euo pipefail

CONTACT_FORM_REPO="${CONTACT_FORM_REPO:-https://github.com/edemit/lcamapp.git}"
CONTACT_FORM_REF="${CONTACT_FORM_REF:-ergonomie}"
GENIAL_BUBBLE_URL="${GENIAL_BUBBLE_URL:-https://github.com/Genial-Inc/Genial-Bubble/releases/download/0.1/web-build.zip}"

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
static_dir="$root/static"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

fetch_contact_form() {
  echo "Contact form: $CONTACT_FORM_REPO ($CONTACT_FORM_REF)"
  local repo="$tmp_dir/contact-form"
  git clone --quiet --depth 1 --branch "$CONTACT_FORM_REF" --filter=blob:none --sparse \
    "$CONTACT_FORM_REPO" "$repo"
  git -C "$repo" sparse-checkout set contact

  # The form lives in the "contact/" folder of the repository and uses absolute
  # "/contact/..." paths, so it must be served at /contact/.
  if [[ ! -f "$repo/contact/index.html" ]]; then
    echo "error: contact/index.html not found in $CONTACT_FORM_REPO ($CONTACT_FORM_REF)" >&2
    exit 1
  fi

  rm -rf "$static_dir/contact"
  mkdir -p "$static_dir"
  cp -R "$repo/contact" "$static_dir/contact"
  echo "  -> static/contact/ (commit $(git -C "$repo" rev-parse --short HEAD))"
}

fetch_genial_bubble() {
  echo "Genial Bubble web build: $GENIAL_BUBBLE_URL"
  curl --fail --silent --show-error --location --retry 3 \
    --output "$tmp_dir/genial-bubble.zip" "$GENIAL_BUBBLE_URL"
  unzip -q "$tmp_dir/genial-bubble.zip" -d "$tmp_dir/genial-bubble"

  # The release archive contains a top-level "web-build/" folder.
  local source="$tmp_dir/genial-bubble/web-build"
  [[ -d "$source" ]] || source="$tmp_dir/genial-bubble"

  rm -rf "$static_dir/play/genial-bubble"
  mkdir -p "$static_dir/play"
  cp -R "$source" "$static_dir/play/genial-bubble"
  echo "  -> static/play/genial-bubble/"
}

case "${1:-all}" in
  contact) fetch_contact_form ;;
  bubble) fetch_genial_bubble ;;
  all)
    fetch_contact_form
    fetch_genial_bubble
    ;;
  *)
    echo "usage: $0 [all|contact|bubble]" >&2
    exit 2
    ;;
esac
