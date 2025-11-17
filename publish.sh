#!/bin/bash

echo "⚙️ Building all packages..."
echo ""
echo "⚙️ Building @wms/styles..."
yarn workspace @wms/styles build
echo ""
echo "⚙️ Building @wms/qc..."
yarn workspace @wms/qc build
echo ""
echo "⚙️ Building @wms/ui..."
yarn workspace @wms/core build
yarn workspace @wms/projects build
yarn workspace @wms/gantt build
yarn workspace @wms/board build
yarn workspace @wms/projects build
yarn workspace @wms/list build
yarn workspace @wms/ui build
echo ""
echo ""
echo "✅ All packages built successfully!"
