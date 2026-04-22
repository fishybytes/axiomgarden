export interface Plant {
  id: string;
  user_id: string;
  name: string;
  template_index: number;
  angle_variation: number;
  color: string;
  planted_at: number; // unix timestamp
  position: number;
}

export interface Checkin {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  plant_id: string;
  created_at: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: number;
}
