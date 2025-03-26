#!/bin/sh

# Start Nginx
nginx

# Start Gunicorn
gunicorn --bind 0.0.0.0:8000 backend.wsgi:application 