export interface StorageLocation {
  level1: {
    id: number;
    name: string;
    description?: string;
  };
  level2: Array<{
    id: number;
    shelf_id: number;
    name: string;
    container_type: string;
    description?: string;
  }>;
} 