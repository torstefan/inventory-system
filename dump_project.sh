#!/bin/bash

# Create project status file
echo "Creating project status file..."
cat > project_status.txt << 'EOL'
Project: Smart Inventory Management System with Computer Vision and Voice Control

This is a web-based inventory management system designed to help organize items in a loft/storage space. The system uses computer vision (GPT-4o) to identify items and voice recognition for updating classifications.

Key Features:
1. Camera integration with preference memory and manual focus control
2. Multiple camera selection support
3. GPT-4o integration for item classification
4. Voice control for updating item information
5. Storage hierarchy management system (shelves and containers)
6. Automated storage location suggestions with alternatives
7. Web interface built with Next.js and Flask
8. Complete item database with browsing capability

Technical Stack:
Frontend:
- Next.js with TypeScript
- Tailwind CSS for styling
- WebSpeech API for voice recognition (works best in Chromium-based browsers)
- React Webcam for camera integration with manual focus

Backend:
- Flask (Python)
- OpenAI GPT-4o API
- SQLAlchemy for database
- SQLite database

Current State:
- Basic UI implemented
- Camera capture working with:
  - Camera preference memory
  - Manual focus control
  - Multi-camera support
- Voice input working (in Chromium browsers)
- GPT-4o Vision integration working
- Storage management system implemented:
  - Shelves (Level 1)
  - Containers/Organizers (Level 2)
- Full CRUD operations for storage management
- Item database integration
- Location suggestions with alternatives
- Item listing view

Project Structure:
Frontend:
- React components for:
  - Inventory system
  - Camera capture with manual focus
  - Voice input
  - Storage management
  - Item listing
  - Classification results

Backend:
- Flask server with routes for:
  - Image processing
  - Inventory management
  - Storage management
- Database: SQLite with SQLAlchemy ORM
- LLM Integration: OpenAI GPT-4o for image analysis

Next Steps Needed:
1. Implement search functionality
2. Add sorting and filtering to item list
3. Add storage movement tracking
4. Implement item history
5. Add bulk import/export capabilities
6. Add image gallery view for items
7. Implement edit functionality for stored items
8. Add statistical analysis of storage usage
9. Add barcode/QR code support
10. Implement backup system

Known Issues:
1. Manual focus control requires camera initialization
2. Some cameras may not support manual focus
3. Voice recognition limited to Chromium browsers
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
