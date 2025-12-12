import { supabase } from './supabase';
import { Profile, Message } from '../types/profile';
import { createProfileAPI, getProfileByUserIdAPI, updateProfileAPI, getAllProfilesAPI, createSwipeAPI, getUserSwipesAPI, getUserMatchesAPI, deleteMatchAPI, getMatchScoreAPI, getMatchScoreBreakdownAPI } from '../services/api';

// ========== PROFILE FUNCTIONS ==========

export async function createProfile(userId: string, profileData: Partial<Profile>) {
  try {
    const profile = await createProfileAPI({
      user_id: userId,
      email: profileData.email || null,
      full_name: profileData.full_name || '',
      age: profileData.age || null,
      major: profileData.major || '',
      school: profileData.school || '',
      year: profileData.year || '',
      bio: profileData.bio || '',
	  budget_min: profileData.budget_min ?? null,
	  budget_max: profileData.budget_max ?? null,

	       cleanliness_rating: profileData.cleanliness_rating ?? null,
	       social_level: profileData.social_level ?? null,
	       study_habits: profileData.study_habits ?? null,
	       sleep_schedule: profileData.sleep_schedule ?? null,
	       guests: profileData.guests ?? null,
	       drinking: profileData.drinking ?? null,
    });
    return profile;
  } catch (error: any) {
    console.error('Error creating profile:', error);
    throw new Error(error.response?.data || error.message || 'Failed to create profile');
  }
}

export async function getProfile(userId: string) {
  try {
    const profile = await getProfileByUserIdAPI(userId);
    return profile;
  } catch (error: any) {
    // Return null if profile not found (404)
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error getting profile:', error);
    throw new Error(error.response?.data || error.message || 'Failed to get profile');
  }
}

export async function updateProfile(userId: string, profileData: Partial<Profile>) {
  try {
    const profile = await updateProfileAPI(userId, {
      email: profileData.email,
      full_name: profileData.full_name,
      age: profileData.age,
      major: profileData.major,
      school: profileData.school,
      year: profileData.year,
      bio: profileData.bio,
      budget_min: profileData.budget_min,
      budget_max: profileData.budget_max,
      cleanliness_rating: profileData.cleanliness_rating,
	  social_level: profileData.social_level,
	  study_habits: profileData.study_habits,
	  sleep_schedule: profileData.sleep_schedule,
	  guests: profileData.guests,
	  drinking: profileData.drinking,
    });
    return profile;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    throw new Error(error.response?.data || error.message || 'Failed to update profile');
  }
}

export async function getAllProfiles(excludeUserId?: string) {
  try {
    const profiles = await getAllProfilesAPI(excludeUserId);
    return profiles || [];
  } catch (error: any) {
    console.error('Error getting all profiles:', error);
    throw new Error(error.response?.data || error.message || 'Failed to get profiles');
  }
}

// ========== SWIPE FUNCTIONS ==========

export async function createSwipe(swiperId: string, swipedId: string, action: 'approve' | 'decline') {
  try {
    const result = await createSwipeAPI(swiperId, swipedId, action);
    return result;
  } catch (error: any) {
    console.error('Error creating swipe:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to create swipe');
  }
}

export async function getUserSwipes(userId: string) {
  try {
    const swipes = await getUserSwipesAPI(userId);
    return swipes || [];
  } catch (error: any) {
    console.error('Error getting user swipes:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to get swipes');
  }
}

// ========== MATCH FUNCTIONS ==========

export async function getUserMatches(userId: string) {
  try {
    const matches = await getUserMatchesAPI(userId);
    
    // Manually fetch profiles for matched users
    const matchesWithProfiles = await Promise.all(
      matches.map(async (match) => {
        const matchedUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
        
        // Fetch the matched user's profile using backend API
        try {
          const profile = await getProfileByUserIdAPI(matchedUserId);
          return {
            ...match,
            matchedUser: profile,
          };
        } catch (error) {
          console.error(`Error fetching profile for user ${matchedUserId}:`, error);
          return {
            ...match,
            matchedUser: null,
          };
        }
      })
    );
    
    return matchesWithProfiles;
  } catch (error: any) {
    console.error('Error getting user matches:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to get matches');
  }
}

export async function deleteMatch(matchId: string) {
  try {
    await deleteMatchAPI(matchId);
  } catch (error: any) {
    console.error('Error deleting match:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to delete match');
  }
}

// ========== MATCH SCORE FUNCTIONS ==========

export async function getMatchScore(user1Id: string, user2Id: string): Promise<number> {
  try {
    const result = await getMatchScoreAPI(user1Id, user2Id);
    return result.score;
  } catch (error: any) {
    console.error('Error getting match score:', error);
    // Return default score if calculation fails
    return 50;
  }
}

export async function getMatchScoreBreakdown(user1Id: string, user2Id: string) {
  try {
    const breakdown = await getMatchScoreBreakdownAPI(user1Id, user2Id);
    return breakdown;
  } catch (error: any) {
    console.error('Error getting match score breakdown:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to get match score breakdown');
  }
}

// ========== MESSAGE FUNCTIONS ==========

export async function sendMessage(matchId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: senderId,
      content,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMessages(matchId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export function subscribeToMessages(matchId: string, callback: (message: Message) => void) {
  const subscription = supabase
    .channel(`messages:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return subscription;
}

export async function deleteAllUserData(userId: string) {
  // Delete in order: messages, matches, swipes, profile
  
  // Delete messages where user is in a match
  const matches = await getUserMatches(userId);
  for (const match of matches) {
    await supabase.from('messages').delete().eq('match_id', match.id);
  }

  // Delete matches
  await supabase.from('matches').delete().or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  // Delete swipes
  await supabase.from('swipes').delete().eq('swiper_id', userId);
  await supabase.from('swipes').delete().eq('swiped_id', userId);

  // Delete profile
  await supabase.from('profiles').delete().eq('user_id', userId);
}
