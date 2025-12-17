#!/bin/bash
# This script extracts JWT_PRIVATE_KEY from convex/.env and sets it via Convex CLI
# Run this while 'npx convex dev' is running in another terminal

echo "Extracting JWT_PRIVATE_KEY from convex/.env..."

# Use Python to properly extract the multiline key
python3 << 'PYEOF' | npx convex env set JWT_PRIVATE_KEY
import re
import sys

with open('convex/.env', 'r') as f:
    content = f.read()

# Extract the key value (everything between the quotes)
match = re.search(r'JWT_PRIVATE_KEY="(.*?)"', content, re.DOTALL)
if match:
    print(match.group(1))
else:
    print("ERROR: Could not extract JWT_PRIVATE_KEY", file=sys.stderr)
    sys.exit(1)
PYEOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ JWT_PRIVATE_KEY has been set!"
    echo "   The running Convex dev server should pick it up automatically."
    echo "   If you still see errors, try restarting 'npx convex dev'"
else
    echo ""
    echo "❌ Failed to set JWT_PRIVATE_KEY"
    echo "   Make sure 'npx convex dev' is running in another terminal"
fi

