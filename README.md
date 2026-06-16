# ─── Ace Venturi: Controls Detective — Environment Config ─────────────────────
#
# Copy this file to .env and fill in your values.
# NEVER commit .env to git — it contains your secret API key.

# Your Anthropic API key — get one at https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Port for the proxy server (default: 3001)
PORT=3001

# In production, set this to your actual domain
# e.g. https://ace-venturi.yourcompany.com
ALLOWED_ORIGIN=http://localhost:3000

# Set to "production" when deploying
NODE_ENV=development
