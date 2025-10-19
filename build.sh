#!/bin/bash

# Build script for Netlify deployment
# Creates a dist/ folder with only the files needed for production

echo "🚀 Building production files..."

# Remove existing dist folder if it exists
if [ -d "dist" ]; then
    echo "🗑️  Removing existing dist/ folder..."
    rm -rf dist
fi

# Create dist folder
echo "📁 Creating dist/ folder..."
mkdir -p dist/experience-images

# Copy HTML, CSS, JS files
echo "📄 Copying frontend files..."
cp index.html dist/
cp script.js dist/
cp styles.css dist/
cp supabase-client.js dist/

# Copy images
echo "🖼️  Copying images..."
cp favicon.svg dist/
cp CITTA.png dist/
cp NOMI.png dist/

# Copy experience images folder
echo "📸 Copying experience images..."
cp -r experience-images/* dist/experience-images/ 2>/dev/null || echo "⚠️  No images in experience-images/ folder"

# Copy LICENSE
echo "📜 Copying LICENSE..."
cp LICENSE dist/ 2>/dev/null || echo "ℹ️  No LICENSE file found"

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Files ready in dist/ folder:"
ls -lh dist/
echo ""
echo "📊 Total size:"
du -sh dist/
echo ""
echo "🌐 Ready to deploy to Netlify!"
echo "   You can drag & drop the dist/ folder to app.netlify.com"
echo ""
