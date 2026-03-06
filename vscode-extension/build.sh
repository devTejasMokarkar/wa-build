#!/bin/bash

# WhatsApp Flow Builder VS Code Extension Build Script

echo "🚀 Building WhatsApp Flow Builder VS Code Extension..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf out/
rm -f *.vsix

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run compile

# Check if compilation was successful
if [ ! -d "out" ]; then
    echo "❌ Compilation failed - out directory not found"
    exit 1
fi

# Package extension
echo "📦 Packaging extension..."
npx vsce package

# Check if packaging was successful
if [ ! -f "*.vsix" ]; then
    echo "❌ Packaging failed - no VSIX file found"
    exit 1
fi

echo "✅ Extension built successfully!"

# List created files
echo "📋 Created files:"
ls -la *.vsix

echo ""
echo "🎯 To install the extension:"
echo "   code --install-extension wa-flow-builder-preview-*.vsix"
echo ""
echo "🌐 To test in development:"
echo "   1. Open VS Code"
echo "   2. Press F5 to launch Extension Development Host"
echo "   3. Open a .flow.js or .screen.js file"
echo "   4. Click the preview button in the editor title bar"
echo ""
echo "🚀 Happy coding with WhatsApp Flow Builder!"
