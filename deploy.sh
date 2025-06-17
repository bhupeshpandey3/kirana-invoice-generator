#!/bin/bash

# Vercel Deployment Script for Kirana Invoice Generator
echo "🚀 Deploying Kirana Invoice Generator to Vercel..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Build the project to test it locally first
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix any errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Commit the latest changes to Git
echo "📝 Committing latest changes..."
git add .
git commit -m "Updated Kirana Invoice Generator for Vercel deployment - $(date)"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "🔍 Checking Vercel login status..."
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "🔑 Please login to Vercel:"
    vercel login
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment process completed!"
echo ""
echo "📋 Next steps:"
echo "1. Test your live app thoroughly"
echo "2. Share the URL with your users"
echo ""
echo "📖 For detailed instructions, see HOSTING_GUIDE.md"
