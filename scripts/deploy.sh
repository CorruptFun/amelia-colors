#!/usr/bin/env bash
# Deploy Amelia Colors to GitHub Pages → https://corruptfun.github.io/amelia-colors/
#
# Bumps the service-worker CACHE_VERSION (so anyone with it installed gets the
# "New version ready → REFRESH" nudge), then commits everything and pushes to main.
# GitHub Pages redeploys automatically on push (~1 min).
#
# Usage:
#   scripts/deploy.sh "Your commit message"
#   scripts/deploy.sh                 # uses a default message
#
# Note: pushing to main IS the deploy. Make sure the working tree is what you want live.

set -euo pipefail
cd "$(dirname "$0")/.."

MSG="${1:-Deploy: ship latest build}"
STAMP="$(date +%Y%m%d-%H%M%S)"

# 1) Bump CACHE_VERSION → sw.js changes → browsers detect an update → the nudge fires.
if grep -q 'const CACHE_VERSION' sw.js 2>/dev/null; then
  sed -i.bak -E "s/const CACHE_VERSION *= *\"[^\"]*\";/const CACHE_VERSION = \"${STAMP}\";/" sw.js
  rm -f sw.js.bak
  echo "→ sw.js CACHE_VERSION = ${STAMP}"
else
  echo "⚠ sw.js / CACHE_VERSION not found — skipping version bump."
fi

# 2) Stamp every asset URL. GitHub Pages serves assets with max-age=600, so
#    without this a shipped fix can sit invisible on a device for ten minutes —
#    and longer once a service worker has the old copy precached. Versioned URLs
#    simply cannot be stale: a new index.html asks for URLs nothing has cached.
#    index.html and sw.js must move together or the precache misses.
sed -i.bak -E "s/\?v=[A-Za-z0-9-]+\"/?v=${STAMP}\"/g" index.html
sed -i.bak -E "s/const ASSET_VERSION *= *\"[^\"]*\";/const ASSET_VERSION = \"${STAMP}\";/" sw.js
rm -f index.html.bak sw.js.bak
STAMPED="$(grep -c "?v=${STAMP}\"" index.html || true)"
echo "→ stamped ${STAMPED} asset URLs in index.html + sw.js ASSET_VERSION"
if [ "${STAMPED}" -lt 10 ]; then
  echo "✗ expected 11 stamped asset URLs, found ${STAMPED} — aborting before a half-versioned deploy."
  exit 1
fi

# 3) Integrate anything pushed since we last pulled, then ship.
git add -A
if git diff --cached --quiet; then
  echo "Nothing to commit — working tree clean. Aborting."
  exit 0
fi
git commit -m "${MSG}"
git pull --rebase --autostash
git push

echo ""
echo "✅ Pushed to main. GitHub Pages will rebuild shortly:"
echo "   https://corruptfun.github.io/amelia-colors/"
