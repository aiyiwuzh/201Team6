/**
 * Profile Type Definition
 * Matches the simplified profiles table schema in Supabase
 */

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string;
  age: number | null;
  major: string;
  school: string;
  year: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | '';
  bio: string;
  budget_min: number | null;
  budget_max: number | null;
  cleanliness_rating: number | null; // 1-10 scale
  // NEW lifestyle fields
  social_level: number | null; // 1-10 scale
  study_habits: 'light' | 'balanced' | 'intense' | '' | null;
  sleep_schedule: 'early' | 'late' | 'balanced' | '' | null;
  guests: 'never' | 'rarely' | 'sometimes' | 'often' | '' | null;
  drinking: 'no' | 'yes' | '' | null;
  created_at: string;
  updated_at: string;
}

/**
 * Partial profile for updates (all fields optional except user_id)
 */
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

/**
 * Profile creation data (excludes auto-generated fields)
 */
export type ProfileCreate = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;

/**
 * Other database types (for compatibility with existing code)
 */

export interface Swipe {
  id: string;
  swiper_id: string;
  swiped_id: string;
  action: 'approve' | 'decline';
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  is_active: boolean;
  created_at: string;
  matched_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  timestamp: string;
}

