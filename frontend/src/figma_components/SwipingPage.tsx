import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X, Heart, MapPin, GraduationCap, Home, DollarSign, Calendar, SlidersHorizontal, BookOpen, Users, Moon, User } from 'lucide-react';
import { UserProfile } from '../figmalib/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { supabase } from '../figmalib/supabase';
import { getAllProfiles, createSwipe, getUserSwipes, getMatchScore } from '../figmalib/database';

interface SwipingPageProps {
  isGuest?: boolean;
}

export function SwipingPage({ isGuest = false }: SwipingPageProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [budgetFilter, setBudgetFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [swipedProfileIds, setSwipedProfileIds] = useState<Set<string>>(new Set());
  const [matchPercentage, setMatchPercentage] = useState<number>(50);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profileUserIdMap, setProfileUserIdMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    loadProfiles();
  }, []);

  // Load match percentage when current profile changes
  useEffect(() => {
    const loadMatchScore = async () => {
      if (!currentUserId || profiles.length === 0) {
        return;
      }

      const targetProfile = profiles[currentIndex];
      if (!targetProfile) {
        return;
      }

      try {
        // Get the target user_id from the map
        const targetUserId = profileUserIdMap.get(targetProfile.id);
        
        if (targetUserId) {
          const score = await getMatchScore(currentUserId, targetUserId);
          setMatchPercentage(score);
        } else {
          setMatchPercentage(50); // Default if not found
        }
      } catch (error) {
        console.error('Error loading match score:', error);
        setMatchPercentage(50); // Default on error
      }
    };

    loadMatchScore();
  }, [currentIndex, profiles, currentUserId, profileUserIdMap]);

  const loadProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Set current user ID for match calculations
      setCurrentUserId(user.id);

      // Get all profiles except current user
      const allProfiles = await getAllProfiles(user.id);
      
      // Get user's swipe history
      const userSwipes = await getUserSwipes(user.id);
      const swipedIds = new Set(userSwipes.map(swipe => swipe.swiped_id));
      setSwipedProfileIds(swipedIds);

      // Filter out already swiped profiles
      const unseen = allProfiles.filter(p => !swipedIds.has(p.user_id));

      // Create map of profile ID to user ID
      const userIdMap = new Map<string, string>();
      unseen.forEach(p => {
        if (p.id) {
          userIdMap.set(p.id, p.user_id);
        }
      });
      setProfileUserIdMap(userIdMap);

      // Transform to UserProfile format (using simplified schema)
      const transformedProfiles = unseen
        .filter(p => p.id) // Ensure we have a valid ID
        .map(p => ({
        id: p.id!,
        name: p.full_name || 'Anonymous',
        age: p.age || 20,
        major: p.major || 'Undeclared',
        school: p.school || '',
        year: p.year as any || 'sophomore',
        bio: p.bio || '',
        photos: [], // Photos removed from schema
        location: 'Near USC', // Default since usc_area removed
        budget: p.budget_max || p.budget_min || 1200,
        moveInDate: new Date().toISOString().split('T')[0],
        housingType: 'off-campus' as any,
        traits: {
          cleanliness: p.cleanliness_rating || 5,
          socialness: 5, // Default
          studyHabits: 'flexible' as any,
          sleepSchedule: 'flexible' as any,
          guestFrequency: 'sometimes' as any,
          drinking: 'socially' as any,
          greekLife: false,
          smoking: false,
          pets: false,
        },
        preferences: {
          year: [],
          housingType: 'either' as 'on-campus' | 'off-campus' | 'either',
          preferredAreas: [],
          minBudget: p.budget_min || 0,
          maxBudget: p.budget_max || 10000,
          greekLife: null,
          smoking: false,
          pets: false,
          studyHabits: '',
          sleepSchedule: '',
          guestFrequency: '',
          cleanliness: '',
          noiseLevel: '',
        },
        interests: [], // Removed from schema
        topTraits: [], // Removed from schema
      }));

      setProfiles(transformedProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast.error('Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (liked: boolean) => {
    if (isGuest) {
      toast.error('Guest users cannot save preferences. Please sign up to like profiles.');
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !currentProfile) return;

      // Get the user_id from the profile (we need to find it from the database)
      const allProfiles = await getAllProfiles(user.id);
      const targetProfile = allProfiles.find(p => p.id === currentProfile.id);
      
      if (!targetProfile) {
        toast.error('Profile not found');
        return;
      }

      const result = await createSwipe(
        user.id,
        targetProfile.user_id,
        liked ? 'approve' : 'decline'
      );

      if (liked) {
        if (result.match) {
          toast.success(`🎉 It's a match with ${currentProfile.name}!`);
        } else {
          toast.success(`Liked ${currentProfile.name}`);
        }
      }

      // Add to swiped set
      setSwipedProfileIds(prev => new Set([...prev, targetProfile.user_id]));

      // Move to next profile
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(profiles.length);
      }
    } catch (error) {
      console.error('Error saving swipe:', error);
      toast.error('Failed to save preference');
    }
  };

  const currentProfile = profiles[currentIndex];

  const getYearDisplay = (year: string) => {
    const yearMap: { [key: string]: string } = {
      freshman: 'Freshman',
      sophomore: 'Sophomore',
      junior: 'Junior',
      senior: 'Senior',
      graduate: 'Graduate Student',
    };
    return yearMap[year] || year;
  };

  if (!currentProfile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="bg-[#141414] border border-white/10 rounded-lg p-12">
          <Heart className="mx-auto text-[#991B1B] mb-4" size={64} />
          <h2 className="text-white mb-2">No More Profiles</h2>
          <p className="text-gray-400">
            Check back later for more Trojans looking for roommates, or adjust your filters.
          </p>
          <Button 
            onClick={() => setCurrentIndex(0)} 
            className="mt-6 bg-[#991B1B] hover:bg-[#7d1616]"
          >
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0">
      {/* Filters */}
      <div className="mb-6">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="mb-4 border-white/20 text-white hover:bg-white/5"
        >
          <SlidersHorizontal size={16} className="mr-2" />
          Filters
        </Button>

        {showFilters && (
          <div className="bg-[#141414] border border-white/10 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-2">Year</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="freshman">Freshmen</SelectItem>
                    <SelectItem value="sophomore">Sophomores</SelectItem>
                    <SelectItem value="junior">Juniors</SelectItem>
                    <SelectItem value="senior">Seniors</SelectItem>
                    <SelectItem value="graduate">Graduate Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Budget Range</label>
                <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                  <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    <SelectItem value="all">All Budgets</SelectItem>
                    <SelectItem value="800-1100">$800-$1,100</SelectItem>
                    <SelectItem value="1100-1400">$1,100-$1,400</SelectItem>
                    <SelectItem value="1400+">$1,400+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentProfile.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#141414] rounded-lg shadow-lg overflow-hidden border border-white/10"
        >
          {/* Top Traits */}
          {currentProfile.topMatchedTraits && (
            <div className="bg-[#1a1a1a] p-4 border-b border-white/10">
              <p className="text-gray-300 mb-2">Top Traits</p>
              <ul className="space-y-1">
                {currentProfile.topMatchedTraits.map((trait, index) => (
                  <li key={index} className="text-gray-400 flex items-start gap-2">
                    <span className="text-[#991B1B] mt-0.5">•</span>
                    <span>{trait}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Profile Image */}
          <div className="relative h-96 bg-[#1a1a1a] flex items-center justify-center">
            <User className="w-32 h-32 text-[#991B1B]/20" />
            <div className="absolute top-4 right-4">
              <Badge className="bg-[#991B1B] hover:bg-[#7d1616]">
                {getYearDisplay(currentProfile.year)}
              </Badge>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 text-white">
              <h2>{currentProfile.name}, {currentProfile.age}</h2>
              <div className="flex items-center gap-2 mt-1">
                <MapPin size={16} />
                <span>{currentProfile.location}</span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-300">
                <BookOpen size={20} className="text-[#991B1B]" />
                <div>
                  <span className="block">{currentProfile.major}</span>
                  <span className="text-gray-500">{currentProfile.school}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <Home size={20} className="text-[#D97706]" />
                <span>{currentProfile.housingType === 'on-campus' ? 'On-Campus Housing' : 'Off-Campus Housing'}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <DollarSign size={20} className="text-green-500" />
                <span>${currentProfile.budget}/month budget</span>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <Calendar size={20} className="text-blue-500" />
                <span>Move-in: {new Date(currentProfile.moveInDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white mb-2">About</h3>
              <p className="text-gray-400">{currentProfile.bio}</p>
            </div>

            {/* Traits */}
            <div className="mb-6">
              <h3 className="text-white mb-3">Lifestyle</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/10">
                  <p className="text-gray-500">Cleanliness</p>
                  <p className="text-[#991B1B]">{currentProfile.traits.cleanliness}/10</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/10">
                  <p className="text-gray-500">Social Level</p>
                  <p className="text-[#991B1B]">{currentProfile.traits.socialness}/10</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/10">
                  <p className="text-gray-500">Study Habits</p>
                  <p className="text-[#D97706] capitalize">{currentProfile.traits.studyHabits}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/10">
                  <p className="text-gray-500">Sleep Schedule</p>
                  <p className="text-[#D97706] capitalize">{currentProfile.traits.sleepSchedule}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/10">
                  <p className="text-gray-500">Guests</p>
                  <p className="text-gray-300 capitalize">{currentProfile.traits.guestFrequency}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/10">
                  <p className="text-gray-500">Drinking</p>
                  <p className="text-gray-300 capitalize">{currentProfile.traits.drinking}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-3 flex-wrap">
                {currentProfile.traits.greekLife && (
                  <Badge variant="outline" className="border-[#D97706] text-[#D97706]">Greek Life</Badge>
                )}
                {currentProfile.traits.pets && (
                  <Badge variant="outline" className="border-blue-500 text-blue-400">Has Pets</Badge>
                )}
                {currentProfile.traits.smoking && (
                  <Badge variant="outline" className="border-gray-500 text-gray-400">Smoker</Badge>
                )}
              </div>
            </div>

            {/* Compatibility Badge */}
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Compatibility Score</p>
                  <p className="text-[#991B1B]">{matchPercentage}% Match</p>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 flex gap-4 justify-center border-t border-white/10">
            <Button
              onClick={() => handleSwipe(false)}
              variant="outline"
              size="lg"
              className="w-20 h-20 rounded-full border-2 border-white/20 hover:bg-white/5 hover:border-[#991B1B]/50"
            >
              <X size={32} className="text-gray-400" />
            </Button>
            <Button
              onClick={() => handleSwipe(true)}
              size="lg"
              className="w-20 h-20 rounded-full bg-[#991B1B] hover:bg-[#7d1616]"
            >
              <Heart size={32} />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicator */}
      <div className="mt-6 text-center">
        <p className="text-gray-400">
          {currentIndex + 1} of {profiles.length} Trojans
        </p>
        <div className="w-full bg-[#1a1a1a] rounded-full h-2 mt-2">
          <div 
            className="bg-[#991B1B] h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / profiles.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}