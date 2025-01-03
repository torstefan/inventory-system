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
9. Full CRUD operations for items and storage locations

Technical Stack:
Frontend:
- Next.js 13+ with TypeScript
- Tailwind CSS for styling
- WebSpeech API for voice recognition (works best in Chromium-based browsers)
- React Webcam for camera integration with manual focus
- Axios for API communication

Backend:
- Flask (Python)
- OpenAI GPT-4o API
- SQLAlchemy for database
- SQLite database with proper relationships

Current State:
- Basic UI implemented and working:
  - Camera capture with:
    - Camera preference memory
    - Manual focus control
    - Multi-camera support
  - Voice input working (in Chromium browsers)
  - GPT-4o Vision integration working
  - Storage management system fully implemented
  - Item management system working with CRUD operations

Database Structure:
- Storage hierarchy:
  - Level 1: Shelves
  - Level 2: Containers/Organizers
  - Level 3: Compartments (default)
- Item storage with full location tracking
- Proper relationships between items and storage locations

Item Management Features:
- Create new items with:
  - Camera-based identification
  - Voice input
  - Manual entry
- Edit existing items:
  - All item properties
  - Location reassignment
- Delete items
- List view with all item details

Storage Management Features:
- Create/Edit/Delete shelves
- Create/Edit/Delete containers
- Automatic compartment management
- Location suggestions for new items

Next Steps Needed:
1. Implement search functionality
2. Add sorting and filtering to item list
3. Add storage movement tracking
4. Implement item history
5. Add bulk import/export capabilities
6. Add image gallery view for items
7. Add statistical analysis of storage usage
8. Add barcode/QR code support
9. Implement backup system
10. Add input validation
11. Add error boundaries for better error handling
12. Implement proper loading states
13. Add item categories management
14. Implement condition standardization

Known Issues:
1. Manual focus control requires camera initialization
2. Some cameras may not support manual focus
3. Voice recognition limited to Chromium browsers
4. Location dropdown can be sluggish with many locations

Installation Requirements:
Backend:
- Python 3.11+
- Flask 3.0.0+
- SQLAlchemy 2.0.23+
- OpenAI API key
- Other dependencies as listed in requirements.txt

Frontend:
- Node.js 18+
- npm/yarn
- Webcam access for item registration
- Microphone access for voice input (optional)
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
