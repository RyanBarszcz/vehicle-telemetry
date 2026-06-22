export type Vehicle = {
  id: string;

  year: number;
  make: string;
  model: string;
  trim: string | null;

  nickname: string | null;
  vin: string | null;
  image_url: string | null;

  created_at: string;
  updated_at: string;
};