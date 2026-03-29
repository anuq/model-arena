#!/bin/sh
set -e

# Default to localhost for local development
BACKEND_URL="${BACKEND_URL:-localhost}"

# Replace template variable with actual backend URL
sed "s|\${BACKEND_URL}|${BACKEND_URL}|g" /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g "daemon off;"
