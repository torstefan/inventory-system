// types/itemTypes.ts
export interface StoredItem {
  id: number;
  category: string;
  subcategory: string | null;
  brand: string | null;
  model: string | null;
  condition: string | null;
  // Support both old and new structures
  technical_description?: string | null;
  use_cases?: string[] | null;
  technical_details?: {
    description: string;
    use_cases: string[];
  };
  location: {
    shelf: string | null;
    container: string | null;
  };
  image_path: string | null;
  date_added: string;
  last_modified: string;
}

export interface EditingItem {
  id: number;
  data: Partial<StoredItem> & {
    selected_location?: {
      shelf: string | null;
      container: string | null;
    } | null;
  };
}

export interface ItemLocation {
  shelf: string;
  container: string;
}