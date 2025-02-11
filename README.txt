# Inventory Management System

## Project Overview
A modern inventory management system that combines traditional inventory tracking with advanced AI capabilities:
- Multi-modal item registration using both images and text
- Vision-language processing using GPT-4V for image analysis
- RAG-powered natural language querying for inventory search
- Automated metadata extraction from images and descriptions
- Intelligent storage suggestions based on item characteristics

The system leverages both computer vision and natural language processing to create a comprehensive 
inventory management solution that understands items through both visual and textual information.

## System Requirements

### Backend Dependencies
- quart==0.19.4
- quart-cors==0.7.0
- sqlalchemy==2.0.25
- python-multipart==0.0.6
- pillow==10.2.0
- openai==1.10.0
- numpy==1.26.3
- Python 3.11+
- SQLite 3.40+
- OpenAI API key with GPT-4V access
- v4l2-ctl utility installed
- Webcam with V4L2 support

### Frontend Dependencies
- Node.js 18+
- next.js 14
- react 18
- typescript
- tailwindcss
- axios
- lucide-react (for icons)
- Modern web browser with JavaScript enabled

## Architecture

### Backend (Python/Quart)
- **Core API Server**: Asynchronous REST API built with Quart
- **Database**: SQLAlchemy ORM with SQLite backend
- **RAG System**: OpenAI embeddings + GPT-4 for natural language processing
- **File Storage**: Local file system for image storage
- **Authentication**: Not yet implemented

### Frontend (Next.js/React)
- **Framework**: Next.js 14 with App Router
- **UI**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks + Session Storage for persistence
- **API Integration**: Axios for HTTP requests

## Current Features

### Camera Integration
- [x] Manual focus control via V4L2
- [x] Camera preference memory
- [x] Multi-device support
- [x] Focus distance adjustment
- [x] Device selection persistence
- [x] Close-up/Macro mode support (3cm)
- [x] Auto/Manual focus modes

### Data Management
- [x] Complete system backup
  - Database records
  - Uploaded images
  - Storage structure
  - Metadata
- [x] System restore functionality
  - Atomic restore operations
  - Data validation
  - Relationship preservation
- [x] CLI support for backup/restore
- [x] GUI interface for data operations

### Inventory Management
- [x] Multi-modal item registration
  - Camera capture with proper focus control
  - Text description input
  - Image processing via GPT-4V
  - Text processing via GPT-4
- [x] Item registration with detailed metadata
- [x] Image upload support
- [x] Hierarchical storage location tracking
- [x] Item categorization and tagging
- [x] Technical details and use case documentation
- [x] Advanced filtering system
  - Category filters (OR logic)
  - Brand filters (AND logic)
  - Model filters (AND logic)
  - Filter state persistence
  - Filter count indicators
  - Clear filters option

### Storage System
- [x] Three-level storage hierarchy (Shelves > Containers > Compartments)
- [x] Location tracking for items
- [x] Storage space management
- [x] Container type classification
- [x] Location suggestions based on item type
- [x] Edit and delete functionality

### Search & Retrieval
- [x] Natural language querying using RAG
- [x] Semantic search with embeddings
- [x] Real-time query processing
- [x] Context-aware responses
- [x] Relevant item suggestions

### User Interface
- [x] Responsive design
- [x] Tab-based navigation
- [x] Item detail views
- [x] Storage management interface
- [x] Question-answer interface
- [x] State persistence for Q&A history

## Known Issues
1. Filter combinations can be slow with large datasets
2. Browser compatibility issues with certain camera functions
3. Large image uploads need optimization
4. Need better error messages for API failures
5. Location selector can be slow with many locations
6. Search performance could be improved for large datasets

## Technical Debt
1. Need comprehensive test coverage
2. API documentation needs updating
3. Performance optimization for image processing
4. Code documentation improvements
5. Type safety enhancements
6. Error handling standardization
7. Search query optimization
8. React component restructuring

## API Endpoints

### Inventory Routes
- GET /api/inventory/items - List all items
- GET /api/inventory/items/<id> - Get item details
- POST /api/inventory/items - Create new item
- PUT /api/inventory/items/<id> - Update item
- DELETE /api/inventory/items/<id> - Delete item

### Storage Routes
- GET /api/storage/shelves - List all shelves
- GET /api/storage/containers - List all containers
- POST /api/storage/shelves - Create new shelf
- POST /api/storage/containers - Create new container

### RAG Routes
- POST /api/rag/query - Query inventory using natural language
- GET /api/rag/embeddings/status - Check embeddings status
- POST /api/rag/embeddings/reload - Reload embeddings

## Technical Implementation Details

### RAG System
- Multi-modal Processing:
  - Text embeddings via OpenAI's text-embedding-3-small model
  - Image analysis via GPT-4V for visual item recognition
  - Combined text-image understanding for comprehensive item details
- Query Processing:
  - GPT-4-turbo for natural language understanding
  - Context-aware responses using relevant item embeddings
  - Semantic search with cosine similarity matching
- Performance Optimizations:
  - Batch processing for embeddings generation
  - Efficient vector similarity search
  - Session-based persistence for Q&A history
- Integration Features:
  - Automated metadata extraction from images
  - Technical specification parsing
  - Use case identification from visual and textual cues
  - Storage location suggestions based on item characteristics

### Storage System
- Hierarchical structure with foreign key relationships
- Automatic cascade deletion
- Location validation
- Container type constraints

### Frontend Architecture
- Client-side routing with Next.js App Router
- Server-side props for initial data loading
- Responsive Tailwind CSS design system
- Component-based architecture
- Real-time state updates

## Setup Instructions

1. Clone the repository
2. Install backend dependencies: `pip install -r requirements.txt`
3. Install frontend dependencies: `npm install`
4. Set up environment variables:
   - OPENAI_API_KEY
   - DATABASE_URL (optional, defaults to SQLite)
5. Initialize database: `python init_db.py`
6. Start backend server: `python app.py`
7. Start frontend development server: `npm run dev`

## Future Improvements

- [ ] Search within filtered results
- [ ] Advanced filter combinations
- [ ] Filter presets and history
- [ ] Saved searches
- [ ] Dark mode support
- [ ] List/grid view toggle
- [ ] Customizable columns
- [ ] Keyboard shortcuts
- [ ] Drag-and-drop organization
- [ ] Sort by any field
- [ ] Location history tracking
- [ ] Modification logs
- [ ] Usage tracking
- [ ] Check-out system
- [ ] Audit trail
- [ ] Custom report builder
- [ ] Scheduled reports
- [ ] Email notifications
- [ ] User authentication and authorization
- [ ] Multi-user support
- [ ] Advanced search filters

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any enhancements.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 