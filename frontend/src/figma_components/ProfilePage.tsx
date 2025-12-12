import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Save, User2, AlertCircle } from 'lucide-react';
import { supabase } from '../figmalib/supabase';
import { getProfile, updateProfile, createProfile } from '../figmalib/database';
import { toast } from 'sonner';
import { Profile } from '../types/profile';

export function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: '',
    age: null,
    major: '',
    school: '',
    year: '',
    bio: '',
    budget_min: null,
    budget_max: null,
    cleanliness_rating: 5,
    social_level: 5,           // INT slider (was noise_tolerance)
    study_habits: 'balanced',  // TEXT dropdown (was numeric)
    sleep_schedule: 'balanced',// TEXT dropdown
    guests: 'sometimes',       // TEXT dropdown (was guests_frequency)
    drinking: 'no',            // TEXT dropdown (replace smoking/pets)
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [_userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      console.log('=== PROFILE PAGE DEBUG ===');
      console.log('Auth error:', authError);
      console.log('User from getUser():', user?.id);
      
      // Also check session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session exists:', !!session);
      console.log('========================');
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        toast.error('You must be logged in to view your profile. Your email may not be verified yet.');
        setIsLoading(false);
        return;
      }

      console.log('Loading profile for user:', user.id);
      setUserId(user.id);

      const existingProfile = await getProfile(user.id);
      console.log('Loaded profile:', existingProfile);

      if (existingProfile) {
          const validStudyHabits = ["light", "balanced", "intense"] as const;
          const validSleepSchedule = ["early", "late", "balanced", ""] as const;
          const validGuests = ["never", "rarely", "sometimes", "often", ""] as const;
          const validDrinking = ["no", "yes", ""] as const;
          setProfile({
          full_name: existingProfile.full_name || '',
          age: existingProfile.age,
          major: existingProfile.major || '',
          school: existingProfile.school || '',
          year: (existingProfile.year || '') as Profile['year'],
          bio: existingProfile.bio || '',
          budget_min: existingProfile.budget_min,
          budget_max: existingProfile.budget_max,
          cleanliness_rating: existingProfile.cleanliness_rating || 5,
          social_level: existingProfile.social_level ?? 5,
          study_habits: validStudyHabits.includes(existingProfile.study_habits as any) ? (existingProfile.study_habits as typeof validStudyHabits[number]) : 'balanced',
          sleep_schedule: validSleepSchedule.includes(existingProfile.sleep_schedule as any) ? (existingProfile.sleep_schedule as typeof validSleepSchedule[number]) : 'balanced',
          guests: validGuests.includes(existingProfile.guests as any) ? (existingProfile.guests as typeof validGuests[number]) : 'sometimes',
          drinking: validDrinking.includes(existingProfile.drinking as any) ? (existingProfile.drinking as typeof validDrinking[number]) : 'no',
        });
      } else {
        console.log('No existing profile found - will create on save');
        // Keep default empty state for new profile
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      console.error('Error details:', error.message);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (profile.budget_min && profile.budget_max && profile.budget_max < profile.budget_min) {
      toast.error('Maximum budget must be greater than or equal to minimum budget');
      return;
    }

    if (profile.cleanliness_rating && (profile.cleanliness_rating < 1 || profile.cleanliness_rating > 10)) {
      toast.error('Cleanliness rating must be between 1 and 10');
      return;
    }

    // NEW: Validate social level to match backend (1-10)
    if (profile.social_level && (profile.social_level < 1 || profile.social_level > 10)) {
      toast.error('Social level must be between 1 and 10');
      return;
    }

    setIsSaving(true);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        toast.error('Authentication error. Please log in again.');
        return;
      }
      
      if (!user) {
        toast.error('You must be logged in to save your profile');
        return;
      }

      console.log('Saving profile for user:', user.id);

      // Don't include user_id or email in updates - they're set on create only
      const profileData: any = {
        full_name: profile.full_name || '',
        age: profile.age,
        major: profile.major || '',
        school: profile.school || '',
        year: profile.year || '',
        bio: profile.bio || '',
        budget_min: profile.budget_min,
        budget_max: profile.budget_max,
		cleanliness_rating: typeof profile.cleanliness_rating === 'number' ? profile.cleanliness_rating : 5,
		social_level: typeof profile.social_level === 'number' ? profile.social_level : 5,
		study_habits: profile.study_habits,
		sleep_schedule: profile.sleep_schedule,
		guests: profile.guests,
		drinking: profile.drinking,
		photo_url: profile.photo_url || null,

      };

      console.log('Profile data to save:', profileData);

      // Try to get existing profile
      let existingProfile = null;
      try {
        existingProfile = await getProfile(user.id);
        console.log('Existing profile:', existingProfile);
      } catch (error: any) {
        console.log('No existing profile found (will create new):', error.message);
      }
      
      if (existingProfile && existingProfile.id) {
        console.log('Updating existing profile...');
        // Don't update email on existing profiles to avoid conflicts
        const result = await updateProfile(user.id, profileData);
        console.log('Update result:', result);
        toast.success('Profile updated successfully!');
      } else {
        console.log('Creating new profile...');
        // Include email only on creation
        const createData = {
          ...profileData,
          email: user.email || null,
        };
        const result = await createProfile(user.id, createData);
        console.log('Create result:', result);
        toast.success('Profile created successfully!');
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      toast.error(`Failed to save profile: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof Profile>(field: K, value: Profile[K]) => {
    console.log(`updateField: ${String(field)} = ${value}`);
    setProfile(prev => {
      const updated = { ...prev, [field]: value };
      console.log('Updated profile:', updated);
      return updated;
    });
  };

  const GUESTS_OPTIONS = [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely' },
    { value: 'sometimes', label: 'Sometimes' },
    { value: 'often', label: 'Often' },
  ];
  const SLEEP_OPTIONS = [
    { value: 'early', label: 'Early Sleeper' },
    { value: 'late', label: 'Night Owl' },
    { value: 'balanced', label: 'Balanced' },
  ];
  const STUDY_OPTIONS = [
    { value: 'light', label: 'Light' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'intense', label: 'Intense' },
  ];
  const YES_NO_OPTIONS = [
    { value: 'no', label: 'No' },
    { value: 'yes', label: 'Yes' },
  ];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-20 md:pb-0 px-4">
        <div className="bg-[#141414] rounded-xl border border-white/10 p-8 shadow-2xl">
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="w-12 h-12 border-4 border-[#991B1B] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-400 text-lg">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  const USC_SCHOOLS = [
    'Dornsife College of Letters, Arts and Sciences',
    'Marshall School of Business',
    'Viterbi School of Engineering',
    'Annenberg School for Communication and Journalism',
    'School of Cinematic Arts',
    'Roski School of Art and Design',
    'Thornton School of Music',
    'School of Architecture',
    'Rossier School of Education',
    'Gould School of Law',
    'Keck School of Medicine',
    'Price School of Public Policy',
    'Suzanne Dworak-Peck School of Social Work',
    'Herman Ostrow School of Dentistry',
    'Alfred E. Mann School of Pharmacy',
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-0 px-4">
      <div className="bg-gradient-to-br from-[#141414] to-[#0a0a0a] rounded-xl border border-white/10 p-6 md:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#991B1B] to-[#7d1616] rounded-xl shadow-lg shadow-[#991B1B]/20">
              <User2 className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold">Your Profile</h2>
              <p className="text-gray-400 text-sm mt-0.5">Manage your roommate profile information</p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-gradient-to-r from-[#991B1B] to-[#7d1616] hover:from-[#7d1616] hover:to-[#991B1B] text-white shadow-lg shadow-[#991B1B]/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto"
          >
            <Save size={16} className="mr-2" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>

        {/* Basic Information Section */}
        <div className="space-y-6 mb-8 bg-white/[0.02] p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-1.5 h-6 bg-gradient-to-b from-[#991B1B] to-[#7d1616] rounded-full shadow-lg shadow-[#991B1B]/50"></div>
            <h3 className="text-white font-semibold text-lg">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
			<Label htmlFor="full_name" className="text-gray-300 mb-2 block font-medium">
				Full Name <span className="text-[#991B1B]">*</span>
			</Label>
              <Input
                id="full_name"
                value={profile.full_name || ''}
                onChange={(e) => updateField('full_name', e.target.value)}
                placeholder="Enter your full name"
                className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-[#991B1B] focus:ring-2 focus:ring-[#991B1B]/20 transition-all duration-200"
              />
            </div>

            <div>
              <Label htmlFor="age" className="text-gray-300 mb-2 block font-medium">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                min="17"
                max="100"
                value={profile.age || ''}
                onChange={(e) => updateField('age', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Enter your age"
                className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-[#991B1B] focus:ring-2 focus:ring-[#991B1B]/20 transition-all duration-200"
              />
            </div>

            <div>
              <Label htmlFor="year" className="text-gray-300 mb-2 block font-medium">
                Academic Year
              </Label>
              <Select
                value={profile.year || ''}
                onValueChange={(value) => updateField('year', value as Profile['year'])}
              >
                <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white data-[placeholder]:text-gray-500 focus:border-[#991B1B] focus:ring-2 focus:ring-[#991B1B]/20 transition-all duration-200">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 shadow-xl">
                  <SelectItem value="freshman" className="text-white hover:bg-[#991B1B]/20 focus:bg-[#991B1B]/20">Freshman</SelectItem>
                  <SelectItem value="sophomore" className="text-white hover:bg-[#991B1B]/20 focus:bg-[#991B1B]/20">Sophomore</SelectItem>
                  <SelectItem value="junior" className="text-white hover:bg-[#991B1B]/20 focus:bg-[#991B1B]/20">Junior</SelectItem>
                  <SelectItem value="senior" className="text-white hover:bg-[#991B1B]/20 focus:bg-[#991B1B]/20">Senior</SelectItem>
                  <SelectItem value="graduate" className="text-white hover:bg-[#991B1B]/20 focus:bg-[#991B1B]/20">Graduate Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            </div>

        {/* Academic Information Section */}
        <div className="space-y-6 mb-8 bg-white/[0.02] p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-1.5 h-6 bg-gradient-to-b from-[#991B1B] to-[#7d1616] rounded-full shadow-lg shadow-[#991B1B]/50"></div>
            <h3 className="text-white font-semibold text-lg">Academic Information</h3>
            </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label htmlFor="school" className="text-gray-300 mb-2 block font-medium">
                USC School
              </Label>
              <Select
                value={profile.school || ''}
                onValueChange={(value) => updateField('school', value)}
              >
                <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white data-[placeholder]:text-gray-500 focus:border-[#991B1B] focus:ring-2 focus:ring-[#991B1B]/20 transition-all duration-200">
                  <SelectValue placeholder="Select your school" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 max-h-[300px] shadow-xl">
                  {USC_SCHOOLS.map(school => (
                    <SelectItem 
                      key={school} 
                      value={school}
                      className="text-white hover:bg-[#991B1B]/20 focus:bg-[#991B1B]/20"
                    >
                      {school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="major" className="text-gray-300 mb-2 block font-medium">
                Major
              </Label>
              <Input
                id="major"
                value={profile.major || ''}
                onChange={(e) => updateField('major', e.target.value)}
                placeholder="e.g., Computer Science, Business Administration"
                className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-[#991B1B] focus:ring-2 focus:ring-[#991B1B]/20 transition-all duration-200"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-gray-300 mb-2 block font-medium">
                Bio
              </Label>
            <Textarea
              id="bio"
                value={profile.bio || ''}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Tell potential roommates about yourself... (interests, hobbies, what you're looking for)"
              rows={4}
                className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-[#991B1B] focus:ring-2 focus:ring-[#991B1B]/20 resize-none transition-all duration-200"
              />
              <p className="text-gray-400 text-xs mt-2 flex items-start gap-1.5">
                <span className="text-[#991B1B] mt-0.5">💡</span>
                <span>Share what makes you unique and what you're looking for in a roommate</span>
              </p>
            </div>
          </div>
        </div>

        {/* Housing Budget Section */}
        <div className="space-y-6 mb-8 bg-white/[0.02] p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-1.5 h-6 bg-gradient-to-b from-[#991B1B] to-[#7d1616] rounded-full shadow-lg shadow-[#991B1B]/50"></div>
            <h3 className="text-white font-semibold text-lg">Housing Budget</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="budget_min" className="text-gray-300 mb-2 block font-medium">
                Minimum Budget <span className="text-gray-500 text-sm font-normal">($/month)</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                  id="budget_min"
                type="number"
                  min="0"
                  value={profile.budget_min || ''}
                  onChange={(e) => updateField('budget_min', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="800"
                  className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-[#991B1B] focus:ring-2 focus:ring-[#991B1B]/20 transition-all duration-200 pl-7"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="budget_max" className="text-gray-300 mb-2 block font-medium">
                Maximum Budget <span className="text-gray-500 text-sm font-normal">($/month)</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                  id="budget_max"
                type="number"
                  min="0"
                  value={profile.budget_max || ''}
                  onChange={(e) => updateField('budget_max', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="1500"
                  className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-[#991B1B] focus:ring-2 focus:ring-[#991B1B]/20 transition-all duration-200 pl-7"
                />
              </div>
            </div>
          </div>

          {profile.budget_min && profile.budget_max && profile.budget_max < profile.budget_min && (
            <div className="flex items-center gap-2 text-[#991B1B] bg-[#991B1B]/10 p-4 rounded-lg border border-[#991B1B]/30 animate-pulse">
              <AlertCircle size={18} className="flex-shrink-0" />
              <p className="text-sm font-medium">Maximum budget should be greater than or equal to minimum budget</p>
            </div>
          )}
        </div>

        {/* Lifestyle Section */}
        <div className="space-y-6 bg-white/[0.02] p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-1.5 h-6 bg-gradient-to-b from-[#991B1B] to-[#7d1616] rounded-full shadow-lg shadow-[#991B1B]/50"></div>
            <h3 className="text-white font-semibold text-lg">Lifestyle</h3>
          </div>

          {/* Cleanliness (existing) */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <Label className="text-gray-300 block mb-1 font-medium">
                  Cleanliness Level
                </Label>
                <p className="text-gray-400 text-sm">
                  How clean do you keep your living space?
                </p>
              </div>
              <div className="flex flex-col items-center bg-gradient-to-br from-[#991B1B] to-[#7d1616] rounded-xl p-4 min-w-[80px] shadow-lg shadow-[#991B1B]/30">
                <div className="text-white font-bold text-3xl">
                  {profile.cleanliness_rating || 5}
                </div>
                <div className="text-white/70 text-xs mt-1">/ 10</div>
              </div>
            </div>
            <Slider
              value={[Number(profile.cleanliness_rating ?? 5)]}
              onValueChange={(value: number[]) => {
                console.log('Slider value changed:', value);
                const newValue = value[0];
                console.log('Setting cleanliness to:', newValue);
                setProfile(prev => ({ ...prev, cleanliness_rating: newValue }));
              }}
              min={1}
              max={10}
              step={1}
              className="py-2 [&_[role=slider]]:bg-gradient-to-br [&_[role=slider]]:from-[#991B1B] [&_[role=slider]]:to-[#7d1616] [&_[role=slider]]:border-[#991B1B] [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-[#991B1B]/50 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200 hover:[&_[role=slider]]:scale-110 [&_.relative]:bg-white/10 [&_.relative]:h-2 [&_.relative]:rounded-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-3 px-1">
              <div className="flex flex-col items-start">
                <span className="font-medium">1</span>
                <span className="text-[10px] text-gray-500">Messy</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-medium">5</span>
                <span className="text-[10px] text-gray-500">Average</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium">10</span>
                <span className="text-[10px] text-gray-500">Spotless</span>
              </div>
            </div>
          </div>

          {/* Social Level (slider) */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <Label className="text-gray-300 block mb-1 font-medium">
                  Social Level
                </Label>
                <p className="text-gray-400 text-sm">
                  How social do you prefer your living environment to be?
                </p>
              </div>
              <div className="flex flex-col items-center bg-gradient-to-br from-[#991B1B] to-[#7d1616] rounded-xl p-4 min-w-[80px] shadow-lg shadow-[#991B1B]/30">
                <div className="text-white font-bold text-3xl">
                  {profile.social_level ?? 5}
                </div>
                <div className="text-white/70 text-xs mt-1">/ 10</div>
              </div>
            </div>
            <Slider
              value={[Number(profile.social_level ?? 5)]}
              onValueChange={(value: number[]) => setProfile(prev => ({ ...prev, social_level: value[0] }))}
              min={1}
              max={10}
              step={1}
              className="py-2 [&_[role=slider]]:bg-gradient-to-br [&_[role=slider]]:from-[#991B1B] [&_[role=slider]]:to-[#7d1616] [&_[role=slider]]:border-[#991B1B] [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-[#991B1B]/50 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200 hover:[&_[role=slider]]:scale-110 [&_.relative]:bg-white/10 [&_.relative]:h-2 [&_.relative]:rounded-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-3 px-1">
              <div className="flex flex-col items-start">
                <span className="font-medium">1</span>
                <span className="text-[10px] text-gray-500">Not social</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-medium">5</span>
                <span className="text-[10px] text-gray-500">Medium social</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium">10</span>
                <span className="text-[10px] text-gray-500">Super social</span>
              </div>
            </div>
          </div>

          {/* Study Habits (dropdown TEXT) */}
          <div>
            <Label className="text-gray-300 mb-2 block font-medium">Study Habits</Label>
            <Select
              value={(profile.study_habits as string) || 'balanced'}
              onValueChange={(value) => setProfile(prev => ({ ...prev, study_habits: value as "" | "light" | "balanced" | "intense" | null }))}
            >
              <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectValue placeholder="Select how intensely you study at home" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {STUDY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sleep Schedule (dropdown TEXT) */}
          <div>
            <Label className="text-gray-300 mb-2 block font-medium">Sleep Schedule</Label>
            <Select
              value={(profile.sleep_schedule as string) || 'balanced'}
              onValueChange={(value) => setProfile(prev => ({ ...prev, sleep_schedule: value as "" | "balanced" | "early" | "late" | null }))}
            >
              <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectValue placeholder="Select your sleep schedule" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {SLEEP_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Guests (dropdown TEXT) */}
          <div>
            <Label className="text-gray-300 mb-2 block font-medium">Guests Frequency</Label>
            <Select
              value={(profile.guests as string) || 'sometimes'}
              onValueChange={(value) => setProfile(prev => ({ ...prev, guests: value as "" | "never" | "rarely" | "sometimes" | "often" | null }))}
            >
              <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectValue placeholder="How often do you host guests?" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {GUESTS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Drinking (dropdown TEXT) */}
          <div>
            <Label className="text-gray-300 mb-2 block font-medium">Drinking</Label>
            <Select
              value={(profile.drinking as string) || 'no'}
              onValueChange={(value) => setProfile(prev => ({ ...prev, drinking: value as "" | "no" | "yes" | null }))}
            >
              <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectValue placeholder="Do you drink alcohol?" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {YES_NO_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}