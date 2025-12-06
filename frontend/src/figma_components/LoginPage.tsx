import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../figmalib/supabase';

interface LoginPageProps {
  onLogin: () => void;
  onGuestLogin: () => void;
  onSignUpClick: () => void;
}

export function LoginPage({ onLogin, onGuestLogin, onSignUpClick }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log('=== LOGIN DEBUG ===');
      console.log('User logged in:', data.user?.id);
      console.log('Session exists:', !!data.session);
      console.log('==================');
      
      if (data.user && data.session) {
        // Small delay to ensure auth state is propagated
        setTimeout(() => {
          onLogin();
        }, 500);
      } else if (data.user && !data.session) {
        setError('Email not verified. Please check your inbox and click the verification link.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#991B1B] rounded-lg mx-auto mb-4" />
          <h1 className="text-white mb-2">
            TopTrait
          </h1>
          <p className="text-gray-500">Find your perfect USC roommate</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#141414] rounded-lg border border-white/10 p-8">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6 bg-[#991B1B]/10 border-[#991B1B]/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Login */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            variant="outline"
            className="w-full mb-6 h-12 bg-transparent border-white/20 hover:bg-white/5 hover:border-white/30 text-white"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <Separator className="bg-white/10" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#141414] px-3 text-gray-500">
              or
            </span>
          </div>

          {/* Username/Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-400">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-600 focus:border-[#991B1B]/50"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-400">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-600 focus:border-[#991B1B]/50"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#991B1B] hover:bg-[#7d1616] text-white"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Guest Login */}
          <div className="mt-4">
            <Button
              onClick={onGuestLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 bg-transparent border-white/20 hover:bg-white/5 hover:border-white/30 text-gray-400"
            >
              Continue as Guest
            </Button>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <button className="text-gray-400 hover:text-white transition-colors">
              Forgot password?
            </button>
            <p className="text-gray-500">
              Don't have an account?{' '}
              <button 
                onClick={onSignUpClick}
                className="text-[#991B1B] hover:text-[#7d1616] transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6">
          USC students only
        </p>
      </div>
    </div>
  );
}