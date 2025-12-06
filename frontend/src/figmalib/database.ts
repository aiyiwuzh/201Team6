import { supabase } from './supabase';
import { Profile, Message } from '../types/profile';

// ========== PROFILE FUNCTIONS ==========

export async function createProfile(userId: string, profileData: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      ...profileData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  return data;
}

export async function updateProfile(userId: string, profileData: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllProfiles(excludeUserId?: string) {
  let query = supabase.from('profiles').select('*');
  
  if (excludeUserId) {
    query = query.neq('user_id', excludeUserId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// ========== SWIPE FUNCTIONS ==========

export async function createSwipe(swiperId: string, swipedId: string, action: 'approve' | 'decline') {
  const { data, error } = await supabase
    .from('swipes')
    .insert({
      swiper_id: swiperId,
      swiped_id: swipedId,
      action,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // If this was an approval, check if there's a mutual match
  if (action === 'approve') {
    const match = await checkForMatch(swiperId, swipedId);
    if (match) {
      return { data, match };
    }
  }

  return { data, match: null };
}

export async function getSwipe(swiperId: string, swipedId: string) {
  const { data, error } = await supabase
    .from('swipes')
    .select('*')
    .eq('swiper_id', swiperId)
    .eq('swiped_id', swipedId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getUserSwipes(userId: string) {
  const { data, error } = await supabase
    .from('swipes')
    .select('*')
    .eq('swiper_id', userId);

  if (error) throw error;
  return data || [];
}

async function checkForMatch(swiperId: string, swipedId: string) {
  // Check if the other user also approved
  const { data: reverseSwipe } = await supabase
    .from('swipes')
    .select('*')
    .eq('swiper_id', swipedId)
    .eq('swiped_id', swiperId)
    .eq('action', 'approve')
    .maybeSingle();

  if (reverseSwipe) {
    // Create a match
    return createMatch(swiperId, swipedId);
  }

  return null;
}

// ========== MATCH FUNCTIONS ==========

export async function createMatch(user1Id: string, user2Id: string) {
  const { data, error } = await supabase
    .from('matches')
    .insert({
      user1_id: user1Id,
      user2_id: user2Id,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserMatches(userId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      user1:profiles!matches_user1_id_fkey(*),
      user2:profiles!matches_user2_id_fkey(*)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if (error) throw error;
  
  // Transform the data to include the matched user's profile
  return (data || []).map(match => {
    const matchedUser = match.user1_id === userId ? match.user2 : match.user1;
    return {
      ...match,
      matchedUser,
    };
  });
}

export async function deleteMatch(matchId: string) {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);

  if (error) throw error;
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
