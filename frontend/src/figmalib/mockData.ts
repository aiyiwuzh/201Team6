export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  year: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate';
  major: string;
  school: string;
  location: string;
  housingType: 'on-campus' | 'off-campus';
  budget: number;
  moveInDate: string;
  photos: string[];
  traits: {
    cleanliness: number;
    socialness: number;
    studyHabits: 'library' | 'home' | 'flexible';
    sleepSchedule: 'early' | 'night' | 'flexible';
    greekLife: boolean;
    smoking: boolean;
    pets: boolean;
    drinking: 'never' | 'socially' | 'regularly';
    guestFrequency: 'never' | 'sometimes' | 'often';
  };
  preferences: {
    year: string[];
    housingType: 'on-campus' | 'off-campus' | 'either';
    preferredAreas: string[];
    minBudget: number;
    maxBudget: number;
    smoking: boolean;
    pets: boolean;
    greekLife: boolean | null;
  };
  topMatchedTraits?: string[];
}

export interface Match {
  id: string;
  userId: string;
  name: string;
  age: number;
  photo: string;
  matchedAt: string;
  lastMessage?: string;
  unreadCount?: number;
  topMatchedTraits: string[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export const currentUser: UserProfile = {
  id: 'current-user',
  name: 'You',
  age: 20,
  bio: 'USC student looking for a clean, friendly roommate near campus.',
  year: 'junior',
  major: 'Computer Science',
  school: 'Viterbi School of Engineering',
  location: 'Near Campus - University Park',
  housingType: 'off-campus',
  budget: 1200,
  moveInDate: '2025-12-01',
  photos: [],
  traits: {
    cleanliness: 8,
    socialness: 6,
    studyHabits: 'flexible',
    sleepSchedule: 'flexible',
    greekLife: false,
    smoking: false,
    pets: false,
    drinking: 'socially',
    guestFrequency: 'sometimes',
  },
  preferences: {
    year: ['sophomore', 'junior', 'senior'],
    housingType: 'either',
    preferredAreas: ['University Park', 'Exposition Park', 'Adams-Normandie'],
    minBudget: 900,
    maxBudget: 1500,
    smoking: false,
    pets: true,
    greekLife: null,
  },
};

export const potentialMatches: UserProfile[] = [
  {
    id: '1',
    name: 'Alex Chen',
    age: 21,
    bio: 'Marshall student who loves cooking and game nights. Looking for someone chill to share an apartment near campus. Go Trojans! ✌️',
    year: 'junior',
    major: 'Business Administration',
    school: 'Marshall School of Business',
    location: 'University Park',
    housingType: 'off-campus',
    budget: 1300,
    moveInDate: '2025-11-15',
    photos: [],
    traits: {
      cleanliness: 9,
      socialness: 7,
      studyHabits: 'flexible',
      sleepSchedule: 'flexible',
      greekLife: false,
      smoking: false,
      pets: false,
      drinking: 'socially',
      guestFrequency: 'sometimes',
    },
    preferences: {
      year: ['sophomore', 'junior', 'senior'],
      housingType: 'off-campus',
      preferredAreas: ['University Park', 'Exposition Park'],
      minBudget: 1000,
      maxBudget: 1500,
      smoking: false,
      pets: false,
      greekLife: null,
    },
    topMatchedTraits: ['Both value cleanliness (8-9/10)', 'Similar social levels (6-7/10)', 'Flexible sleep schedules'],
  },
  {
    id: '2',
    name: 'Jordan Martinez',
    age: 22,
    bio: 'Pre-med student at Dornsife. Super organized and serious about studying. Looking for a quiet roommate to keep each other accountable.',
    year: 'senior',
    major: 'Biological Sciences',
    school: 'Dornsife College of Letters, Arts and Sciences',
    location: 'Adams-Normandie',
    housingType: 'off-campus',
    budget: 1100,
    moveInDate: '2025-12-01',
    photos: [],
    traits: {
      cleanliness: 10,
      socialness: 4,
      studyHabits: 'library',
      sleepSchedule: 'early',
      greekLife: false,
      smoking: false,
      pets: false,
      drinking: 'never',
      guestFrequency: 'never',
    },
    preferences: {
      year: ['junior', 'senior', 'graduate'],
      housingType: 'off-campus',
      preferredAreas: ['University Park', 'Adams-Normandie'],
      minBudget: 900,
      maxBudget: 1300,
      smoking: false,
      pets: false,
      greekLife: false,
    },
    topMatchedTraits: ['Both very clean (8-10/10)', 'Prefer low-key social life', 'No smoking or pets'],
  },
  {
    id: '3',
    name: 'Sam Taylor',
    age: 20,
    bio: 'Annenberg student and fitness enthusiast. Up early for morning runs and gym sessions. Looking for a roommate with similar energy!',
    year: 'sophomore',
    major: 'Communication',
    school: 'Annenberg School for Communication and Journalism',
    location: 'Exposition Park',
    housingType: 'off-campus',
    budget: 1250,
    moveInDate: '2025-11-20',
    photos: [],
    traits: {
      cleanliness: 8,
      socialness: 6,
      studyHabits: 'home',
      sleepSchedule: 'early',
      greekLife: true,
      smoking: false,
      pets: false,
      drinking: 'socially',
      guestFrequency: 'sometimes',
    },
    preferences: {
      year: ['freshman', 'sophomore', 'junior'],
      housingType: 'off-campus',
      preferredAreas: ['Exposition Park', 'University Park'],
      minBudget: 1000,
      maxBudget: 1400,
      smoking: false,
      pets: false,
      greekLife: true,
    },
    topMatchedTraits: ['Similar cleanliness (8/10)', 'Social drinking habits', 'Off-campus housing preference'],
  },
  {
    id: '4',
    name: 'Casey Wong',
    age: 21,
    bio: 'SCA film student with a creative spirit. Love hosting movie nights and creative sessions. Looking for an artsy roommate who gets it.',
    year: 'junior',
    major: 'Film & Television Production',
    school: 'School of Cinematic Arts',
    location: 'West Adams',
    housingType: 'off-campus',
    budget: 1400,
    moveInDate: '2025-12-15',
    photos: [],
    traits: {
      cleanliness: 6,
      socialness: 9,
      studyHabits: 'home',
      sleepSchedule: 'night',
      greekLife: false,
      smoking: false,
      pets: true,
      drinking: 'socially',
      guestFrequency: 'often',
    },
    preferences: {
      year: ['sophomore', 'junior', 'senior'],
      housingType: 'off-campus',
      preferredAreas: ['West Adams', 'University Park', 'Exposition Park'],
      minBudget: 1200,
      maxBudget: 1600,
      smoking: false,
      pets: true,
      greekLife: null,
    },
    topMatchedTraits: ['Both social and outgoing', 'Study/work from home', 'Social drinking habits'],
  },
  {
    id: '5',
    name: 'Riley Johnson',
    age: 23,
    bio: 'Grad student at Price studying public policy. Love reading, hiking on weekends, and keeping a peaceful, clean living space.',
    year: 'graduate',
    major: 'Public Policy',
    school: 'Price School of Public Policy',
    location: 'University Park',
    housingType: 'off-campus',
    budget: 1350,
    moveInDate: '2025-11-25',
    photos: [],
    traits: {
      cleanliness: 9,
      socialness: 5,
      studyHabits: 'library',
      sleepSchedule: 'flexible',
      greekLife: false,
      smoking: false,
      pets: false,
      drinking: 'never',
      guestFrequency: 'never',
    },
    preferences: {
      year: ['senior', 'graduate'],
      housingType: 'off-campus',
      preferredAreas: ['University Park', 'Adams-Normandie'],
      minBudget: 1100,
      maxBudget: 1500,
      smoking: false,
      pets: false,
      greekLife: false,
    },
    topMatchedTraits: ['Both very clean (8-9/10)', 'Prefer studying at library', 'Don\'t drink alcohol'],
  },
];

export const mockMatches: Match[] = [
  {
    id: '1',
    userId: '1',
    name: 'Alex Chen',
    age: 27,
    photo: '',
    matchedAt: '2025-10-28T10:30:00Z',
    lastMessage: 'Sounds great! Let me know when you want to meet up.',
    unreadCount: 2,
    topMatchedTraits: ['Both value cleanliness (9/10)', 'Similar social levels (6-7/10)', 'Flexible sleep schedules'],
  },
  {
    id: '5',
    userId: '5',
    name: 'Riley Johnson',
    age: 28,
    photo: '',
    matchedAt: '2025-10-29T14:20:00Z',
    lastMessage: 'Hi! Nice to match with you!',
    unreadCount: 1,
    topMatchedTraits: ['Both very clean (8-9/10)', 'Prefer studying at library', 'Don\'t drink alcohol'],
  },
  {
    id: '3',
    userId: '3',
    name: 'Sam Taylor',
    age: 29,
    photo: '',
    matchedAt: '2025-10-30T09:15:00Z',
    topMatchedTraits: ['Similar cleanliness (8/10)', 'Social drinking habits', 'Off-campus housing preference'],
  },
];

export const mockMessages: { [matchId: string]: Message[] } = {
  '1': [
    {
      id: 'm1',
      senderId: '1',
      receiverId: 'current-user',
      content: 'Hey! I saw we matched. Love your profile!',
      timestamp: '2025-10-28T10:30:00Z',
      read: true,
    },
    {
      id: 'm2',
      senderId: 'current-user',
      receiverId: '1',
      content: 'Thanks! I really liked your profile too. How long have you been looking for a roommate?',
      timestamp: '2025-10-28T10:35:00Z',
      read: true,
    },
    {
      id: 'm3',
      senderId: '1',
      receiverId: 'current-user',
      content: 'About a month now. I found a great 2BR in SOMA. Want to check it out together?',
      timestamp: '2025-10-28T10:40:00Z',
      read: true,
    },
    {
      id: 'm4',
      senderId: 'current-user',
      receiverId: '1',
      content: 'That sounds perfect! When were you thinking?',
      timestamp: '2025-10-28T10:45:00Z',
      read: true,
    },
    {
      id: 'm5',
      senderId: '1',
      receiverId: 'current-user',
      content: 'Sounds great! Let me know when you want to meet up.',
      timestamp: '2025-10-28T10:50:00Z',
      read: false,
    },
  ],
  '5': [
    {
      id: 'm6',
      senderId: '5',
      receiverId: 'current-user',
      content: 'Hi! Nice to match with you!',
      timestamp: '2025-10-29T14:20:00Z',
      read: false,
    },
  ],
  '3': [],
};
