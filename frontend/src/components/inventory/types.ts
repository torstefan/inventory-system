export interface VideoDevice {
  deviceId: string;
  label: string;
}

export type Classification = {
  category?: string;
  subcategory?: string;
  properties?: {
    brand?: string;
    model?: string;
    condition?: string;
  };
  suggested_location?: {
    shelf?: string;
    box?: string;
  };
} | string;  // Added string type to handle raw JSON responses