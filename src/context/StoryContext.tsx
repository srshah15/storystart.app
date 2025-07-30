import React, { createContext, useContext, useState, useEffect } from 'react';
import { EssayGenerationEngine } from '../utils/newEssayEngine'; // Import the new engine

// Types for our data structures
interface Activity {
  id: string;
  name: string;
  hours: string;
  description: string;
}

interface Award {
  id: string;
  name: string;
  level: string;
  description: string;
}

interface Hobby {
  id: string;
  name: string;
  description: string;
}

interface ProfileData {
  colleges: string[];
  major: string;
  background: string[];
  activities: Activity[];
  awards: Award[];
  hobbies: Hobby[];
  personalValues: string[];
  personalityTraits: string[];
  learningStyle: string;
  leadershipStyle: string;
  motivations: string[];
  socialImpactAreas: string[];
  groupRole: string;
  communicationPreference: string;
  uploadedPhoto?: File | null;
  photoPreview?: string | null;
}

// Updated interface for generation metadata
interface GenerationMetadata {
  totalGroups: number;
  totalStories: number;
  coveragePercentage: number;
  efficiency: number;
  uncoveredPrompts: any[];
  timestamp: Date;
}

interface StoryContextType {
  // Profile data
  profileData: ProfileData;
  updateProfileData: (data: Partial<ProfileData>) => void;
  
  // Completion states
  isProfileComplete: boolean;
  isDiscoveryComplete: boolean;
  
  // Discovery data
  generatedQuestions: string;
  questionResponses: string[];
  updateQuestionResponses: (responses: string[]) => void;
  
  // Final results - now using the new structured format
  essayIdeas: any; // Can be string (legacy) or structured data (new)
  generationMetadata: GenerationMetadata | null;
  
  // Loading states
  isGeneratingQuestions: boolean;
  isGeneratingEssays: boolean;
  
  // API functions
  generateQuestions: () => Promise<boolean>;
  generateEssayIdeas: () => Promise<boolean>;
  
  // Navigation helpers
  completeProfile: () => void;
  completeDiscovery: () => void;
  
  // Testing helpers
  skipToDiscovery: () => void;
  skipToResults: () => void;
  
  // Reset function
  resetEssayGeneration: () => void;
}

const StoryContext = createContext<StoryContextType | null>(null);

export const useStoryContext = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStoryContext must be used within a StoryProvider');
  }
  return context;
};

// Mock data for testing - now using new structured format
const MOCK_QUESTIONS = `1. Describe a time when you faced a significant challenge in one of your extracurricular activities. How did you overcome it, and what did you learn about yourself?

2. Tell us about a moment when your personal values were tested or came into conflict with what others expected of you. How did you handle the situation?

3. Think about a project or initiative where you took on a leadership role. What obstacles did you encounter, and how did your leadership style evolve through the experience?

4. Describe a time when you failed at something important to you. How did you process that failure, and what changes did you make as a result?

5. Tell us about an experience that made you question or refine your academic or career goals. What insights did you gain about yourself?

6. Describe a moment when you had to step outside your comfort zone. What motivated you to take that risk, and how did it change your perspective?`;

// Updated mock data with new structure
const MOCK_STRUCTURED_ESSAYS = {
  stories: [
    {
      id: 'story_1',
      title: 'The Algorithm That Taught Me Empathy',
      category: {
        name: 'Challenge & Growth',
        description: 'Overcoming obstacles and learning from failure'
      },
      coreExperience: 'When our team\'s collaborative coding project kept failing, I realized the technical solution wasn\'t enough - I needed to understand my teammates\' different approaches and communication styles.',
      keyActions: 'I organized individual meetings with each team member, created a shared documentation system, and implemented daily check-ins to bridge our communication gaps.',
      outcomesAndGrowth: 'Our project succeeded, and I learned that technical skills are enhanced by emotional intelligence and collaborative problem-solving.',
      universalThemes: 'Leadership through empathy, turning failure into growth, bridging differences',
      adaptationNotes: 'Can be adapted for leadership prompts, challenge prompts, or teamwork questions by emphasizing different aspects of the experience.',
      schools: ['Common App', 'MIT', 'Stanford'],
      coveredPrompts: ['commonapp_2', 'commonapp_5', 'mit_4', 'stanford_essay_1'],
      promptsCovered: 4
    },
    {
      id: 'story_2',
      title: 'From Debate Stage to Community Garden',
      category: {
        name: 'Community & Service',
        description: 'Making positive impact in your community'
      },
      coreExperience: 'I used research and persuasion techniques from competitive debate to rally community support for creating a local environmental initiative.',
      keyActions: 'Conducted community surveys, presented data-driven proposals to the city council, and organized volunteer groups to implement the garden project.',
      outcomesAndGrowth: 'The community garden was approved and built, teaching me how academic skills translate into real-world change.',
      universalThemes: 'Civic engagement, practical application of learning, environmental consciousness',
      adaptationNotes: 'Perfect for service prompts, community involvement questions, and environmental/social impact essays.',
      schools: ['Common App', 'Harvard', 'Yale', 'Princeton'],
      coveredPrompts: ['commonapp_1', 'harvard_1', 'yale_essay_2', 'princeton_essay_2'],
      promptsCovered: 4
    },
    {
      id: 'story_3',
      title: 'Teaching My Grandmother to Code',
      category: {
        name: 'Relationships & Communication',
        description: 'Connecting with others across differences'
      },
      coreExperience: 'The patient process of teaching my 78-year-old grandmother basic programming concepts revealed how learning works both ways.',
      keyActions: 'Created visual learning materials, broke down complex concepts into simple analogies, and celebrated small victories to maintain motivation.',
      outcomesAndGrowth: 'She built her first simple program, and I learned that effective teaching requires deep empathy and creative communication.',
      universalThemes: 'Bridging generational gaps, patience, innovative teaching methods',
      adaptationNotes: 'Excellent for diversity prompts, communication questions, or personal growth essays.',
      schools: ['Common App', 'Brown', 'Columbia'],
      coveredPrompts: ['commonapp_6', 'brown_ec', 'columbia_short_1'],
      promptsCovered: 3
    }
  ]
};

const MOCK_METADATA: GenerationMetadata = {
  totalGroups: 5,
  totalStories: 3,
  coveragePercentage: 85,
  efficiency: 3.7,
  uncoveredPrompts: [],
  timestamp: new Date()
};

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize the new essay generation engine
  const [essayEngine] = useState(() => new EssayGenerationEngine());

  // Profile state
  const [profileData, setProfileData] = useState<ProfileData>({
    colleges: [],
    major: '',
    background: [],
    activities: [],
    awards: [],
    hobbies: [],
    personalValues: [],
    personalityTraits: [],
    learningStyle: '',
    leadershipStyle: '',
    motivations: [],
    socialImpactAreas: [],
    groupRole: '',
    communicationPreference: '',
    uploadedPhoto: null,
    photoPreview: null,
  });

  // Completion states
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isDiscoveryComplete, setIsDiscoveryComplete] = useState(false);

  // Discovery state
  const [generatedQuestions, setGeneratedQuestions] = useState('');
  const [questionResponses, setQuestionResponses] = useState<string[]>([]);

  // Results state - now supports both legacy and new formats
  const [essayIdeas, setEssayIdeas] = useState<any>('');
  const [generationMetadata, setGenerationMetadata] = useState<GenerationMetadata | null>(null);

  // Loading states
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingEssays, setIsGeneratingEssays] = useState(false);

  // Check if profile is complete whenever profileData changes
  useEffect(() => {
    const isComplete = 
      profileData.colleges.length > 0 &&
      profileData.major.trim() !== '' &&
      profileData.activities.length > 0 &&
      profileData.awards.length > 0;
    
    setIsProfileComplete(isComplete);
  }, [profileData]);

  // Update profile data
  const updateProfileData = (data: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  // Update question responses
  const updateQuestionResponses = (responses: string[]) => {
    setQuestionResponses(responses);
  };

  // Generate questions using OpenAI
  const generateQuestions = async (): Promise<boolean> => {
    console.log('=== GENERATING QUESTIONS ===');
    console.log('Profile data:', profileData);

    setIsGeneratingQuestions(true);

    const systemPrompt = `You are an expert college admissions counselor who helps students discover their unique stories for college essays. 

Given a student's profile data, generate 5-7 specific, probing questions that will help them reflect on meaningful experiences, challenges overcome, growth moments, and personal insights that would make compelling college essay material.

Focus on:
- Specific moments of challenge, failure, or growth
- Times when their values were tested or revealed
- Experiences that shaped their perspective or goals
- Moments that showcase their personality and character
- Stories that connect their activities to deeper meaning

Make questions personal and specific to their profile, not generic. Ask about specific situations, feelings, and transformative moments. Format as a numbered list.`;

    const userPrompt = `Here is the student's profile:

TARGET COLLEGES: ${profileData.colleges.join(', ')}
INTENDED MAJOR: ${profileData.major}
BACKGROUND: ${profileData.background.join(', ')}

ACTIVITIES: ${profileData.activities.map(a => `${a.name} (${a.hours}hrs/week): ${a.description}`).join(' | ')}

AWARDS: ${profileData.awards.map(a => `${a.name} (${a.level}): ${a.description}`).join(' | ')}

PERSONAL VALUES: ${profileData.personalValues.join(', ')}
PERSONALITY TRAITS: ${profileData.personalityTraits.join(', ')}
LEARNING STYLE: ${profileData.learningStyle}
LEADERSHIP STYLE: ${profileData.leadershipStyle}
MOTIVATIONS: ${profileData.motivations.join(', ')}
SOCIAL IMPACT AREAS: ${profileData.socialImpactAreas.join(', ')}
GROUP ROLE: ${profileData.groupRole}
COMMUNICATION PREFERENCE: ${profileData.communicationPreference}

HOBBIES: ${profileData.hobbies.map(h => `${h.name}: ${h.description}`).join(' | ')}

Please generate 5-7 specific, thoughtful questions to help this student discover their best college essay stories.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const questions = data.choices[0].message.content;
      
      console.log('=== GENERATED QUESTIONS ===');
      console.log(questions);
      
      setGeneratedQuestions(questions);
      setIsGeneratingQuestions(false);
      return true;

    } catch (error) {
      console.error('Error generating questions:', error);
      setIsGeneratingQuestions(false);
      return false;
    }
  };

  // Generate essay ideas using the NEW strategic system
  const generateEssayIdeas = async (): Promise<boolean> => {
    console.log('=== STARTING NEW STRATEGIC ESSAY GENERATION ===');
    setIsGeneratingEssays(true);

    try {
      // Use the new essay generation engine
      const result = await essayEngine.generateStrategicEssays(
        profileData, 
        questionResponses
      );
      
      if (result.success) {
        console.log('=== NEW GENERATION COMPLETE ===');
        console.log(`Generated ${result.stories.length} strategic stories`);
        console.log(`Coverage: ${result.metadata.coveragePercentage}%`);
        console.log(`Efficiency: ${result.metadata.efficiency} prompts per story`);
        
        // Store the structured data directly
        setEssayIdeas(result);
        setGenerationMetadata(result.metadata);
        
        setIsGeneratingEssays(false);
        return true;
      } else {
        console.error('Strategic generation failed:', result.error);
        setIsGeneratingEssays(false);
        return false;
      }
      
    } catch (error) {
      console.error('Error in strategic essay generation:', error);
      setIsGeneratingEssays(false);
      return false;
    }
  };

  // Reset essay generation (useful for regenerating with different parameters)
  const resetEssayGeneration = () => {
    setEssayIdeas('');
    setGenerationMetadata(null);
  };

  // Completion helpers
  const completeProfile = () => {
    setIsProfileComplete(true);
  };

  const completeDiscovery = () => {
    setIsDiscoveryComplete(true);
  };

  // Testing helpers - skip API calls and use mock data
  const skipToDiscovery = () => {
    console.log('=== SKIPPING TO DISCOVERY (TESTING MODE) ===');
    setGeneratedQuestions(MOCK_QUESTIONS);
    setIsProfileComplete(true);
  };

  const skipToResults = () => {
    console.log('=== SKIPPING TO RESULTS (TESTING MODE - NEW FORMAT) ===');
    setGeneratedQuestions(MOCK_QUESTIONS);
    setQuestionResponses([
      'I remember struggling with our robotics team when we kept failing at regionals. I had to learn that failure was part of the process and started breaking down problems differently.',
      'When my debate coach wanted me to argue a position I disagreed with, I had to choose between winning and my values. I found a way to argue ethically while still being competitive.',
      'Leading our environmental club taught me that not everyone responds to the same leadership style. I had to adapt and learn when to step back and when to step forward.',
      'Failing my first coding competition was devastating, but it taught me to focus on learning rather than just winning. I completely changed how I approach challenges.',
      'Working with elderly residents at the nursing home made me realize I wanted to study something that directly helps people, not just pursue prestige.',
      'Joining the theater despite my shyness was terrifying, but it taught me that growth happens outside your comfort zone.'
    ]);
    
    // Use the new structured format
    setEssayIdeas(MOCK_STRUCTURED_ESSAYS);
    setGenerationMetadata(MOCK_METADATA);
    setIsProfileComplete(true);
    setIsDiscoveryComplete(true);
  };

  const contextValue: StoryContextType = {
    profileData,
    updateProfileData,
    isProfileComplete,
    isDiscoveryComplete,
    generatedQuestions,
    questionResponses,
    updateQuestionResponses,
    essayIdeas,
    generationMetadata,
    isGeneratingQuestions,
    isGeneratingEssays,
    generateQuestions,
    generateEssayIdeas,
    completeProfile,
    completeDiscovery,
    skipToDiscovery,
    skipToResults,
    resetEssayGeneration,
  };

  return (
    <StoryContext.Provider value={contextValue}>
      {children}
    </StoryContext.Provider>
  );
};