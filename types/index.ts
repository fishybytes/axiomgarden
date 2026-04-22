export interface Plant {
  id: string;
  userId: string;
  name: string;
  templateIndex: number;
  angleVariation: number;
  color: string;
  plantedAt: number; // unix timestamp
  position: number;
}

export interface Checkin {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  plantId: string;
  createdAt: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: number;
}
