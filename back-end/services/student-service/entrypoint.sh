#!/usr/bin/env bash
set -euo pipefail

# Defaults (can be overridden via env vars)
POSTGRES_HOST=${POSTGRES_HOST:-postgres}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_DB=${POSTGRES_DB:-oais-student-service}
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-NewPost}
_extract_eureka_host_port() {
  local url=$1
# export values so they are visible to the Java process we exec below
export POSTGRES_HOST POSTGRES_PORT POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD EUREKA_CLIENT_SERVICE_URL=${EUREKA_URL}

  local hostport=${stripped%%/*}
  if [[ $hostport == *":"* ]]; then
    echo "$hostport"
  else
    echo "${hostport}:8761"
  fi
}

EUREKA_HOST_PORT=$(_extract_eureka_host_port "$EUREKA_URL")
EUREKA_HOST=${EUREKA_HOST_PORT%%:*}
EUREKA_PORT=${EUREKA_HOST_PORT##*:}

wait_for_tcp() {
  local host=$1; local port=$2
  printf 'Waiting for %s:%s' "$host" "$port"
  while ! (</dev/tcp/$host/$port) >/dev/null 2>&1; do
    printf '.'; sleep 1
  done
# If SPRING_DATASOURCE_URL was not provided, construct it from the above values
if [[ -z "${SPRING_DATASOURCE_URL:-}" ]]; then
  export SPRING_DATASOURCE_URL="jdbc:postgresql://${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
fi
# Ensure the JVM sees the datasource credentials
export SPRING_DATASOURCE_USERNAME=${SPRING_DATASOURCE_USERNAME:-$POSTGRES_USER}
export SPRING_DATASOURCE_PASSWORD=${SPRING_DATASOURCE_PASSWORD:-$POSTGRES_PASSWORD}

# Exec the jar
exec java -jar /app/app.jar

