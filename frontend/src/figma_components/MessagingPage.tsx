import { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Send, User, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../figmalib/supabase';
import { getMessages, sendMessage, subscribeToMessages } from '../figmalib/database';
import type { Message } from '../figmalib/supabase';

interface MessagingPageProps {
  matchId: string | null;
  onBack: () => void;
  isGuest?: boolean;
}

export function MessagingPage({ matchId, onBack, isGuest = false }: MessagingPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [match, setMatch] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchId && !isGuest) {
      loadMatchAndMessages();
    }
  }, [matchId, isGuest]);

  useEffect(() => {
    if (!matchId || isGuest) return;

    // Subscribe to real-time messages
    const subscription = subscribeToMessages(matchId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [matchId, isGuest]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMatchAndMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !matchId) {
        setIsLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      // Get match details
      const { data: matchData } = await supabase
        .from('matches')
        .select(`
          *,
          user1:profiles!matches_user1_id_fkey(*),
          user2:profiles!matches_user2_id_fkey(*)
        `)
        .eq('id', matchId)
        .single();

      if (matchData) {
        const matchedUser = matchData.user1_id === user.id ? matchData.user2 : matchData.user1;
        setMatch({
          id: matchData.id,
          name: matchedUser.full_name,
          age: matchedUser.age,
          major: matchedUser.major,
        });
      }

      // Load messages
      const conversationMessages = await getMessages(matchId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (isGuest) {
      toast.error('Guest users cannot send messages. Please sign up to start chatting.');
      return;
    }

    if (!newMessage.trim() || !matchId || !currentUserId) return;

    try {
      const message = await sendMessage(matchId, currentUserId, newMessage);
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-20 md:pb-0">
        <div className="bg-[#141414] border border-white/10 rounded-lg p-6">
          <div className="text-center text-gray-400">Loading conversation...</div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="bg-[#141414] border border-white/10 rounded-lg p-12">
          <h2 className="text-white mb-2">Match Not Found</h2>
          <p className="text-gray-400">This conversation doesn't exist.</p>
          <Button onClick={onBack} className="mt-6 bg-[#991B1B] hover:bg-[#7d1616]">
            Back to Matches
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-0">
      <div className="bg-[#141414] border border-white/10 rounded-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)', maxHeight: '700px' }}>
        {/* Chat Header */}
        <div className="flex items-center gap-4 p-4 border-b border-white/10">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft size={20} />
          </Button>

          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <User className="w-6 h-6 text-[#991B1B]" />
          </div>

          <div className="flex-1">
            <h3 className="text-white">{match.name}</h3>
            <p className="text-gray-400">{match.major}</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>Start the conversation!</p>
              <p className="mt-2">Say hi to {match.name.split(' ')[0]} 👋</p>
            </div>
          )}

          {messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser
                      ? 'bg-[#991B1B] text-white'
                      : 'bg-[#1a1a1a] text-gray-200'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${isCurrentUser ? 'text-white/70' : 'text-gray-500'}`}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/10">
          {isGuest ? (
            <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
              <Lock className="mx-auto text-[#991B1B] mb-2" size={32} />
              <p className="text-gray-400">Sign up to send messages</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-600"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-[#991B1B] hover:bg-[#7d1616]"
              >
                <Send size={20} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}