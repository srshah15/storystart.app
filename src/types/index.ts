// Types for the StoryStart application

export interface Activity {
  id: string;
  name: string;
  hours: string;
  description?: string;
}

export interface Award {
  id: string;
  name: string;
  level: string;
  description: string;
}

export interface Hobby {
  id: string;
  name: string;
  description: string;
}

export interface StudentProfile {
  selectedColleges: string[];
  major: string;
  background: string[];
  activities: Activity[];
  awards: Award[];
  hobbies: Hobby[];
  uploadedPhoto: File | null;
}

// Types for story generation
export interface StoryIdea {
  id: string;
  title: string;
  category: string;
  applications: string[];
  coreTheme: string;
  keyMoments: string[];
  writingPrompts: string[];
  structureSuggestion: string;
  strengthsHighlighted: string[];
  potentialChallenges: string[];
  exampleOpening: string;
}

// Types for discovery questions
export interface Question {
  id: number;
  type: 'warm-up' | 'deeper' | 'challenge' | 'values' | 'future' | 'reflection';
  text: string;
  followUp?: string;
  category: string;
}

export interface StudentProfile {
  // Existing fields
  selectedColleges: string[];
  major: string;
  background: string[];
  activities: Activity[];
  awards: Award[];
  hobbies: Hobby[];
  uploadedPhoto: File | null;
  
  // New personal insights fields
  personalValues?: string[];
  personalityTraits?: string[];
  learningStyle?: string;
  leadershipStyle?: string;
  motivations?: string[];
  socialImpactAreas?: string[];
  groupRole?: string;
  communicationPreference?: string;
}

// Constants that might be used across components
export const COLLEGES = [
  'Harvard', 'Stanford', 'MIT', 'Yale', 'Princeton', 'Columbia', 'UPenn', 'Brown',
  'Dartmouth', 'Cornell', 'UC Berkeley', 'UCLA', 'USC', 'NYU', 'Northwestern', 'UNC Chapel-Hill'
] as const;

export const MAJORS = [
  'Computer Science', 'Pre-med', 'Business', 'Engineering', 'Psychology', 
  'English', 'Political Science', 'Economics', 'Biology', 'Chemistry'
] as const;

export const BACKGROUND_OPTIONS = [
  'First-generation college student', 'Rural background', 'Urban background', 
  'Low-income family', 'Immigrant family', 'Military family'
] as const;

export const COMMON_ACTIVITIES = [
  'Soccer captain', 'Debate team', 'Coding club', 'Student government', 
  'Drama club', 'Band/Orchestra', 'Volunteer work', 'Part-time job',
  'National Honor Society', 'Key Club', 'Chess club', 'Yearbook committee'
] as const;

export const COMMON_AWARDS = [
  'National Honor Society', 'Principal\'s List', 'Dean\'s List', 'Perfect Attendance',
  'Academic Excellence Award', 'Student of the Month', 'Valedictorian', 'Salutatorian',
  'National Merit Scholar', 'AP Scholar', 'Honor Roll', 'Presidential Award'
] as const;

export const COMMON_HOBBIES = [
  'Reading', 'Photography', 'Cooking', 'Gaming', 'Drawing/Art', 'Writing',
  'Hiking', 'Gardening', 'Collecting', 'Board games', 'Music listening', 'Movies/TV'
] as const;

export const AWARD_LEVELS = ['School', 'Regional', 'State', 'National', 'International'] as const;

export const PERSONAL_VALUES = [
  'Innovation', 'Justice', 'Family', 'Excellence', 'Authenticity', 'Service', 
  'Leadership', 'Creativity', 'Independence', 'Community', 'Growth', 'Integrity', 
  'Adventure', 'Stability', 'Collaboration', 'Compassion', 'Achievement', 'Learning'
];

export const PERSONALITY_TRAITS = [
  'Analytical', 'Empathetic', 'Persistent', 'Creative', 'Practical', 'Optimistic', 
  'Detail-oriented', 'Big-picture thinker', 'Collaborative', 'Independent', 
  'Risk-taker', 'Methodical', 'Spontaneous', 'Diplomatic', 'Competitive', 'Patient'
];

export const LEARNING_STYLES = [
  'Visual learner', 'Hands-on experimenter', 'Analytical thinker', 
  'Collaborative brainstormer', 'Independent researcher', 'Trial-and-error approach', 
  'Step-by-step planner', 'Intuitive decision-maker'
];

export const LEADERSHIP_STYLES = [
  'Lead by example', 'Motivational speaker', 'Behind-the-scenes organizer', 
  'Collaborative facilitator', 'Innovative visionary', 'Supportive mentor', 
  'Strategic planner', "I don't see myself as a leader"
];

export const MOTIVATIONS = [
  'Solving complex problems', 'Helping others succeed', 'Creating something new', 
  'Making a positive impact', 'Competing and winning', 'Learning new things', 
  'Building relationships', 'Achieving personal goals', 'Recognition and praise', 'Financial security'
];

export const SOCIAL_IMPACT_AREAS = [
  'Education access', 'Environmental sustainability', 'Social justice', 'Healthcare', 
  'Technology ethics', 'Economic inequality', 'Mental health', 'Community development', 
  'Arts/culture', 'Scientific research', 'Animal welfare', 'Global poverty'
];

export const GROUP_ROLES = [
  'The idea generator', 'The organizer/planner', 'The researcher/analyst', 
  'The presenter/communicator', 'The problem-solver', 'The mediator/diplomat', 
  'The quality checker', 'The motivator/cheerleader'
];

export const COMMUNICATION_PREFERENCES = [
  'Public speaking', 'One-on-one conversations', 'Written communication', 
  'Visual presentations', 'Leading discussions', 'Listening and supporting others'
];