#!/bin/sh

# Wait for PostgreSQL
until nc -z postgres 5432; do
  echo "Waiting for postgres..."
  sleep 1
done
echo "Postgres is ready!"

# Run tests
npx jest --detectOpenHandles --forceExit 