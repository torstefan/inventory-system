#!/bin/bash

# Create project status file
echo "Creating project status file..."
cat > project_status.txt << 'EOL'
Project: Smart Inventory Management System with Computer Vision and Voice Control

This is a web-based inventory management system designed to help organize items in a loft/storage space. The system uses computer vision (GPT-4o) to identify items and voice recognition for updating classifications.

Key Features:
1. Camera integration to capture images of items
2. Multiple camera selection support with preference memory
3. GPT-4o integration for item classification
4. Voice control for updating item information
5. Storage hierarchy management system
6. Web interface built with Next.js and Flask

Technical Stack:
Frontend:
- Next.js with TypeScript
- Tailwind CSS for styling
- WebSpeech API for voice recognition (works best in Chromium-based browsers)
- React Webcam for camera integration

Backend:
- Flask (Python)
- OpenAI GPT-4o API
- SQLAlchemy for database
- SQLite database

Current State:
- Basic UI implemented
- Camera capture working with camera preference memory
- Voice input working (in Chromium browsers)
- GPT-4o Vision integration working
- Storage management system implemented with hierarchy:
  - Shelves (Level 1)
  - Containers/Organizers (Level 2)
  - Future: Compartments (Level 3)
- Full CRUD operations for storage management

Project Structure:
- Frontend: React components for UI (inventory system, camera capture, voice input, storage management)
- Backend: Flask server with routes for image processing, inventory and storage management
- Database: SQLite with SQLAlchemy ORM
- LLM Integration: OpenAI GPT-4o for image analysis

Next Steps Needed:
1. Implement item database storage
2. Add search functionality
3. Connect items to storage locations
4. Add container compartment management (Level 3)
5. Implement item tracking and movement history
EOL

# Create directory structure dump
echo "Creating directory structure dump..."
echo "Project Structure Dump" > project_dump.txt
echo "====================" >> project_dump.txt
echo "" >> project_dump.txt

echo "Directory Structure (excluding node_modules, venv, and generated files):" >> project_dump.txt
echo "--------------------------------------------------------------------" >> project_dump.txt
tree -I 'node_modules|venv|.next|__pycache__|*.pyc' >> project_dump.txt
echo "" >> project_dump.txt

# Dump frontend files
echo "Frontend Files:" >> project_dump.txt
echo "--------------" >> project_dump.txt
echo "" >> project_dump.txt

# Main frontend components
for file in frontend/src/components/inventory/*.tsx \
           frontend/src/components/storage/*.tsx \
           frontend/src/app/page.tsx; do
    if [ -f "$file" ]; then
        echo "$file:" >> project_dump.txt
        echo "$(printf '%.s-' {1..50})" >> project_dump.txt
        cat "$file" >> project_dump.txt
        echo "" >> project_dump.txt
        echo "" >> project_dump.txt
    fi
done

# Dump backend files
echo "Backend Files:" >> project_dump.txt
echo "-------------" >> project_dump.txt
echo "" >> project_dump.txt

# Main backend files
for file in backend/app.py \
           backend/api/routes/*.py \
           backend/api/models/*.py \
           backend/database/db.py \
           backend/llm/processors/image_processor.py; do
    if [ -f "$file" ]; then
        echo "$file:" >> project_dump.txt
        echo "$(printf '%.s-' {1..50})" >> project_dump.txt
        cat "$file" >> project_dump.txt
        echo "" >> project_dump.txt
        echo "" >> project_dump.txt
    fi
done

# Dump requirements
echo "Requirements:" >> project_dump.txt
echo "------------" >> project_dump.txt
echo "backend/requirements.txt:" >> project_dump.txt
if [ -f "backend/requirements.txt" ]; then
    cat backend/requirements.txt >> project_dump.txt
fi
echo "" >> project_dump.txt

echo "Project structure dump completed!"
