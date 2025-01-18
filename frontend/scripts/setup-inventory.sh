#!/bin/bash
# frontend/scripts/setup-inventory.sh

# Create all necessary directories
mkdir -p src/components/inventory/item-list/components
mkdir -p src/components/inventory/item-list/hooks
mkdir -p src/components/inventory/shared

# Move existing shared components if they exist
for file in ItemBasicInfo.tsx ItemTechnicalDetails.tsx ItemFilters.tsx ItemEditForm.tsx; do
  if [ -f "src/components/inventory/$file" ]; then
    mv "src/components/inventory/$file" "src/components/inventory/shared/"
  fi
done

echo "Directory structure created and existing files moved!"
echo "Now you'll need to create the new component files in their respective directories."
