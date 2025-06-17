#!/bin/bash

# Quick Deployment Script for Kirana Invoice Generator
echo "🚀 Deploying Kirana Invoice Generator..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix any errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Kirana Invoice Generator"
    echo "✅ Git repository initialized"
else
    echo "📝 Committing latest changes..."
    git add .
    git commit -m "Updated Kirana Invoice Generator - $(date)"
    echo "✅ Changes committed"
fi

echo ""
echo "🎉 Your project is ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/kirana-invoice-generator.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. Deploy to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Click Deploy"
echo ""
echo "3. Your app will be live at: https://your-project-name.vercel.app"
echo ""
echo "📖 For detailed instructions, see HOSTING_GUIDE.md"
