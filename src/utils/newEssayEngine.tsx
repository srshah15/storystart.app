import { PROMPTS_DATA } from '../data/prompts.tsx';

// Type Definitions
interface PromptType {
  id: string;
  prompt: string;
  tags: string[];
  school: string;
  required?: boolean;
}

interface CategoryType {
  name: string;
  description: string;
  keywords: string[];
  weight: number;
  key?: string;
}

interface ProfileData {
  colleges?: string[];
  major?: string;
  activities?: { name: string; description: string }[];
  personalValues?: string[];
}

type QuestionResponses = string[];

// Enhanced semantic categories for better prompt grouping
const SEMANTIC_CATEGORIES: Record<string, CategoryType> = {
  IDENTITY_BACKGROUND: {
    name: "Identity & Background",
    description: "Who you are, where you come from, what makes you unique",
    keywords: ["identity", "background", "diversity", "culture", "personal", "heritage"],
    weight: 1.0
  },
  CHALLENGE_GROWTH: {
    name: "Overcoming Challenges",
    description: "Times you faced obstacles, failed, learned, and grew",
    keywords: ["challenge", "resilience", "growth", "failure", "obstacle", "perseverance"],
    weight: 1.0
  },
  INTELLECTUAL_CURIOSITY: {
    name: "Academic Passion & Learning",
    description: "What excites you intellectually and drives your learning",
    keywords: ["academic", "curiosity", "passion", "learning", "research", "knowledge"],
    weight: 1.0
  },
  LEADERSHIP_IMPACT: {
    name: "Leadership & Making Impact",
    description: "How you lead, influence others, and create positive change",
    keywords: ["leadership", "impact", "initiative", "influence", "change", "responsibility"],
    weight: 1.0
  },
  COMMUNITY_SERVICE: {
    name: "Community & Service",
    description: "Your connections to communities and commitment to helping others",
    keywords: ["community", "service", "volunteer", "help", "civic", "social"],
    weight: 1.0
  },
  VALUES_BELIEFS: {
    name: "Values & Moral Reasoning",
    description: "What you believe in and how you navigate ethical decisions",
    keywords: ["values", "beliefs", "ethics", "morals", "principles", "conviction"],
    weight: 1.0
  },
  RELATIONSHIPS_COLLABORATION: {
    name: "Relationships & Teamwork",
    description: "How you connect with others and work collaboratively",
    keywords: ["relationships", "collaboration", "teamwork", "communication", "empathy"],
    weight: 1.0
  },
  FUTURE_GOALS: {
    name: "Future Goals & Vision",
    description: "Your aspirations, career goals, and vision for your future",
    keywords: ["goals", "future", "vision", "career", "aspiration", "ambition"],
    weight: 1.0
  },
  SCHOOL_FIT: {
    name: "Why This School",
    description: "Why you want to attend specific institutions",
    keywords: ["fit", "why_this_school", "resources", "programs", "culture"],
    weight: 0.8 // Lower weight as these are more school-specific
  },
  CREATIVE_PERSONAL: {
    name: "Creative & Personal Expression",
    description: "Your creative side, hobbies, and personal interests",
    keywords: ["creative", "art", "music", "hobby", "expression", "talent"],
    weight: 0.9
  }
};

// Utility function to normalize school names
const normalizeSchoolName = (schoolName: string): string => {
  const normalizations: Record<string, string> = {
    'ucla': 'UCLA',
    'uc berkeley': 'UC Berkeley', 
    'berkeley': 'UC Berkeley',
    'usc': 'USC',
    'nyu': 'NYU',
    'northwestern': 'Northwestern',
    'unc chapel-hill': 'UNC Chapel-Hill',
    'unc': 'UNC Chapel-Hill',
    'cornell': 'Cornell',
    'dartmouth': 'Dartmouth',
    'brown': 'Brown',
    'upenn': 'UPenn'
  };
  
  const lower = schoolName.toLowerCase().trim();
  return normalizations[lower] || schoolName;
};

// 1. SEMANTIC PROMPT ANALYZER
class PromptAnalyzer {
  semanticCache: Map<string, number> = new Map();

  constructor() {}

  // Calculate semantic similarity between prompt and category
  calculateSemanticScore(prompt: PromptType, category: CategoryType): number {
    const cacheKey = `${prompt.id}_${category.name}`;
    if (this.semanticCache.has(cacheKey)) {
      return this.semanticCache.get(cacheKey)!;
    }

    const promptText = prompt.prompt.toLowerCase();
    const promptTags = prompt.tags.map(t => t.toLowerCase());
    
    // Count keyword matches in prompt text
    const textMatches = category.keywords.filter(keyword => 
      promptText.includes(keyword.toLowerCase())
    ).length;
    
    // Count tag overlaps
    const tagMatches = category.keywords.filter(keyword =>
      promptTags.some(tag => tag.includes(keyword) || keyword.includes(tag))
    ).length;
    
    // Calculate weighted score
    const textScore = textMatches / category.keywords.length;
    const tagScore = tagMatches / category.keywords.length;
    const combinedScore = (textScore * 0.6 + tagScore * 0.4) * category.weight;
    
    this.semanticCache.set(cacheKey, combinedScore);
    return combinedScore;
  }

  // Find the best semantic category for a prompt
  categorizePrompt(prompt: PromptType): { category: CategoryType | null; score: number; prompt: PromptType } {
    let bestCategory: CategoryType | null = null;
    let bestScore = 0;
    
    Object.entries(SEMANTIC_CATEGORIES).forEach(([key, category]) => {
      const score = this.calculateSemanticScore(prompt, category);
      if (score > bestScore) {
        bestScore = score;
        bestCategory = { ...category, key };
      }
    });
    
    return {
      category: bestCategory,
      score: bestScore,
      prompt: prompt
    };
  }
}

// 2. INTELLIGENT PROMPT GROUPER
class PromptGrouper {
  analyzer: PromptAnalyzer;

  constructor(analyzer: PromptAnalyzer) {
    this.analyzer = analyzer;
  }

  // Group prompts by semantic similarity and practical considerations
  groupPrompts(prompts: PromptType[]): { 
    id: string; 
    category: CategoryType; 
    prompts: PromptType[]; 
    type: string; 
  }[] {
    console.log('🔍 Starting intelligent prompt grouping...');
    
    // Step 1: Categorize all prompts
    const categorizedPrompts = prompts.map(prompt => 
      this.analyzer.categorizePrompt(prompt)
    );
    
    // Step 2: Group by semantic categories
    const categoryGroups: Record<string, { category: CategoryType; prompts: PromptType[] }> = {};
    categorizedPrompts.forEach(item => {
      const categoryKey = item.category?.key || 'UNCATEGORIZED';
      if (!categoryGroups[categoryKey]) {
        categoryGroups[categoryKey] = {
          category: item.category || { name: 'Uncategorized', description: 'Mixed prompts', keywords: [], weight: 1 },
          prompts: []
        };
      }
      categoryGroups[categoryKey].prompts.push(item.prompt);
    });
    
    // Step 3: Further subdivide large groups by school type and specificity
    const refinedGroups: { id: string; category: CategoryType; prompts: PromptType[]; type: string }[] = [];
    Object.entries(categoryGroups).forEach(([categoryKey, group]) => {
      if (group.prompts.length <= 3) {
        // Small groups stay together
        refinedGroups.push({
          id: `group_${refinedGroups.length + 1}`,
          category: group.category,
          prompts: group.prompts,
          type: 'semantic'
        });
      } else {
        // Split large groups by Common App vs School-specific
        const commonAppPrompts = group.prompts.filter(p => p.school === 'Common App');
        const schoolSpecificPrompts = group.prompts.filter(p => p.school !== 'Common App');
        
        if (commonAppPrompts.length > 0) {
          refinedGroups.push({
            id: `group_${refinedGroups.length + 1}`,
            category: { ...group.category, name: `${group.category.name} (Common App)` },
            prompts: commonAppPrompts,
            type: 'common_app'
          });
        }
        
        if (schoolSpecificPrompts.length > 0) {
          // Further group school-specific by similar phrasing/intent
          const schoolGroups = this.clusterSimilarPrompts(schoolSpecificPrompts);
          schoolGroups.forEach(schoolGroup => {
            refinedGroups.push({
              id: `group_${refinedGroups.length + 1}`,
              category: { ...group.category, name: `${group.category.name} (School-Specific)` },
              prompts: schoolGroup,
              type: 'school_specific'
            });
          });
        }
      }
    });
    
    console.log(`📊 Created ${refinedGroups.length} intelligent prompt groups`);
    refinedGroups.forEach((group, i) => {
      console.log(`Group ${i + 1}: ${group.category.name} (${group.prompts.length} prompts)`);
      group.prompts.forEach(p => console.log(`  - ${p.school}: ${p.prompt.substring(0, 50)}...`));
    });
    
    return refinedGroups;
  }

  // Cluster similar prompts using text similarity
  clusterSimilarPrompts(prompts: PromptType[]): PromptType[][] {
    if (prompts.length <= 2) return [prompts];
    
    const clusters: PromptType[][] = [];
    const used = new Set<number>();
    
    prompts.forEach((prompt, i) => {
      if (used.has(i)) return;
      
      const cluster: PromptType[] = [prompt];
      used.add(i);
      
      // Find similar prompts
      prompts.forEach((otherPrompt, j) => {
        if (i !== j && !used.has(j)) {
          const similarity = this.calculateTextSimilarity(prompt.prompt, otherPrompt.prompt);
          if (similarity > 0.4) { // Threshold for similarity
            cluster.push(otherPrompt);
            used.add(j);
          }
        }
      });
      
      clusters.push(cluster);
    });
    
    return clusters;
  }

  calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const words2 = text2.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return union.length === 0 ? 0 : intersection.length / union.length;
  }
}

// 3. STRATEGIC STORY GENERATOR
interface GeneratedStory {
  id: string;
  title: string;
  coreExperience: string;
  keyActions: string;
  outcomesAndGrowth: string;
  universalThemes: string;
  adaptationNotes: string;
  rawContent: string;
  groupId?: string;
  category?: CategoryType;
  coveredPrompts?: string[];
  schools?: string[];
}

class StoryGenerator {
  generatedStories: GeneratedStory[] = [];

  constructor() {}

  // Generate one strategic story per prompt group
  async generateStoriesForGroups(
    promptGroups: { id: string; category: CategoryType; prompts: PromptType[]; type: string }[], 
    profileData: ProfileData, 
    questionResponses: QuestionResponses
  ): Promise<GeneratedStory[]> {
    console.log('🎯 Generating strategic stories for groups...');
    
    const results: GeneratedStory[] = [];
    
    for (const group of promptGroups) {
      try {
        console.log(`\n--- Generating story for: ${group.category.name} ---`);
        
        const story = await this.generateGroupStory(group, profileData, questionResponses);
        if (story) {
          results.push({
            ...story,
            groupId: group.id,
            category: group.category,
            coveredPrompts: group.prompts.map(p => p.id),
            schools: [...new Set(group.prompts.map(p => p.school))]
          });
        }
      } catch (error) {
        console.error(`Failed to generate story for group ${group.id}:`, error);
      }
    }
    
    return results;
  }

  async generateGroupStory(
    group: { id: string; category: CategoryType; prompts: PromptType[]; type: string }, 
    profileData: ProfileData, 
    questionResponses: QuestionResponses
  ): Promise<GeneratedStory | null> {
    const systemPrompt = this.createGroupSystemPrompt(group);
    const userPrompt = this.createGroupUserPrompt(group, profileData, questionResponses);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const storyText = data.choices[0].message.content;
      
      return this.parseGeneratedStory(storyText, group);
      
    } catch (error) {
      console.error('Story generation failed:', error);
      return null;
    }
  }

  createGroupSystemPrompt(group: { category: CategoryType }): string {
    return `You are an expert college admissions counselor creating a SINGLE strategic essay story that addresses MULTIPLE similar college prompts simultaneously.

MISSION: Create ONE compelling, specific story that can effectively answer ALL the prompts in this group: "${group.category.name}"

KEY PRINCIPLES:
1. Choose ONE specific, impactful moment/experience from the student's life
2. Ensure the story naturally addresses the core themes of ALL prompts in this group
3. Make it specific, personal, and authentic - avoid generic responses
4

3. Make it specific, personal, and authentic - avoid generic responses
4. Focus on concrete actions, specific outcomes, and genuine growth
5. The story should be adaptable to answer each prompt while maintaining authenticity

STORY REQUIREMENTS:
- Specific moment in time with clear setting and context
- Concrete challenge or situation that required action
- Specific actions the student took (show, don't tell)
- Measurable outcomes and personal insights gained
- Universal themes that connect to multiple prompt variations

Format your response as:

**Story Title:** [Compelling, specific title]
**Core Experience:** [2-3 sentences describing the specific situation/moment]
**Key Actions:** [Specific things the student did - concrete and measurable]
**Outcomes & Growth:** [What happened as a result and what they learned]
**Universal Themes:** [How this story addresses the group's core themes]
**Adaptation Notes:** [Brief notes on how to adapt this story for different prompt phrasings]

Generate exactly ONE strategic story that maximizes coverage and authenticity.`;
  }

  createGroupUserPrompt(
    group: { prompts: PromptType[]; category: CategoryType },
    profileData: ProfileData,
    questionResponses: QuestionResponses
  ): string {
    return `STUDENT PROFILE:
Target Colleges: ${profileData.colleges?.join(', ') || 'Multiple colleges'}
Major: ${profileData.major || 'Undecided'}
Activities: ${profileData.activities?.map(a => `${a.name}: ${a.description}`).join(' | ') || 'Various activities'}
Values: ${profileData.personalValues?.join(', ') || 'Not specified'}

PROMPTS TO ADDRESS (create ONE story that works for ALL):
${group.prompts
  .map(
    (prompt, i) =>
      `${i + 1}. [${prompt.school}] ${prompt.prompt}`
  )
  .join('\n')}

STUDENT RESPONSES TO DISCOVERY QUESTIONS:
${questionResponses?.slice(0, 3).join('\n\n') || 'Student responses will inform the story direction'}

CATEGORY FOCUS: ${group.category.description}

Create ONE strategic story that naturally addresses the core intent of ALL these prompts. The story should be specific, authentic, and adaptable to different prompt phrasings while maintaining its essential truth and impact.`;
  }

  parseGeneratedStory(storyText: string, group: { category: CategoryType }): GeneratedStory {
    const titleMatch = storyText.match(/\*\*Story Title:\*\*\s*(.+?)(?=\n|$)/);
    const experienceMatch = storyText.match(/\*\*Core Experience:\*\*\s*([\s\S]+?)(?=\n\*\*|$)/);
    const actionsMatch = storyText.match(/\*\*Key Actions:\*\*\s*([\s\S]+?)(?=\n\*\*|$)/);
    const outcomesMatch = storyText.match(/\*\*Outcomes & Growth:\*\*\s*([\s\S]+?)(?=\n\*\*|$)/);
    const themesMatch = storyText.match(/\*\*Universal Themes:\*\*\s*([\s\S]+?)(?=\n\*\*|$)/);
    const adaptationMatch = storyText.match(/\*\*Adaptation Notes:\*\*\s*([\s\S]+?)(?=\n\*\*|$)/);

    return {
      id: `story_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: titleMatch ? titleMatch[1].trim() : `Story for ${group.category.name}`,
      coreExperience: experienceMatch ? experienceMatch[1].trim() : '',
      keyActions: actionsMatch ? actionsMatch[1].trim() : '',
      outcomesAndGrowth: outcomesMatch ? outcomesMatch[1].trim() : '',
      universalThemes: themesMatch ? themesMatch[1].trim() : '',
      adaptationNotes: adaptationMatch ? adaptationMatch[1].trim() : '',
      rawContent: storyText
    };
  }
}

// 4. COVERAGE ANALYZER
class CoverageAnalyzer {
  analyzeResults(
    stories: GeneratedStory[], 
    targetColleges: string[], 
    allPrompts: PromptType[]
  ) {
    console.log('📈 Analyzing final coverage...');

    const normalizedTargets = targetColleges.map(normalizeSchoolName);

    // Get relevant prompts for target colleges
    const relevantPrompts = allPrompts.filter(prompt => {
      if (prompt.school === 'Common App' && prompt.required) return true;

      return normalizedTargets.some(target => {
        const targetLower = target.toLowerCase();
        const schoolLower = prompt.school.toLowerCase();
        return targetLower === schoolLower || 
               targetLower.includes(schoolLower) || 
               schoolLower.includes(targetLower);
      }) && prompt.required;
    });

    // Calculate coverage
    const allCoveredPromptIds = new Set<string>();
    stories.forEach(story => {
      story.coveredPrompts?.forEach(id => allCoveredPromptIds.add(id));
    });

    const uncoveredPrompts = relevantPrompts.filter(p => !allCoveredPromptIds.has(p.id));
    const coveragePercentage = relevantPrompts.length > 0 ? 
      Math.round(((relevantPrompts.length - uncoveredPrompts.length) / relevantPrompts.length) * 100) : 100;

    return {
      totalStories: stories.length,
      relevantPrompts: relevantPrompts.length,
      coveredPrompts: allCoveredPromptIds.size,
      uncoveredPrompts,
      coveragePercentage,
      efficiency: relevantPrompts.length > 0 ? 
        Math.round((allCoveredPromptIds.size / stories.length) * 100) / 100 : 0,
      stories: stories.map(story => ({
        ...story,
        promptsCovered: story.coveredPrompts?.length || 0,
        schoolsCovered: story.schools?.length || 0
      }))
    };
  }
}

// 5. MAIN ORCHESTRATOR
export class EssayGenerationEngine {
  analyzer: PromptAnalyzer;
  grouper: PromptGrouper;
  generator: StoryGenerator;
  coverageAnalyzer: CoverageAnalyzer;

  constructor() {
    this.analyzer = new PromptAnalyzer();
    this.grouper = new PromptGrouper(this.analyzer);
    this.generator = new StoryGenerator();
    this.coverageAnalyzer = new CoverageAnalyzer();
  }

  async generateStrategicEssays(profileData: ProfileData, questionResponses: QuestionResponses) {
    console.log('🚀 Starting strategic essay generation...');
    console.log('Target colleges:', profileData.colleges);

    try {
      // Step 1: Get relevant prompts for target colleges
      const relevantPrompts = this.getRelevantPrompts(profileData.colleges || []);
      console.log(`Found ${relevantPrompts.length} relevant prompts`);

      // Step 2: Group prompts intelligently
      const promptGroups = this.grouper.groupPrompts(relevantPrompts);
      console.log(`Created ${promptGroups.length} strategic groups`);

      // Step 3: Generate one story per group
      const stories = await this.generator.generateStoriesForGroups(
        promptGroups,
        profileData,
        questionResponses
      );
      console.log(`Generated ${stories.length} strategic stories`);

      // Step 4: Analyze coverage and efficiency
      const analysis = this.coverageAnalyzer.analyzeResults(
        stories,
        profileData.colleges || [],
        PROMPTS_DATA.essays
      );

      console.log('🎯 Generation Complete:');
      console.log(`- Stories: ${analysis.totalStories}`);
      console.log(`- Coverage: ${analysis.coveragePercentage}%`);
      console.log(`- Efficiency: ${analysis.efficiency} prompts per story`);

      return {
        success: true,
        stories: analysis.stories,
        metadata: {
          totalGroups: promptGroups.length,
          totalStories: stories.length,
          coveragePercentage: analysis.coveragePercentage,
          efficiency: analysis.efficiency,
          uncoveredPrompts: analysis.uncoveredPrompts,
          timestamp: new Date()
        }
      };

    } catch (error: any) {
      console.error('Essay generation failed:', error);
      return {
        success: false,
        error: error.message,
        stories: [],
        metadata: null
      };
    }
  }

  getRelevantPrompts(targetColleges: string[]): PromptType[] {
    const normalizedTargets = targetColleges.map(normalizeSchoolName);

    return PROMPTS_DATA.essays.filter(prompt => {
      // Always include required Common App prompts
      if (prompt.school === 'Common App' && prompt.required) return true;

      // Include school-specific required prompts for target colleges
      const isTargetSchool = normalizedTargets.some(target => {
        const targetLower = target.toLowerCase();
        const schoolLower = prompt.school.toLowerCase();
        return targetLower === schoolLower ||
               targetLower.includes(schoolLower) ||
               schoolLower.includes(targetLower);
      });

      return isTargetSchool && prompt.required;
    });
  }
}

// Export the main function for backward compatibility
export const generateEssayIdeasWithGuaranteedCoverage = async (
  profileData: ProfileData,
  questionResponses: QuestionResponses
) => {
  const engine = new EssayGenerationEngine();
  return await engine.generateStrategicEssays(profileData, questionResponses);
};

// Legacy parsing function for compatibility with existing UI
export const parseStrategicEssaysWithTags = (essayText: string, targetColleges: string[]) => {
  // This would be called by the UI component, but the new system returns structured data
  // So we'll convert the structured stories back to the expected format
  console.log('Legacy parsing called - using structured data instead');
  return [];
};
