// frontend/src/components/storage/types.ts

export type ContainerType = 'regular_box' | 'drawer_organizer';

export interface StorageLevel1 {
  id: number;
  name: string;
  description?: string;
}

export interface StorageLevel2 {
  id: number;
  shelfId: number;
  name: string;
  containerType: ContainerType;
  description?: string;
}

export interface StorageLevel3 {
  id: number;
  containerId: number;
  name: string;
  description?: string;
}

export interface StorageLocation {
  level1: StorageLevel1;
  level2: StorageLevel2[];
  level3: StorageLevel3[];
}