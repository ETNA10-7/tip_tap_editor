#!/bin/bash
# Script to set JWT_PRIVATE_KEY in Convex environment

echo "Setting JWT_PRIVATE_KEY in Convex environment..."

# Extract the key from convex/.env
# This handles the multiline private key properly
awk '
/^JWT_PRIVATE_KEY=/ {
    # Remove the variable name and opening quote
    sub(/^JWT_PRIVATE_KEY="/, "")
    # Print the first line
    print
    # Continue reading until we find the closing quote
    while (getline > 0) {
        if (/^"$/) {
            # Found closing quote on its own line
            break
        }
        if (/"$/) {
            # Found closing quote at end of line
            sub(/"$/, "")
            print
            break
        }
        print
    }
    exit
}
' convex/.env | npx convex env set JWT_PRIVATE_KEY

if [ $? -eq 0 ]; then
    echo "✅ JWT_PRIVATE_KEY has been set in Convex environment"
    echo "⚠️  Make sure to restart 'npx convex dev' for changes to take effect"
else
    echo "❌ Failed to set JWT_PRIVATE_KEY"
    echo "   Make sure:"
    echo "   1. You're logged in to Convex (run 'npx convex login' if needed)"
    echo "   2. The convex/.env file exists and contains JWT_PRIVATE_KEY"
    exit 1
fi
