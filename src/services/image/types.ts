
export type ImageCategory = 'apartment' | 'hero' | 'home_gallery' | 'social' | 'favicon';

export interface ImageRecord {
  id: string;
  category: ImageCategory;
  apartment_id: string | null;
  file_path: string;
  file_name: string;
  display_order: number;
  is_cover: boolean;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface UploadImageData {
  category: ImageCategory;
  apartment_id?: string;
  file: File;
  alt_text?: string;
  is_cover?: boolean;
  display_order?: number;
}
