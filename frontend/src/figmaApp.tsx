import { useState, useEffect } from 'react';
import { CoverPage } from './components/CoverPage';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { ProfilePage } from './components/ProfilePage';
import { SwipingPage } from './components/SwipingPage';
import { MatchesPage } from './components/MatchesPage';
import { MessagingPage } from './components/MessagingPage';
import { SettingsPage } from './components/SettingsPage';
import { Home, User, Heart, MessageCircle, Settings } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { supabase } from './lib/supabase';
import { deleteAllUserData } from './lib/database';

type Page = 'swiping' | 'profile' | 'matches' | 'messages' | 'settings';
type AuthPage = 'login' | 'signup';

export default function App() {
  const [showCover, setShowCover] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [currentPage, setCurrentPage] = useState<Page>('swiping');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      
      // If user logs out, reset state
      if (!session) {
        setIsGuest(false);
        setAuthPage('login');
        setCurrentPage('swiping');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartChat = (matchId: string) => {
    setSelectedMatchId(matchId);
    setCurrentPage('messages');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setIsGuest(false);
  };

  const handleGuestLogin = () => {
    setIsAuthenticated(true);
    setIsGuest(true);
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
    setIsGuest(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsGuest(false);
    setAuthPage('login');
    setCurrentPage('swiping');
  };

  const handleDeleteAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      try {
        // Delete all user data from database
        await deleteAllUserData(user.id);
        
        // Delete auth account
        // Note: This requires admin privileges, so in production you'd call a backend endpoint
        // For now, we'll just sign them out
        await supabase.auth.signOut();
        
        setIsAuthenticated(false);
        setIsGuest(false);
        setAuthPage('login');
        setCurrentPage('swiping');
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  // Show cover page on initial load
  if (showCover) {
    return <CoverPage onEnter={() => setShowCover(false)} />;
  }

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show login/signup page if not authenticated
  if (!isAuthenticated) {
    if (authPage === 'signup') {
      return (
        <SignUpPage
          onSignUp={handleSignUp}
          onBackToLogin={() => setAuthPage('login')}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onGuestLogin={handleGuestLogin}
        onSignUpClick={() => setAuthPage('signup')}
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfilePage />;
      case 'swiping':
        return <SwipingPage isGuest={isGuest} />;
      case 'matches':
        return <MatchesPage onStartChat={handleStartChat} isGuest={isGuest} />;
      case 'messages':
        return <MessagingPage matchId={selectedMatchId} onBack={() => setCurrentPage('matches')} isGuest={isGuest} />;
      case 'settings':
        return <SettingsPage onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />;
      default:
        return <SwipingPage isGuest={isGuest} />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: { background: '#141414', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
        }}
      />
      {/* Header */}
      <header className="bg-[#141414] border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#991B1B] rounded-lg" />
              <h1 className="text-white">TopTrait</h1>
              {isGuest && (
                <span className="ml-2 px-2 py-1 bg-[#D97706]/20 text-[#D97706] rounded text-xs border border-[#D97706]/30">
                  Guest Mode
                </span>
              )}
            </div>
            <div className="hidden md:flex gap-6">
              <button
                onClick={() => setCurrentPage('swiping')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'swiping' ? 'bg-[#991B1B] text-white' : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <Home size={20} />
                <span>Discover</span>
              </button>
              <button
                onClick={() => setCurrentPage('matches')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'matches' ? 'bg-[#991B1B] text-white' : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <Heart size={20} />
                <span>Matches</span>
              </button>
              <button
                onClick={() => setCurrentPage('profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'profile' ? 'bg-[#991B1B] text-white' : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <User size={20} />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setCurrentPage('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'settings' ? 'bg-[#991B1B] text-white' : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-white/10">
        <div className="flex justify-around items-center py-3">
          <button
            onClick={() => setCurrentPage('swiping')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              currentPage === 'swiping' ? 'text-[#991B1B]' : 'text-gray-500'
            }`}
          >
            <Home size={24} />
            <span className="text-xs">Discover</span>
          </button>
          <button
            onClick={() => setCurrentPage('matches')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              currentPage === 'matches' ? 'text-[#991B1B]' : 'text-gray-500'
            }`}
          >
            <Heart size={24} />
            <span className="text-xs">Matches</span>
          </button>
          <button
            onClick={() => setCurrentPage('profile')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              currentPage === 'profile' ? 'text-[#991B1B]' : 'text-gray-500'
            }`}
          >
            <User size={24} />
            <span className="text-xs">Profile</span>
          </button>
          <button
            onClick={() => setCurrentPage('settings')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              currentPage === 'settings' ? 'text-[#991B1B]' : 'text-gray-500'
            }`}
          >
            <Settings size={24} />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}