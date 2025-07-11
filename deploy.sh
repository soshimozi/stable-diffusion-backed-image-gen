#!/bin/bash

set -e
cd "$(dirname "$0")"

echo "➡️  Building React frontend..."
cd react-frontend
npm run build
cd ..
echo "✅ React build complete."

# Setup Conda
CONDA_SH="/c/Users/Scott/anaconda3/etc/profile.d/conda.sh"
CONDA_ENV_NAME="modal-client"

if [ -f "$CONDA_SH" ]; then
    echo "🐍 Sourcing Conda from $CONDA_SH"
    source "$CONDA_SH"
    conda activate "$CONDA_ENV_NAME"
else
    echo "❌ Conda initialization script not found at $CONDA_SH"
    exit 1
fi

echo "🚀 Deploying with Modal..."
modal deploy modal_deploy.py
echo "✅ Deployment complete."
