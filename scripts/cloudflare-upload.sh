#!/bin/bash

# Cloudflare Pages Direct Upload Script
# Update these variables with your actual values:

# Load from environment variables or use fallbacks
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-your_account_id_here}"
PROJECT_NAME="${CLOUDFLARE_PROJECT_NAME:-fitment-assistant-wheelprice}"
API_TOKEN="${CLOUDFLARE_API_TOKEN:-your_api_token_here}"

echo "🚀 Uploading files to Cloudflare Pages..."
echo "Project: $PROJECT_NAME"
echo ""

# Create a deployment with direct upload
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "widget.js=@cdn-assets/widget.js" \
  -F "chat-widget.js=@cdn-assets/chat-widget.js" \
  -F "widget.css=@cdn-assets/widget.css"

echo ""
echo "✅ Upload complete!"
echo "🌐 Your files should be available at: https://fitment-assistant-wheelprice.pages.dev"
