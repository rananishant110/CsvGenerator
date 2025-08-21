#!/bin/bash

echo "🚀 Deploying CSVGenie Backend to Render..."

# Check if git is initialized (in parent directory)
if [ ! -d "../.git" ]; then
    echo "❌ Error: Git repository not found in parent directory"
    echo "Please ensure you're in the Csvgenie folder within the CsvGenerator git repository"
    exit 1
fi

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "📦 Installing Render CLI..."
    curl -sL https://render.com/download-cli/install.sh | bash
    echo "✅ Render CLI installed"
else
    echo "✅ Render CLI already installed"
fi

# Check if logged in to Render
if ! render whoami &> /dev/null; then
    echo "🔐 Please log in to Render:"
    render login
fi

# Deploy to Render
echo "🚀 Deploying backend service..."
render blueprint apply render.yaml

echo "✅ Backend deployment initiated!"
echo "📱 Check your Render dashboard for deployment status"
echo "🔗 Your backend will be available at: https://your-service-name.onrender.com"
echo ""
echo "⚠️  Remember to:"
echo "1. Update the ALLOWED_ORIGINS in render.yaml with your frontend URL"
echo "2. Set the REACT_APP_API_URL in your frontend environment variables"
