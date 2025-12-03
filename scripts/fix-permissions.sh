#!/bin/bash
# Fix permissions for .next directory
# Run this script if you encounter EACCES permission errors

set -e

echo "Fixing .next directory permissions..."

# Remove .next directory if it exists
if [ -d ".next" ]; then
  echo "Removing existing .next directory..."
  rm -rf .next
fi

# Get the current user (not root)
CURRENT_USER=${SUDO_USER:-$USER}
if [ "$CURRENT_USER" = "root" ]; then
  # If running as root, try to get the actual user from the home directory
  if [ -d "/home/maison" ]; then
    CURRENT_USER="maison"
  else
    CURRENT_USER=$(stat -c '%U' . 2>/dev/null || echo "maison")
  fi
fi

echo "Setting ownership to $CURRENT_USER..."

# Fix ownership of the entire project directory
if command -v chown &> /dev/null; then
  chown -R "$CURRENT_USER:$CURRENT_USER" . 2>/dev/null || true
fi

# Ensure proper permissions
chmod -R u+rwX . 2>/dev/null || true
find . -type d -exec chmod 755 {} \; 2>/dev/null || true
find . -type f -exec chmod 644 {} \; 2>/dev/null || true

echo "Permissions fixed! You can now run 'npm run dev' or 'npm run build'"

