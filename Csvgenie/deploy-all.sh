#!/bin/bash

echo "🚀 CSVGenie Full Stack Deployment"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: This directory is not a git repository"
    echo "Please run: git init && git add . && git commit -m 'Initial commit'"
    exit 1
fi

# Check git status
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    git status --short
    echo ""
    read -p "Do you want to commit all changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Auto-commit before deployment"
        echo "✅ Changes committed"
    else
        echo "❌ Please commit your changes before deploying"
        exit 1
    fi
fi

echo "🔧 Starting Backend Deployment..."
./deploy-backend.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "🎨 Starting Frontend Deployment..."
    ./deploy-frontend.sh
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Deployment Complete!"
        echo "======================"
        echo "✅ Backend: Deployed to Render"
        echo "✅ Frontend: Deployed to Vercel"
        echo ""
        echo "🔗 Next Steps:"
        echo "1. Get your backend URL from Render dashboard"
        echo "2. Get your frontend URL from Vercel dashboard"
        echo "3. Update CORS settings in backend"
        echo "4. Set REACT_APP_API_URL in frontend"
        echo "5. Test your deployed application"
    else
        echo "❌ Frontend deployment failed"
        exit 1
    fi
else
    echo "❌ Backend deployment failed"
    exit 1
fi
