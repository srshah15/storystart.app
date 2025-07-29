import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

const StoryContext = createContext<StoryContextType | null>(null);

export const useStoryContext = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStoryContext must be used within a StoryProvider');
  }
  return context;
};

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
          model: 'gpt-4',
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
  const generateEssayIdeas = async (): Promise<boolean> => {
    console.log('=== GENERATING ESSAY IDEAS ===');
    console.log('Questions:', generatedQuestions);
    console.log('Responses:', questionResponses);

    const systemPrompt = `You are an expert college admissions counselor who helps students craft compelling college essays.

Given a student's profile data and their responses to reflection questions, generate 3-5 specific, concrete essay ideas that would make strong college application essays.

For each essay idea, provide:
1. A clear essay topic/theme
2. The specific story/experience to focus on
3. Key message or insight to convey
4. Why this story showcases their unique qualities
5. Which colleges/majors this would appeal to most

Focus on authentic, personal stories that reveal character growth, values in action, intellectual curiosity, leadership potential, and unique perspectives. Avoid cliché topics unless there's a truly unique angle.

Format each idea clearly with headers and bullet points for easy reading.`;

    const userPrompt = `STUDENT PROFILE:
Target Colleges: ${profileData.colleges.join(', ')}
Intended Major: ${profileData.major}
Background: ${profileData.background.join(', ')}
Activities: ${profileData.activities.map(a => `${a.name} (${a.hours}hrs/week): ${a.description}`).join(' | ')}
Awards: ${profileData.awards.map(a => `${a.name} (${a.level}): ${a.description}`).join(' | ')}
Values: ${profileData.personalValues.join(', ')}
Personality: ${profileData.personalityTraits.join(', ')}
Learning Style: ${profileData.learningStyle}
Leadership Style: ${profileData.leadershipStyle}
Motivations: ${profileData.motivations.join(', ')}
Social Impact Areas: ${profileData.socialImpactAreas.join(', ')}

REFLECTION QUESTIONS AND RESPONSES:
${questionResponses.map((response, index) => {
  const questionLines = generatedQuestions.split('\n').filter(line => line.trim());
  const questionText = questionLines[index] ? questionLines[index].replace(/^\d+\.\s*/, '') : `Question ${index + 1}`;
  return `Q${index + 1}: ${questionText}\nA${index + 1}: ${response}`;
}).join('\n\n')}

Based on this comprehensive information, please generate 3-5 compelling college essay ideas with detailed explanations for each.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const ideas = data.choices[0].message.content;
      
      console.log('=== GENERATED ESSAY IDEAS ===');
      console.log(ideas);
      
      setEssayIdeas(ideas);
      return true;

    } catch (error) {
      console.error('Error generating essay ideas:', error);
      return false;
    }
  };

  // Completion helpers
  const completeProfile = () => {
    setIsProfileComplete(true);
  };

  const completeDiscovery = () => {
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
  };

  return (
    <StoryContext.Provider value={contextValue}>
      {children}
    </StoryContext.Provider>
  );
};