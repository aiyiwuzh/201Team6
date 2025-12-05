import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { MessageCircle, Heart, User, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../figmalib/supabase';
import { getUserMatches } from '../figmalib/database';

interface MatchesPageProps {
  onStartChat: (matchId: string) => void;
  isGuest?: boolean;
}

export function MatchesPage({ onStartChat, isGuest = false }: MatchesPageProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isGuest) {
      loadMatches();
    }
  }, [isGuest]);

  const loadMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const userMatches = await getUserMatches(user.id);
      
      // Transform matches to display format
      const transformedMatches = userMatches.map((match: any) => ({
        id: match.id,
        name: match.matchedUser.full_name,
        age: match.matchedUser.age,
        major: match.matchedUser.major,
        school: match.matchedUser.school,
        year: match.matchedUser.year,
        matchedAt: match.created_at,
        lastMessage: null,
        unreadCount: 0,
      }));

      setMatches(transformedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = (matchId: string) => {
    if (isGuest) {
      toast.error('Guest users cannot view matches. Please sign up to access this feature.');
      return;
    }
    onStartChat(matchId);
  };

  if (isGuest) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="bg-[#141414] border border-white/10 rounded-lg p-12">
          <Lock className="mx-auto text-[#991B1B] mb-4" size={64} />
          <h2 className="text-white mb-2">Sign Up to View Matches</h2>
          <p className="text-gray-400">
            Guest users cannot view matches. Create an account to see your matches and start messaging.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-20 md:pb-0">
        <div className="bg-[#141414] border border-white/10 rounded-lg p-6 md:p-8">
          <div className="text-center text-gray-400">Loading matches...</div>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="bg-[#141414] border border-white/10 rounded-lg p-12">
          <Heart className="mx-auto text-[#991B1B] mb-4" size={64} />
          <h2 className="text-white mb-2">No Matches Yet</h2>
          <p className="text-gray-400">
            Start swiping to find fellow Trojans. When you both like each other, you'll see them here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-0">
      <div className="bg-[#141414] border border-white/10 rounded-lg p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-white">Your Matches</h2>
          <p className="text-gray-400 mt-1">
            You have {matches.length} match{matches.length !== 1 ? 'es' : ''} with fellow Trojans
          </p>
        </div>

        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="rounded-lg border border-white/10 hover:border-[#991B1B]/50 hover:bg-white/5 transition-all overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4">
                {/* Profile Photo */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                    <User className="w-8 h-8 text-[#991B1B]" />
                  </div>
                  {match.unreadCount && match.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-[#991B1B] text-white rounded-full w-6 h-6 flex items-center justify-center">
                      <span>{match.unreadCount}</span>
                    </div>
                  )}
                </div>

                {/* Match Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white">{match.name}, {match.age}</h3>
                  <p className="text-gray-400 truncate">{match.major} • {match.year}</p>
                  {match.lastMessage && (
                    <p className="text-gray-500 truncate mt-1">{match.lastMessage}</p>
                  )}
                  {!match.lastMessage && (
                    <p className="text-gray-500 mt-1">Matched {new Date(match.matchedAt).toLocaleDateString()}</p>
                  )}
                </div>

                {/* Message Button */}
                <Button
                  onClick={() => handleStartChat(match.id)}
                  className="bg-[#991B1B] hover:bg-[#7d1616] shrink-0"
                >
                  <MessageCircle size={16} className="mr-2" />
                  <span className="hidden sm:inline">Message</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}