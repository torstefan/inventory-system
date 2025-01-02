export interface StorageLocation {
  level1: {
    id: number;
    name: string;
    description?: string;
  };
  level2: {
    id: number;
    name: string;
    containerType: 'regular_box' | 'drawer_organizer';
    description?: string;
  }[];
}

export interface EditingState {
  type: 'shelf' | 'container' | null;
  id: number | null;
  data: any;
}

export interface ShelfData {
  id: number;
  name: string;
  description?: string;
}

export interface ContainerData {
  id: number;
  name: string;
  containerType: 'regular_box' | 'drawer_organizer';
  description?: string;
  shelfId: number;
}// frontend/src/components/storage/types.ts
