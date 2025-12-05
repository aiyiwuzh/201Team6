import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Camera, Save, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getProfile, updateProfile, createProfile } from '../lib/database';
import { toast } from 'sonner';
import { currentUser } from '../lib/mockData';

export function ProfilePage() {
  const [profile, setProfile] = useState(currentUser);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const userProfile = await getProfile(user.id);
        
        if (userProfile) {
          // Map Supabase profile to component state
          setProfile({
            id: userProfile.id,
            name: userProfile.full_name,
            age: userProfile.age,
            major: userProfile.major,
            school: userProfile.school,
            year: userProfile.year as any,
            bio: userProfile.bio,
            photos: userProfile.avatar_url ? [userProfile.avatar_url] : [],
            housingType: 'off-campus',
            preferences: {
              preferredAreas: userProfile.usc_area ? [userProfile.usc_area] : [],
              year: [],
              greekLife: userProfile.greek_life === 'yes',
              studyHabits: userProfile.study_habits,
              guestFrequency: userProfile.guest_frequency,
              sleepSchedule: userProfile.sleep_schedule,
              cleanliness: userProfile.cleanliness,
              noiseLevel: userProfile.noise_level,
            },
            interests: userProfile.interests || [],
            topTraits: userProfile.top_traits || [],
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to save your profile');
        return;
      }

      const profileData = {
        username: user.email?.split('@')[0] || '',
        full_name: profile.name,
        age: profile.age,
        major: profile.major,
        school: profile.school,
        year: profile.year,
        bio: profile.bio,
        avatar_url: profile.photos[0],
        greek_life: profile.preferences.greekLife ? 'yes' : 'no',
        study_habits: profile.preferences.studyHabits || '',
        usc_area: profile.preferences.preferredAreas[0] || '',
        guest_frequency: profile.preferences.guestFrequency || '',
        sleep_schedule: profile.preferences.sleepSchedule || '',
        cleanliness: profile.preferences.cleanliness || '',
        noise_level: profile.preferences.noiseLevel || '',
        interests: profile.interests,
        top_traits: profile.topTraits,
      };

      const existingProfile = await getProfile(user.id);
      
      if (existingProfile) {
        await updateProfile(user.id, profileData);
      } else {
        await createProfile(user.id, profileData);
      }
      
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-20 md:pb-0">
        <div className="bg-[#141414] rounded-lg border border-white/10 p-6 md:p-8">
          <div className="text-center text-gray-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  const uscSchools = [
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

  const uscAreas = [
    'University Park',
    'Exposition Park',
    'Adams-Normandie',
    'West Adams',
    'Jefferson Park',
    'Vermont Square',
  ];

  const togglePreferredArea = (area: string) => {
    const current = profile.preferences.preferredAreas;
    const updated = current.includes(area)
      ? current.filter(a => a !== area)
      : [...current, area];
    setProfile({ ...profile, preferences: { ...profile.preferences, preferredAreas: updated } });
  };

  const togglePreferredYear = (year: string) => {
    const current = profile.preferences.year;
    const updated = current.includes(year)
      ? current.filter(y => y !== year)
      : [...current, year];
    setProfile({ ...profile, preferences: { ...profile.preferences, year: updated } });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-0">
      <div className="bg-[#141414] rounded-lg border border-white/10 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-[#991B1B]" size={28} />
            <h2 className="text-white">Your USC Profile</h2>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-[#991B1B] hover:bg-[#7d1616]">
            <Save size={16} className="mr-2" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>

        {/* Photo Upload */}
        <div className="mb-8">
          <Label className="text-gray-400">Profile Photos</Label>
          <div className="grid grid-cols-3 gap-4 mt-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="relative aspect-square bg-[#1a1a1a] rounded-lg overflow-hidden border-2 border-dashed border-white/20 hover:border-[#991B1B]/50 transition-colors cursor-pointer group">
                {profile.photos[index] ? (
                  <ImageWithFallback
                    src={profile.photos[index]}
                    alt={`Profile photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="mx-auto text-gray-600 group-hover:text-[#991B1B] transition-colors" size={32} />
                      <p className="text-gray-600 mt-2">Add Photo</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-6 mb-8">
          <h3 className="text-white flex items-center gap-2">
            <span className="text-[#991B1B]">•</span> Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-gray-400">Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your name"
                className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="age" className="text-gray-400">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                placeholder="Your age"
                className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="year" className="text-gray-400">Year</Label>
              <Select
                value={profile.year}
                onValueChange={(value: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate') => 
                  setProfile({ ...profile, year: value })
                }
              >
                <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  <SelectItem value="freshman">Freshman</SelectItem>
                  <SelectItem value="sophomore">Sophomore</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="graduate">Graduate Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="major" className="text-gray-400">Major</Label>
              <Input
                id="major"
                value={profile.major}
                onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                placeholder="e.g., Computer Science"
                className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="school" className="text-gray-400">USC School</Label>
              <Select
                value={profile.school}
                onValueChange={(value) => setProfile({ ...profile, school: value })}
              >
                <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  {uscSchools.map(school => (
                    <SelectItem key={school} value={school}>{school}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="housingType" className="text-gray-400">Housing Preference</Label>
              <Select
                value={profile.housingType}
                onValueChange={(value: 'on-campus' | 'off-campus') => 
                  setProfile({ ...profile, housingType: value })
                }
              >
                <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  <SelectItem value="on-campus">On-Campus</SelectItem>
                  <SelectItem value="off-campus">Off-Campus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location" className="text-gray-400">Preferred Area</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="e.g., University Park"
                className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="budget" className="text-gray-400">Monthly Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={profile.budget}
                onChange={(e) => setProfile({ ...profile, budget: parseInt(e.target.value) })}
                placeholder="1200"
                className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="moveInDate" className="text-gray-400">Move-in Date</Label>
              <Input
                id="moveInDate"
                type="date"
                value={profile.moveInDate}
                onChange={(e) => setProfile({ ...profile, moveInDate: e.target.value })}
                className="bg-[#1a1a1a] border-white/10 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio" className="text-gray-400">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell potential roommates about yourself... (interests, hobbies, what you're looking for in a roommate)"
              rows={4}
              className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Lifestyle Traits */}
        <div className="space-y-6 mb-8">
          <h3 className="text-white flex items-center gap-2">
            <span className="text-[#D97706]">•</span> Lifestyle & Habits
          </h3>

          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-gray-400">Cleanliness Level</Label>
              <span className="text-[#991B1B]">{profile.traits.cleanliness}/10</span>
            </div>
            <Slider
              value={[profile.traits.cleanliness]}
              onValueChange={(value) => setProfile({ ...profile, traits: { ...profile.traits, cleanliness: value[0] } })}
              max={10}
              step={1}
              className="[&_[role=slider]]:bg-[#991B1B] [&_[role=slider]]:border-[#991B1B]"
            />
            <p className="text-gray-500 mt-1">How clean do you keep your space?</p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-gray-400">Social Level</Label>
              <span className="text-[#991B1B]">{profile.traits.socialness}/10</span>
            </div>
            <Slider
              value={[profile.traits.socialness]}
              onValueChange={(value) => setProfile({ ...profile, traits: { ...profile.traits, socialness: value[0] } })}
              max={10}
              step={1}
              className="[&_[role=slider]]:bg-[#991B1B] [&_[role=slider]]:border-[#991B1B]"
            />
            <p className="text-gray-500 mt-1">How social are you at home?</p>
          </div>

          <div>
            <Label className="text-gray-400">Study Habits</Label>
            <Select
              value={profile.traits.studyHabits}
              onValueChange={(value: 'library' | 'home' | 'flexible') => 
                setProfile({ ...profile, traits: { ...profile.traits, studyHabits: value } })
              }
            >
              <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem value="library">Prefer Library (Leavey, Doheny)</SelectItem>
                <SelectItem value="home">Prefer Home</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-400">Sleep Schedule</Label>
            <Select
              value={profile.traits.sleepSchedule}
              onValueChange={(value: 'early' | 'night' | 'flexible') => 
                setProfile({ ...profile, traits: { ...profile.traits, sleepSchedule: value } })
              }
            >
              <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem value="early">Early Bird (before 10pm)</SelectItem>
                <SelectItem value="night">Night Owl (after midnight)</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-400">Guest Frequency</Label>
            <Select
              value={profile.traits.guestFrequency}
              onValueChange={(value: 'never' | 'sometimes' | 'often') => 
                setProfile({ ...profile, traits: { ...profile.traits, guestFrequency: value } })
              }
            >
              <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem value="never">Rarely/Never</SelectItem>
                <SelectItem value="sometimes">Sometimes</SelectItem>
                <SelectItem value="often">Often</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-400">Drinking Habits</Label>
            <Select
              value={profile.traits.drinking}
              onValueChange={(value: 'never' | 'socially' | 'regularly') => 
                setProfile({ ...profile, traits: { ...profile.traits, drinking: value } })
              }
            >
              <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="socially">Socially</SelectItem>
                <SelectItem value="regularly">Regularly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-white/10 rounded-lg">
            <div>
              <Label className="text-gray-300">Greek Life</Label>
              <p className="text-gray-500">Are you in a fraternity or sorority?</p>
            </div>
            <Switch
              checked={profile.traits.greekLife}
              onCheckedChange={(checked) => setProfile({ ...profile, traits: { ...profile.traits, greekLife: checked } })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-white/10 rounded-lg">
            <div>
              <Label className="text-gray-300">Smoking</Label>
              <p className="text-gray-500">Do you smoke?</p>
            </div>
            <Switch
              checked={profile.traits.smoking}
              onCheckedChange={(checked) => setProfile({ ...profile, traits: { ...profile.traits, smoking: checked } })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-white/10 rounded-lg">
            <div>
              <Label className="text-gray-300">Pets</Label>
              <p className="text-gray-500">Do you have pets?</p>
            </div>
            <Switch
              checked={profile.traits.pets}
              onCheckedChange={(checked) => setProfile({ ...profile, traits: { ...profile.traits, pets: checked } })}
            />
          </div>
        </div>

        {/* Roommate Preferences */}
        <div className="space-y-6">
          <h3 className="text-white flex items-center gap-2">
            <span className="text-[#991B1B]">•</span> Roommate Preferences
          </h3>

          <div>
            <Label className="mb-3 block text-gray-400">Preferred Year(s)</Label>
            <div className="space-y-2">
              {['freshman', 'sophomore', 'junior', 'senior', 'graduate'].map((year) => (
                <div key={year} className="flex items-center space-x-2">
                  <Checkbox
                    id={`year-${year}`}
                    checked={profile.preferences.year.includes(year)}
                    onCheckedChange={() => togglePreferredYear(year)}
                  />
                  <label htmlFor={`year-${year}`} className="text-gray-300 capitalize cursor-pointer">
                    {year === 'graduate' ? 'Graduate Student' : year}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-gray-400">Housing Type Preference</Label>
            <Select
              value={profile.preferences.housingType}
              onValueChange={(value: 'on-campus' | 'off-campus' | 'either') => 
                setProfile({ ...profile, preferences: { ...profile.preferences, housingType: value } })
              }
            >
              <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem value="on-campus">On-Campus Only</SelectItem>
                <SelectItem value="off-campus">Off-Campus Only</SelectItem>
                <SelectItem value="either">Either is Fine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-3 block text-gray-400">Preferred Area(s) Near USC</Label>
            <div className="grid grid-cols-2 gap-2">
              {uscAreas.map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={`area-${area}`}
                    checked={profile.preferences.preferredAreas.includes(area)}
                    onCheckedChange={() => togglePreferredArea(area)}
                  />
                  <label htmlFor={`area-${area}`} className="text-gray-300 cursor-pointer">
                    {area}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-400">Minimum Budget ($)</Label>
              <Input
                type="number"
                value={profile.preferences.minBudget}
                onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences, minBudget: parseInt(e.target.value) } })}
                className="bg-[#1a1a1a] border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-400">Maximum Budget ($)</Label>
              <Input
                type="number"
                value={profile.preferences.maxBudget}
                onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences, maxBudget: parseInt(e.target.value) } })}
                className="bg-[#1a1a1a] border-white/10 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-white/10 rounded-lg">
            <div>
              <Label className="text-gray-300">Greek Life Preference</Label>
              <p className="text-gray-500">Prefer roommates in Greek life?</p>
            </div>
            <Select
              value={profile.preferences.greekLife === null ? 'no-preference' : profile.preferences.greekLife.toString()}
              onValueChange={(value) => {
                const greekLifePref = value === 'no-preference' ? null : value === 'true';
                setProfile({ ...profile, preferences: { ...profile.preferences, greekLife: greekLifePref } });
              }}
            >
              <SelectTrigger className="w-40 bg-[#1a1a1a] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem value="no-preference">No Preference</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-white/10 rounded-lg">
            <div>
              <Label className="text-gray-300">Accept Smokers</Label>
              <p className="text-gray-500">Are you okay with roommates who smoke?</p>
            </div>
            <Switch
              checked={profile.preferences.smoking}
              onCheckedChange={(checked) => setProfile({ ...profile, preferences: { ...profile.preferences, smoking: checked } })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-white/10 rounded-lg">
            <div>
              <Label className="text-gray-300">Accept Pets</Label>
              <p className="text-gray-500">Are you okay with roommates who have pets?</p>
            </div>
            <Switch
              checked={profile.preferences.pets}
              onCheckedChange={(checked) => setProfile({ ...profile, preferences: { ...profile.preferences, pets: checked } })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}