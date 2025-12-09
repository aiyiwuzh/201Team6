import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../figmalib/supabase';
import { createProfile } from '../figmalib/database';
import { toast } from 'sonner';

interface SignUpPageProps {
  onSignUp: () => void;
  onBackToLogin: () => void;
}

export function SignUpPage({ onSignUp, onBackToLogin }: SignUpPageProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation function
  const validatePassword = (pwd: string) => {
    const hasMinLength = pwd.length >= 8;
    const specialCharCount = (pwd.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
    const hasTwoSpecialChars = specialCharCount >= 2;
    return {
      isValid: hasMinLength && hasTwoSpecialChars,
      hasMinLength,
      hasTwoSpecialChars
    };
  };

  const passwordValidation = validatePassword(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (!email.endsWith('@usc.edu')) {
      setIsLoading(false);
      setError('Please use a valid USC email address (@usc.edu)');
      return;
    }

    if (!passwordValidation.isValid) {
      setIsLoading(false);
      if (!passwordValidation.hasMinLength) {
        setError('Password must be at least 8 characters long');
      } else if (!passwordValidation.hasTwoSpecialChars) {
        setError('Password must contain at least 2 special characters');
      }
      return;
    }

    if (password !== confirmPassword) {
      setIsLoading(false);
      setError('Passwords do not match');
      return;
    }

    try {
      // Create auth user (with email verification disabled, user will be auto-confirmed)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (signUpError) throw signUpError;

      console.log('=== SIGN UP DEBUG ===');
      console.log('User created:', data.user?.id);
      console.log('Session exists:', !!data.session);
      console.log('User confirmed:', data.user?.confirmed_at);
      console.log('====================');

      // Check if we have BOTH user and session (session means email confirmation is disabled)
      if (!data.session) {
        // Email confirmation is ENABLED - user needs to verify email
        setError('Please check your email to verify your account, then log in.');
        toast.error('Email verification required! Check your inbox and click the verification link.');
        return;
      }

      if (data.user && data.session) {
        // We have a real session! User is auto-confirmed
        console.log('✅ User has active session - email confirmation is disabled');
        
        console.log('📝 Creating profile for user:', data.user.id);
        console.log('Profile data:', {
          email: data.user.email,
          full_name: `${firstName} ${lastName}`,
        });
        
        try {
          // Create profile with simplified schema
          // user_id is passed as first parameter, not in the data object
          const profileResult = await createProfile(data.user.id, {
            email: data.user.email || null,
            full_name: `${firstName} ${lastName}`,
            age: null,
            major: '',
            school: '',
            year: '',
            bio: '',
            budget_min: null,
            budget_max: null,
            cleanliness_rating: 5, // Default middle value
          });
          
          console.log('✅ Profile created successfully!', profileResult);
          toast.success('Account created successfully! Welcome to TopTrait!');
          
          // Small delay to ensure auth state is propagated
          setTimeout(() => {
            onSignUp();
          }, 500);
          
        } catch (profileError: any) {
          console.error('❌ Error creating profile:', profileError);
          console.error('Error details:', profileError.message);
          console.error('Error response:', profileError.response?.data);
          
          // Show error but still let them log in (profile can be created later)
          toast.error('Account created but profile setup failed. You can complete your profile later.');
          
          setTimeout(() => {
            onSignUp();
          }, 500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            hd: 'usc.edu', // Restrict to USC domain
          }
        }
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed. Please try again.');
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
            Create Your Account
          </h1>
          <p className="text-gray-500">Join TopTrait and find your perfect USC roommate</p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-[#141414] rounded-lg border border-white/10 p-8">
        {error && (
  <Alert className="mb-6 bg-red-900/50 border-red-700 text-white backdrop-blur-sm">
    <AlertCircle className="h-5 w-5 text-red-400" />
    <AlertDescription className="text-red-200 font-medium text-base">
      {error}
    </AlertDescription>
  </Alert>
)}

          {/* Google Sign Up */}
          <Button
            onClick={handleGoogleSignUp}
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
            {isLoading ? 'Signing up...' : 'Continue with Google'}
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <Separator className="bg-white/10" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#141414] px-3 text-gray-500">
              or
            </span>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-gray-400">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="mt-1 bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-600 focus:border-[#991B1B]/50"
                />
              </div>

              <div>
                <Label htmlFor="lastName" className="text-gray-400">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="mt-1 bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-600 focus:border-[#991B1B]/50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-400">USC Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="username@usc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-600 focus:border-[#991B1B]/50"
              />
              <p className="text-xs text-gray-500 mt-1">Must be a valid @usc.edu email</p>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-400">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-600 focus:border-[#991B1B]/50 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Password Requirements */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    {passwordValidation.hasMinLength ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-600" />
                    )}
                    <span className={passwordValidation.hasMinLength ? 'text-green-500' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordValidation.hasTwoSpecialChars ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-600" />
                    )}
                    <span className={passwordValidation.hasTwoSpecialChars ? 'text-green-500' : 'text-gray-500'}>
                      At least 2 special characters (!@#$%^&* etc.)
                    </span>
                  </div>
                  {passwordValidation.isValid && (
                    <div className="flex items-center gap-2 text-xs text-green-500 mt-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Password meets all requirements!</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-400">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1 bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-600 focus:border-[#991B1B]/50 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#991B1B] hover:bg-[#7d1616] text-white"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Already have an account?{' '}
              <button 
                onClick={onBackToLogin}
                className="text-[#991B1B] hover:text-[#7d1616] transition-colors"
              >
                Sign in
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
