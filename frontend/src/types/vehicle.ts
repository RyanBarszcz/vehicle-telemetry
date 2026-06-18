export type Vehicle = {
  id: string;

  year: number;
  make: string;
  model: string;
  trim?: string;

  nickname?: string;

  vin?: string;

  imageUrl?: string;

  createdAt: string;
  updatedAt: string;
};