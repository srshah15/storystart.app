import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  generateEssayIdeasWithTags,
  parseStrategicEssaysWithTags 
} from '../utils/tagBasedMatching';


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
  
  // Final results
  essayIdeas: string;
  
  // API functions
  generateQuestions: () => Promise<boolean>;
  generateEssayIdeas: () => Promise<boolean>;
  
  // Navigation helpers
  completeProfile: () => void;
  completeDiscovery: () => void;
  
  // Testing helpers
  skipToDiscovery: () => void;
  skipToResults: () => void;
}

const StoryContext = createContext<StoryContextType | null>(null);

export const useStoryContext = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStoryContext must be used within a StoryProvider');
  }
  return context;
};

// Mock data for testing
const MOCK_QUESTIONS = `1. Describe a time when you faced a significant challenge in one of your extracurricular activities. How did you overcome it, and what did you learn about yourself?

2. Tell us about a moment when your personal values were tested or came into conflict with what others expected of you. How did you handle the situation?

3. Think about a project or initiative where you took on a leadership role. What obstacles did you encounter, and how did your leadership style evolve through the experience?

4. Describe a time when you failed at something important to you. How did you process that failure, and what changes did you make as a result?

5. Tell us about an experience that made you question or refine your academic or career goals. What insights did you gain about yourself?

6. Describe a moment when you had to step outside your comfort zone. What motivated you to take that risk, and how did it change your perspective?`;

const MOCK_ESSAY_IDEAS = `## Essay Idea #1: The Algorithm That Taught Me Empathy
**Topic/Theme:** How debugging a coding project revealed the importance of understanding different perspectives
**Specific Story:** Your experience troubleshooting a collaborative coding project where technical solutions weren't enough - you had to understand your teammates' different approaches and communication styles
**Key Message:** Technical skills are enhanced by emotional intelligence and collaborative problem-solving
**Why It Works:** Shows intellectual curiosity, growth mindset, and leadership potential
**Best For:** Computer Science programs at MIT, Stanford, and UC Berkeley

## Essay Idea #2: From Debate Stage to Community Garden
**Topic/Theme:** How competitive debate skills translated into grassroots community organizing
**Specific Story:** Using research and persuasion techniques from debate to rally community support for a local environmental initiative
**Key Message:** Academic skills have real-world applications in creating positive change
**Why It Works:** Demonstrates civic engagement, practical application of learning, and environmental consciousness
**Best For:** Political Science and Environmental Studies programs, particularly at schools that value public service

## Essay Idea #3: The Art of Productive Failure
**Topic/Theme:** Learning to embrace failure as a learning tool through your journey with [specific activity]
**Specific Story:** A particular moment of failure in your most important extracurricular and how you systematically learned from it
**Key Message:** Resilience and analytical thinking are more valuable than perfection
**Why It Works:** Shows maturity, self-reflection, and growth mindset that colleges value
**Best For:** Competitive programs that appreciate students who can handle academic pressure

## Essay Idea #4: Teaching My Grandmother to Code
**Topic/Theme:** Bridging generational and technological divides through patience and creativity
**Specific Story:** The process of teaching an older family member a modern skill and what you both learned
**Key Message:** Learning is a two-way street that builds empathy and communication skills
**Why It Works:** Shows respect for others, innovative thinking, and ability to communicate complex ideas simply
**Best For:** Programs that value diversity of thought and inclusive leadership

## Essay Idea #5: The Quiet Leader
**Topic/Theme:** How your behind-the-scenes organizing style creates lasting impact
**Specific Story:** A time when your preference for collaborative facilitation over spotlight leadership led to a significant achievement
**Key Message:** Leadership comes in many forms, and sustainable change often happens through empowering others
**Why It Works:** Differentiates you from typical "student body president" essays while showing genuine leadership
**Best For:** Schools that value collaborative learning environments and servant leadership`;

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Results state
  const [essayIdeas, setEssayIdeas] = useState('');

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
      return true;

    } catch (error) {
      console.error('Error generating questions:', error);
      return false;
    }
  };

  // Generate essay ideas using OpenAI
  const generateEssayIdeas = async () => {
    const result = await generateEssayIdeasWithTags(
      profileData, 
      questionResponses, 
      generatedQuestions
    );
    
    if (result.success) {
      setEssayIdeas(result.rawResponse);
      return true;
    }
    return false;
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
    console.log('=== SKIPPING TO RESULTS (TESTING MODE) ===');
    setGeneratedQuestions(MOCK_QUESTIONS);
    setQuestionResponses([
      'I remember struggling with our robotics team when we kept failing at regionals. I had to learn that failure was part of the process and started breaking down problems differently.',
      'When my debate coach wanted me to argue a position I disagreed with, I had to choose between winning and my values. I found a way to argue ethically while still being competitive.',
      'Leading our environmental club taught me that not everyone responds to the same leadership style. I had to adapt and learn when to step back and when to step forward.',
      'Failing my first coding competition was devastating, but it taught me to focus on learning rather than just winning. I completely changed how I approach challenges.',
      'Working with elderly residents at the nursing home made me realize I wanted to study something that directly helps people, not just pursue prestige.',
      'Joining the theater despite my shyness was terrifying, but it taught me that growth happens outside your comfort zone.'
    ]);
    setEssayIdeas(MOCK_ESSAY_IDEAS);
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
    generateQuestions,
    generateEssayIdeas,
    completeProfile,
    completeDiscovery,
    skipToDiscovery,
    skipToResults,
  };

  return (
    <StoryContext.Provider value={contextValue}>
      {children}
    </StoryContext.Provider>
  );
};