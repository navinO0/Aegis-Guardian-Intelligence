#!/bin/bash
# -------------------------------------------------------------------
# Cloudflare Tunnel Connection Script
# -------------------------------------------------------------------

TUNNEL_ID="6d5b8cd0-029a-41c4-a250-6157ad95d0fe"
CREDS_FILE="/home/naveen/.cloudflared/${TUNNEL_ID}.json"
CONFIG_FILE="/home/naveen/.cloudflared/config.yml"

echo "Step 1: Cleanup any existing tunnel processes..."
pkill cloudflared 2>/dev/null && echo "Stopped previously running tunnel."

echo "Step 2: Updating Cloudflare Tunnel Configuration..."
if [ ! -f "$CREDS_FILE" ]; then
    echo "Error: Credentials file not found at $CREDS_FILE"
    exit 1
fi

cat <<EOF > "$CONFIG_FILE"
tunnel: $TUNNEL_ID
credentials-file: $CREDS_FILE
protocol: http2

ingress:
  - hostname: navin.lol
    service: http://localhost:80
  - hostname: app.navin.lol
    service: http://localhost:80

  - service: http_status:404
EOF

echo "Done. Config file at: $CONFIG_FILE"

echo ""
echo "Step 3: Starting connection to Cloudflare..."
echo "-------------------------------------------------------------------"
if ! cloudflared tunnel --config "$CONFIG_FILE" run "$TUNNEL_ID"; then
    echo "Error: Failed to start tunnel. Check if port 80 (Nginx) is listening."
    exit 1
fi
