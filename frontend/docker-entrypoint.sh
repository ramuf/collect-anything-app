#!/bin/sh
set -e

# Create runtime config file for API URL
if [ -n "$NEXT_PUBLIC_API_URL" ]; then
  echo "Configuring API URL to: $NEXT_PUBLIC_API_URL"
  
  # Create a public config file
  cat > /app/public/runtime-config.js << EOF
window.__RUNTIME_CONFIG__ = {
  NEXT_PUBLIC_API_URL: "$NEXT_PUBLIC_API_URL"
};
EOF
  
  echo "Runtime config created"
else
  echo "Warning: NEXT_PUBLIC_API_URL not set, using build-time default"
fi

# Start Next.js server
exec node server.js
