#!/bin/bash

echo "Project Structure Dump"
echo "===================="
echo

echo "Directory Structure (excluding node_modules, venv, and generated files):"
echo "--------------------------------------------------------------------"
tree -I 'node_modules|venv|.next|__pycache__|.git' -a
echo

echo "Frontend Files:"
echo "--------------"
echo
echo "src/components/inventory/InventorySystem.tsx:"
echo "-------------------------------------------"
cat frontend/src/components/inventory/InventorySystem.tsx 2>/dev/null || echo "File not found"
echo
echo "src/components/inventory/CameraCapture.tsx:"
echo "-----------------------------------------"
cat frontend/src/components/inventory/CameraCapture.tsx 2>/dev/null || echo "File not found"
echo
echo "src/components/inventory/ClassificationResults.tsx:"
echo "-----------------------------------------------"
cat frontend/src/components/inventory/ClassificationResults.tsx 2>/dev/null || echo "File not found"
echo
echo "src/components/inventory/SearchPanel.tsx:"
echo "--------------------------------------"
cat frontend/src/components/inventory/SearchPanel.tsx 2>/dev/null || echo "File not found"
echo
echo "src/components/inventory/VoiceInput.tsx:"
echo "-------------------------------------"
cat frontend/src/components/inventory/VoiceInput.tsx 2>/dev/null || echo "File not found"
echo
echo "src/components/inventory/types.ts:"
echo "-------------------------------"
cat frontend/src/components/inventory/types.ts 2>/dev/null || echo "File not found"
echo

echo "Backend Files:"
echo "-------------"
echo
echo "backend/app.py:"
echo "--------------"
cat backend/app.py 2>/dev/null || echo "File not found"
echo
echo "backend/api/routes/__init__.py:"
echo "-----------------------------"
cat backend/api/routes/__init__.py 2>/dev/null || echo "File not found"
echo
echo "backend/api/routes/image_routes.py:"
echo "---------------------------------"
cat backend/api/routes/image_routes.py 2>/dev/null || echo "File not found"
echo
echo "backend/api/routes/inventory_routes.py:"
echo "------------------------------------"
cat backend/api/routes/inventory_routes.py 2>/dev/null || echo "File not found"
echo
echo "backend/llm/processors/image_processor.py:"
echo "---------------------------------------"
cat backend/llm/processors/image_processor.py 2>/dev/null || echo "File not found"
echo

echo "Requirements:"
echo "------------"
echo "backend/requirements.txt:"
cat backend/requirements.txt 2>/dev/null || echo "File not found"
echo
