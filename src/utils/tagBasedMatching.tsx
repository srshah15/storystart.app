import { PROMPTS_DATA } from '../data/prompts.tsx';

// 1. Extract all unique tags from prompts data
const extractAllTags = (promptsData) => {
  const allTags = new Set();
  promptsData.essays.forEach(essay => {
    essay.tags.forEach(tag => allTags.add(tag));
  });
  return Array.from(allTags).sort();
};

// All available tags from the prompts JSON
const ALL_TAGS = [
  "academic", "activities", "background", "balance", "challenge-belief", 
  "collaboration", "communication", "community", "contribution", "curiosity", 
  "dialogue", "diversity", "equity", "experience", "fit", "future", "goals", 
  "gratitude", "growth", "history", "identity", "impact", "influence", 
  "initiative", "innovation", "leadership", "open", "passion", "personal", 
  "reflection", "relationships", "resilience", "self-awareness", "service", 
  "society", "values", "vision", "why_this_school"
];

// 2. Updated system prompt for AI essay generation
const createEssayGenerationPrompt = (profileData, questionResponses, generatedQuestions) => {
  const systemPrompt = `You are an expert college admissions counselor who helps students craft compelling college essays.

Given a student's profile data and their responses to reflection questions, generate 3-5 specific, concrete essay ideas that would make strong college application essays.

For each essay idea, you MUST include a "Tags" field that lists which essay themes this story would best address from this list:

AVAILABLE TAGS: ${ALL_TAGS.join(', ')}

For each essay idea, provide:
1. A clear essay topic/theme
2. The specific story/experience to focus on
3. Key message or insight to convey
4. Why this story showcases their unique qualities
5. **Tags: 2-4 tags from the available list that this essay best addresses**

Format each idea like this:
## Essay Idea #1: [Title]
**Topic/Theme:** [Theme description]
**Specific Story:** [Detailed story focus]
**Key Message:** [Core message/insight]
**Why It Works:** [Why this showcases student's qualities]
**Tags:** tag1, tag2, tag3

Focus on authentic, personal stories that reveal character growth, values in action, intellectual curiosity, and unique perspectives.`;

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

Based on this comprehensive information, please generate 3-5 compelling college essay ideas with detailed explanations and appropriate tags for each.`;

  return { systemPrompt, userPrompt };
};

// 3. Parse AI response and extract tags
const parseStrategicEssaysWithTags = (essayText) => {
  if (!essayText) return [];

  // Split by essay sections
  const essayMatches = essayText.match(/## Essay Idea #\d+:.*?(?=## Essay Idea #\d+:|$)/gs);
  
  if (!essayMatches) return [];

  return essayMatches.map((section, index) => {
    console.log(`Processing section ${index + 1}:`, section);
    
    // Extract title
    const titleMatch = section.match(/## Essay Idea #\d+:\s*(.+?)(?=\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : `Essay Idea ${index + 1}`;
    
    // Extract theme
    const themeMatch = section.match(/\*\*Topic\/Theme:\*\*\s*(.+?)(?=\n|$)/);
    const theme = themeMatch ? themeMatch[1].trim() : 'Personal Growth';
    
    // Extract specific story
    const storyMatch = section.match(/\*\*Specific Story:\*\*\s*(.+?)(?=\n\*\*|$)/s);
    const storyFocus = storyMatch ? storyMatch[1].trim() : '';
    
    // Extract key message
    const messageMatch = section.match(/\*\*Key Message:\*\*\s*(.+?)(?=\n\*\*|$)/s);
    const keyMessage = messageMatch ? messageMatch[1].trim() : '';
    
    // Extract why it works
    const whyMatch = section.match(/\*\*Why It Works:\*\*\s*(.+?)(?=\n\*\*|$)/s);
    const whyItWorks = whyMatch ? whyMatch[1].trim() : '';
    
    // Extract tags - THIS IS THE KEY NEW PART
    const tagsMatch = section.match(/\*\*Tags:\*\*\s*(.+?)(?=\n|$)/);
    const essayTags = tagsMatch ? 
      tagsMatch[1].split(',').map(tag => tag.trim().toLowerCase()) : [];
    
    // Validate tags against our known tags
    const validTags = essayTags.filter(tag => 
      ALL_TAGS.map(t => t.toLowerCase()).includes(tag)
    );
    
    console.log(`Essay ${index + 1} tags:`, validTags);

    return {
      id: `essay_${index + 1}`,
      title,
      theme,
      storyFocus,
      keyMessage,
      whyItWorks,
      tags: validTags, // AI-assigned tags
      coveredPrompts: findMatchingPrompts(validTags), // Computed prompt matches
      fullContent: section,
      estimatedWordCount: '500-650 words'
    };
  });
};

// 4. Map essay tags to matching prompts
const findMatchingPrompts = (essayTags, promptsData = PROMPTS_DATA) => {
  return promptsData.essays
    .filter(prompt => {
      // Check if essay tags overlap with prompt tags
      return prompt.tags.some(promptTag => 
        essayTags.includes(promptTag.toLowerCase())
      );
    })
    .map(prompt => prompt.id);
};

// 5. Analyze coverage and gaps
const analyzePromptCoverage = (essays, targetColleges, promptsData = PROMPTS_DATA) => {
  // Get all required prompts for target colleges
  const relevantPrompts = promptsData.essays.filter(prompt =>
    (prompt.school === 'Common App' || targetColleges.includes(prompt.school)) && prompt.required
  );
  
  // Get all covered prompts
  const coveredPromptIds = new Set();
  essays.forEach(essay => {
    essay.coveredPrompts.forEach(promptId => coveredPromptIds.add(promptId));
  });
  
  // Find uncovered prompts
  const uncoveredPrompts = relevantPrompts.filter(prompt => 
    !coveredPromptIds.has(prompt.id)
  );
  
  // Calculate coverage percentage
  const coveragePercentage = relevantPrompts.length > 0 ? 
    Math.round(((relevantPrompts.length - uncoveredPrompts.length) / relevantPrompts.length) * 100) : 100;
  
  return {
    relevantPrompts,
    coveredPrompts: Array.from(coveredPromptIds),
    uncoveredPrompts,
    coveragePercentage
  };
};

// 6. Enhanced tag-to-prompt debugging
const debugTagMatching = (essay, promptsData = PROMPTS_DATA) => {
  console.log(`\n=== TAG MATCHING DEBUG for "${essay.title}" ===`);
  console.log('Essay tags:', essay.tags);
  
  essay.coveredPrompts.forEach(promptId => {
    const prompt = promptsData.essays.find(p => p.id === promptId);
    if (prompt) {
      const matchingTags = prompt.tags.filter(tag => 
        essay.tags.includes(tag.toLowerCase())
      );
      console.log(`✓ Matches ${prompt.school} - ${prompt.id}:`);
      console.log(`  Prompt tags: ${prompt.tags.join(', ')}`);
      console.log(`  Matching tags: ${matchingTags.join(', ')}`);
    }
  });
  
  console.log(`Total prompts covered: ${essay.coveredPrompts.length}`);
};

// 7. Updated StoryContext integration
const generateEssayIdeasWithTags = async (profileData, questionResponses, generatedQuestions) => {
  console.log('=== GENERATING ESSAY IDEAS WITH TAGS ===');
  
  const { systemPrompt, userPrompt } = createEssayGenerationPrompt(
    profileData, 
    questionResponses, 
    generatedQuestions
  );

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
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const ideas = data.choices[0].message.content;
    
    console.log('=== RAW AI RESPONSE ===');
    console.log(ideas);
    
    // Parse with new tag-based system
    const parsedEssays = parseStrategicEssaysWithTags(ideas);
    
    // Debug each essay's tag matching
    parsedEssays.forEach(essay => debugTagMatching(essay));
    
    // Analyze overall coverage
    const coverage = analyzePromptCoverage(parsedEssays, profileData.colleges);
    console.log('=== COVERAGE ANALYSIS ===');
    console.log(`Coverage: ${coverage.coveragePercentage}%`);
    console.log(`Covered: ${coverage.coveredPrompts.length} prompts`);
    console.log(`Gaps: ${coverage.uncoveredPrompts.length} prompts`);
    
    return {
      success: true,
      essays: parsedEssays,
      coverage: coverage,
      rawResponse: ideas
    };

  } catch (error) {
    console.error('Error generating essay ideas:', error);
    return { success: false, error: error.message };
  }
};

// 8. Mock data for testing with tags
const MOCK_ESSAY_IDEAS_WITH_TAGS = `## Essay Idea #1: The Algorithm That Taught Me Empathy
**Topic/Theme:** How debugging a coding project revealed the importance of understanding different perspectives
**Specific Story:** Your experience troubleshooting a collaborative coding project where technical solutions weren't enough - you had to understand your teammates' different approaches and communication styles
**Key Message:** Technical skills are enhanced by emotional intelligence and collaborative problem-solving
**Why It Works:** Shows intellectual curiosity, growth mindset, and leadership potential
**Tags:** academic, collaboration, communication, growth

## Essay Idea #2: From Debate Stage to Community Garden
**Topic/Theme:** How competitive debate skills translated into grassroots community organizing
**Specific Story:** Using research and persuasion techniques from debate to rally community support for a local environmental initiative
**Key Message:** Academic skills have real-world applications in creating positive change
**Why It Works:** Demonstrates civic engagement, practical application of learning, and environmental consciousness
**Tags:** community, service, leadership, initiative

## Essay Idea #3: The Art of Productive Failure
**Topic/Theme:** Learning to embrace failure as a learning tool through your journey with robotics
**Specific Story:** A particular moment of failure in robotics competition and how you systematically learned from it
**Key Message:** Resilience and analytical thinking are more valuable than perfection
**Why It Works:** Shows maturity, self-reflection, and growth mindset that colleges value
**Tags:** resilience, growth, reflection, challenge-belief`;

// Export for use in components
export {
  ALL_TAGS,
  createEssayGenerationPrompt,
  parseStrategicEssaysWithTags,
  findMatchingPrompts,
  analyzePromptCoverage,
  debugTagMatching,
  generateEssayIdeasWithTags,
  MOCK_ESSAY_IDEAS_WITH_TAGS
};