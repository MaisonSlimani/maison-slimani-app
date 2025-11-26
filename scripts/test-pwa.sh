#!/bin/bash

# Quick PWA Testing Script
# This script helps you test both PWAs during development

echo "🚀 PWA Testing Helper"
echo "===================="
echo ""
echo "Which PWA do you want to test?"
echo "1) Customer PWA (main app with ?pwa=true)"
echo "2) Admin PWA (separate app on port 3001)"
echo "3) Both (run in separate terminals)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo ""
    echo "📱 Starting Customer PWA..."
    echo "Visit: http://localhost:3000?pwa=true"
    echo ""
    npm run dev
    ;;
  2)
    echo ""
    echo "👨‍💼 Starting Admin PWA..."
    echo "Visit: http://localhost:3001"
    echo ""
    npm run admin:dev
    ;;
  3)
    echo ""
    echo "🔄 Starting both PWAs..."
    echo "Customer: http://localhost:3000?pwa=true"
    echo "Admin: http://localhost:3001"
    echo ""
    echo "⚠️  You'll need to run these in separate terminals:"
    echo "Terminal 1: npm run dev"
    echo "Terminal 2: npm run admin:dev"
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

