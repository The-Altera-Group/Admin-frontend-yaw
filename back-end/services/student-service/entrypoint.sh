#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '[entrypoint] %s\n' "$*"
}

POSTGRES_HOST=${POSTGRES_HOST:-postgres}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_DB=${POSTGRES_DB:-oais-student-service}
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-NewPost}
EUREKA_URL=${EUREKA_URL:-http://eureka-server:8761/eureka}

wait_for_tcp() {
  local host=$1
  local port=$2
  local label=${3:-$host:$port}
  log "Waiting for $label"
  until (echo >/dev/tcp/$host/$port) >/dev/null 2>&1; do
    sleep 1
  done
  log "$label is available"
}

parse_host_port() {
  local url=$1
  local stripped=${url#*://}
  stripped=${stripped%%/*}
  if [[ $stripped == *":"* ]]; then
    printf '%s' "$stripped"
  else
    printf '%s:8761' "$stripped"
  fi
}

if [[ "${WAIT_FOR_DB:-true}" == "true" ]]; then
  wait_for_tcp "$POSTGRES_HOST" "$POSTGRES_PORT" "postgres"
fi

EUREKA_HOST_PORT=$(parse_host_port "$EUREKA_URL")
EUREKA_HOST=${EUREKA_HOST_PORT%%:*}
EUREKA_PORT=${EUREKA_HOST_PORT##*:}
if [[ "${WAIT_FOR_EUREKA:-true}" == "true" ]]; then
  wait_for_tcp "$EUREKA_HOST" "$EUREKA_PORT" "eureka"
fi

if [[ -z "${SPRING_DATASOURCE_URL:-}" ]]; then
  export SPRING_DATASOURCE_URL="jdbc:postgresql://${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
fi
export SPRING_DATASOURCE_USERNAME=${SPRING_DATASOURCE_USERNAME:-$POSTGRES_USER}
export SPRING_DATASOURCE_PASSWORD=${SPRING_DATASOURCE_PASSWORD:-$POSTGRES_PASSWORD}
export EUREKA_CLIENT_SERVICE_URL=${EUREKA_CLIENT_SERVICE_URL:-$EUREKA_URL}

log "Starting student-service"
exec java ${JAVA_OPTS:-} -jar /app/app.jar
