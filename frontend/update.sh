# frontend/scripts/refactor-itemlist.sh
#!/bin/bash

# Create necessary directories
mkdir -p src/components/inventory/item-list
mkdir -p src/components/inventory/shared

# Move shared components to their own directory
mv src/components/inventory/ItemBasicInfo.tsx src/components/inventory/shared/
mv src/components/inventory/ItemTechnicalDetails.tsx src/components/inventory/shared/
mv src/components/inventory/ItemFilters.tsx src/components/inventory/shared/
mv src/components/inventory/ItemEditForm.tsx src/components/inventory/shared/

# Create an index file for shared components
cat > src/components/inventory/shared/index.ts << EOL
export { default as ItemBasicInfo } from './ItemBasicInfo';
export { default as ItemTechnicalDetails } from './ItemTechnicalDetails';
export { default as ItemFilters } from './ItemFilters';
export { default as ItemEditForm } from './ItemEditForm';
EOL

# Move and rename item list components
mv src/components/inventory/ItemList.tsx src/components/inventory/item-list/ItemListContainer.tsx
mv src/components/inventory/ItemListDetailed.tsx src/components/inventory/item-list/DetailedView.tsx
mv src/components/inventory/ItemListCompact.tsx src/components/inventory/item-list/CompactView.tsx

# Create index file for item-list components
cat > src/components/inventory/item-list/index.ts << EOL
export { default as ItemList } from './ItemListContainer';
export { default as DetailedView } from './DetailedView';
export { default as CompactView } from './CompactView';
EOL

# Update the main inventory index file
cat > src/components/inventory/index.ts << EOL
export { ItemList } from './item-list';
export * from './shared';
EOL

# Make the script executable
chmod +x frontend/scripts/refactor-itemlist.sh

echo "Refactoring completed successfully!"
