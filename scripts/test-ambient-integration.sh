#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
SUFFIX=$$
NETWORK="eren-isik-ambient-test-${SUFFIX}"
MOCK_CONTAINER="eren-isik-ambient-mock-${SUFFIX}"
APP_CONTAINER="eren-isik-ambient-app-${SUFFIX}"
APP_IMAGE="${AMBIENT_TEST_IMAGE:-eren-isik-lab-frontend:latest}"

cleanup() {
  docker rm -f "$APP_CONTAINER" "$MOCK_CONTAINER" >/dev/null 2>&1 || true
  docker network rm "$NETWORK" >/dev/null 2>&1 || true
}

trap cleanup EXIT INT TERM

docker network create "$NETWORK" >/dev/null

docker run -d \
  --name "$MOCK_CONTAINER" \
  --network "$NETWORK" \
  --read-only \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --volume "$ROOT_DIR/tests/ambient-mock.mjs:/app/mock.mjs:ro" \
  node:22-alpine \
  node /app/mock.mjs >/dev/null

docker run -d \
  --name "$APP_CONTAINER" \
  --network "$NETWORK" \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=64m \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --env "AMBIENT_WEATHER_ENDPOINT=http://${MOCK_CONTAINER}:4000/v1/forecast" \
  "$APP_IMAGE" >/dev/null

docker run --rm \
  --network "$NETWORK" \
  --read-only \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --volume "$ROOT_DIR/tests/ambient-probe.mjs:/app/probe.mjs:ro" \
  node:22-alpine \
  node /app/probe.mjs "http://${APP_CONTAINER}:3000"
