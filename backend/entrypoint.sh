#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput 2>/dev/null || true

PORT=${PORT:-8000}

exec daphne -b 0.0.0.0 -p $PORT config.asgi:application
