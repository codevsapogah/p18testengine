#!/bin/bash

# Remove ESLint cache
rm -rf node_modules/.cache/eslint-loader
rm -rf node_modules/.cache/.eslintcache

# Output success message
echo "ESLint cache cleaned successfully!"

# Optional: Run ESLint again to create a fresh cache
echo "Running ESLint to create fresh cache..."
npx eslint ./src

echo "Done!" 