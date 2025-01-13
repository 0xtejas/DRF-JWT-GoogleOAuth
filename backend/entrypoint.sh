#!/bin/sh

until poetry run python manage.py makemigrations && poetry run python manage.py migrate --noinput
do
    echo "Waiting for db to be ready..."
    sleep 2
done

poetry run python manage.py collectstatic --noinput

exec poetry run "$@"