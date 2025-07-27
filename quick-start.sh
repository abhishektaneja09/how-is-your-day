#!/bin/bash

# How's My Day? - Quick Start Script
# This script helps you get the voice-based mood tracker running quickly

echo "🎤 How's My Day? - Voice Mood Tracker"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/"
    echo ""
    exit 1
fi

echo "✅ Node.js is installed"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available. Please install npm."
    echo ""
    exit 1
fi

echo "✅ npm is available"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    echo "   Try running: npm install"
    echo ""
    exit 1
fi

# Check if AssemblyAI API key is configured
echo ""
echo "🔑 Checking AssemblyAI API key..."

if grep -q "YOUR_ASSEMBLYAI_API_KEY" app.js; then
    echo "⚠️  AssemblyAI API key not configured"
    echo ""
    echo "To use AssemblyAI (recommended for better accuracy):"
    echo "1. Sign up at https://www.assemblyai.com/"
    echo "2. Get your API key from the dashboard"
    echo "3. Replace 'YOUR_ASSEMBLYAI_API_KEY' in app.js with your actual key"
    echo ""
    echo "The app will work with browser speech recognition as fallback."
else
    echo "✅ AssemblyAI API key appears to be configured"
fi

# Start the server
echo ""
echo "🚀 Starting the server..."
echo "   The app will be available at: http://localhost:3000"
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start 