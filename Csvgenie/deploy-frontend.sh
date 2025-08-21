#!/bin/bash

echo "🚀 Deploying CSVGenie Frontend to Vercel..."

# Check if git is initialized (in parent directory)
if [ ! -d "../.git" ]; then
    echo "❌ Error: Git repository not found in parent directory"
    echo "Please ensure you're in the Csvgenie folder within the CsvGenerator git repository"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI already installed"
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel:"
    vercel login
fi

# Build the project
echo "🔨 Building frontend..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors and try again."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployment completed!"
echo "📱 Check your Vercel dashboard for deployment status"
echo ""
echo "⚠️  Remember to:"
echo "1. Set the REACT_APP_API_URL environment variable in Vercel"
echo "2. Update the backend CORS settings with your frontend URL"
