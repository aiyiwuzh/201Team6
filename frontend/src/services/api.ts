import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Basic demo endpoints
export const getHello = async () => {
  const response = await api.get('/hello');
  return response.data;
};

export const getStatus = async () => {
  const response = await api.get('/status');
  return response.data;
};

export const postEcho = async (message: string) => {
  const response = await api.post('/echo', { message });
  return response.data;
};

// CRUD operations for Items
export interface Item {
  id?: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getAllItems = async (): Promise<Item[]> => {
  const response = await api.get('/items');
  return response.data;
};

export const getItemById = async (id: number): Promise<Item> => {
  const response = await api.get(`/items/${id}`);
  return response.data;
};

export const createItem = async (item: Item): Promise<Item> => {
  const response = await api.post('/items', item);
  return response.data;
};

export const updateItem = async (id: number, item: Item): Promise<Item> => {
  const response = await api.put(`/items/${id}`, item);
  return response.data;
};

export const deleteItem = async (id: number): Promise<void> => {
  await api.delete(`/items/${id}`);
};

export const deleteAllItems = async (): Promise<void> => {
  await api.delete('/items');
};

// Profile CRUD operations
export interface ProfileAPI {
  id?: string;
  user_id: string;
  email?: string | null;
  full_name?: string;
  age?: number | null;
  major?: string;
  school?: string;
  year?: string;
  bio?: string;
  budget_min?: number | null;
  budget_max?: number | null;
  cleanliness_rating?: number | null;
  // Added lifestyle fields to match frontend
  social_level?: number | null;
  study_habits?: string | null;   // "", "light", "balanced", "intense", null
  sleep_schedule?: string | null; // "", "balanced", "early", "late", null
  guests?: string | null;         // "", "never", "rarely", "sometimes", "often", null
  drinking?: string | null;       // "", "no", "yes", null
  created_at?: string;
  updated_at?: string;
}

export const createProfileAPI = async (profile: ProfileAPI): Promise<ProfileAPI> => {
  const response = await api.post('/profiles', profile);
  return response.data;
};

export const getProfileByUserIdAPI = async (userId: string): Promise<ProfileAPI> => {
  const response = await api.get(`/profiles/user/${userId}`);
  return response.data;
};

export const updateProfileAPI = async (userId: string, profileData: Partial<ProfileAPI>): Promise<ProfileAPI> => {
  const response = await api.put(`/profiles/user/${userId}`, profileData);
  return response.data;
};

export const getAllProfilesAPI = async (excludeUserId?: string): Promise<ProfileAPI[]> => {
  const params = excludeUserId ? { excludeUserId } : {};
  const response = await api.get('/profiles', { params });
  return response.data;
};

// Swipe CRUD operations
export interface SwipeAPI {
  id?: string;
  swiper_id: string;
  swiped_id: string;
  action: 'approve' | 'decline';
  is_approved: boolean;
  created_at?: string;
  timestamp?: string;
}

export interface MatchAPI {
  id?: string;
  user1_id: string;
  user2_id: string;
  is_active?: boolean;
  created_at?: string;
  matched_at?: string;
}

export interface SwipeResponseAPI {
  swipe: SwipeAPI;
  match: MatchAPI | null;
}

export const createSwipeAPI = async (swiperId: string, swipedId: string, action: 'approve' | 'decline'): Promise<SwipeResponseAPI> => {
  const response = await api.post('/swipes', {
    swiper_id: swiperId,
    swiped_id: swipedId,
    action: action
  });
  return response.data;
};

export const getUserSwipesAPI = async (userId: string): Promise<SwipeAPI[]> => {
  const response = await api.get(`/swipes/user/${userId}`);
  return response.data;
};

export const checkSwipeAPI = async (swiperId: string, swipedId: string): Promise<SwipeAPI | null> => {
  try {
    const response = await api.get('/swipes/check', {
      params: { swiper: swiperId, swiped: swipedId }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Match CRUD operations
export const getUserMatchesAPI = async (userId: string): Promise<MatchAPI[]> => {
  const response = await api.get(`/matches/user/${userId}`);
  return response.data;
};

export const getActiveUserMatchesAPI = async (userId: string): Promise<MatchAPI[]> => {
  const response = await api.get(`/matches/user/${userId}/active`);
  return response.data;
};

export const deleteMatchAPI = async (matchId: string): Promise<void> => {
  await api.delete(`/matches/${matchId}`);
};

export const deactivateMatchAPI = async (matchId: string): Promise<MatchAPI> => {
  const response = await api.put(`/matches/${matchId}/deactivate`);
  return response.data;
};

// Match Score operations
export interface MatchScoreResponse {
  score: number;
  user1_id: string;
  user2_id: string;
}

export interface MatchScoreBreakdown {
  overall_score: number;
  category_scores: {
    budget: number;
    lifestyle: number;
    academic: number;
    preferences: number;
    cleanliness: number;
  };
  shared_traits: string[];
  shared_traits_count: number;
  ranked_factors: Array<{
    category: string;
    score: number;
    weight: number;
    weighted_score: number;
  }>;
}

export const getMatchScoreAPI = async (user1Id: string, user2Id: string): Promise<MatchScoreResponse> => {
  const response = await api.get('/match-score', {
    params: { user1: user1Id, user2: user2Id }
  });
  return response.data;
};

export const getMatchScoreBreakdownAPI = async (user1Id: string, user2Id: string): Promise<MatchScoreBreakdown> => {
  const response = await api.get('/match-score/detailed', {
    params: { user1: user1Id, user2: user2Id }
  });
  return response.data;
};

export default api;